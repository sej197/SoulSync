import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import RiskScore from "../models/RiskScore.js";
import welcomeEmail from "../emails/welcomeEmail.js";
import transporter from "../config/nodemailer.js";
import { setCache, getCache, deleteCache, invalidateUserCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";

const register = async (req, res) => {
    const { username, email, password, gender, emergency_contacts, contact, age } = req.body;

    if (!username || !email || !password || !gender || !contact || !emergency_contacts) {
        return res.status(400).json({
            message: "Please fill all the fields!"
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this mail already exist!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            gender,
            contact,
            emergency_contacts,
            age
        });
        await user.save();

        const risk = new RiskScore({
            user: user._id
        });
        await risk.save();
        console.log("User and risk score initialized successfully", risk);

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '2D' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 2 * 24 * 60 * 60 * 1000
        })

        const { subject, text } = welcomeEmail(user.username);

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject,
            text
        }
        transporter.sendMail(mailOptions).catch(error => {
            console.error("Error sending mail", error)
        });

        // Cache the new user
        await setCache(cacheKeys.user(user._id), {
            id: user._id,
            name: user.username,
            email: user.email,
            age: user.age,
            badges: user.badges,
            gender: user.gender,
            contact: user.contact,
            emergency_contacts: user.emergency_contacts,
            communities: user.communities,
            streak: user.streak,
        }, 7200); // 2 hours

        return res.json({
            message: "User registered successfully!"
        })
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.error("Error during registration process", error);
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User doesn't exist"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Password is incorrect"
            })
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '2D' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 2 * 24 * 60 * 60 * 1000
        });

        // Check for badges (retroactive check)
        await checkAndAwardBadges(user._id);

        // Cache the authenticated user
        await setCache(cacheKeys.user(user._id), {
            id: user._id,
            name: user.username,
            email: user.email,
            age: user.age,
            badges: user.badges,
            gender: user.gender,
            contact: user.contact,
            emergency_contacts: user.emergency_contacts,
            communities: user.communities,
            streak: user.streak,
        }, 7200);

        return res.json({
            message: "Login successful"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.error("Error during login process", error);
    }
}

const logout = async (req, res) => {
    try {
        // Clear user cache on logout
        if (req.userId) {
            await deleteCache(cacheKeys.user(req.userId));
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.error("Error during logout", error);
    }
}

const isAuthenticated = async (req, res) => {
    try {
        if (!req.userId) {
            return res.json({
                isAuthenticated: false,
            });
        }

        // Check cache first
        const cachedUser = await getCache(cacheKeys.user(req.userId));
        if (cachedUser) {
            return res.json({
                isAuthenticated: true,
                user: cachedUser
            });
        }

        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.json({
                isAuthenticated: false
            });
        }

        // Retroactive badge check
        await checkAndAwardBadges(user._id);

        const userData = {
            id: user._id,
            name: user.username,
            email: user.email,
            age: user.age,
            badges: user.badges,
            gender: user.gender,
            contact: user.contact,
            emergency_contacts: user.emergency_contacts,
            communities: user.communities,
            streak: user.streak,
        };

        // Cache the user
        await setCache(cacheKeys.user(req.userId), userData, 7200);

        return res.json({
            isAuthenticated: true,
            user: userData
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.error("Error checking authentication status", error);
    }
}

const updateProfile = async (req, res) => {
    const { username, age, contact, emergency_contacts, gender } = req.body;
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const updates = {};
        if (username) updates.username = username;
        if (age) updates.age = age;
        if (contact) updates.contact = contact;
        if (emergency_contacts) updates.emergency_contacts = emergency_contacts;
        if (gender) updates.gender = gender;

        const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');

        const userData = {
            id: updatedUser._id,
            name: updatedUser.username,
            email: updatedUser.email,
            age: updatedUser.age,
            badges: updatedUser.badges,
            gender: updatedUser.gender,
            contact: updatedUser.contact,
            emergency_contacts: updatedUser.emergency_contacts,
            communities: updatedUser.communities,
            streak: updatedUser.streak,
        };

        // Invalidate and update cache
        await invalidateUserCache(req.userId);
        await setCache(cacheKeys.user(req.userId), userData, 7200);

        return res.json({
            message: "Profile updated successfully",
            user: userData
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.error("Error updating profile", error);
    }
}

export { register, logout, login, isAuthenticated, updateProfile };