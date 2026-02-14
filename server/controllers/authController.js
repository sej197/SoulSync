import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import RiskScore from "../models/RiskScore.js";
import welcomeEmail from "../emails/welcomeEmail.js";
import transporter from "../config/nodemailer.js";

const register = async(req, res) => {
    const {username, email, password, gender, emergency_contacts, contact, age} = req.body;

    if(!username || !email || !password || !gender || !contact || !emergency_contacts){
        return res.status(400).json({
            message: "Please fill all the fields!"
        });
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
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
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        );

        res.cookie('token', token, {
            httpOnly: true, //makes it inaccessible at client side
            secure: process.env.NODE_ENV == 'production', //sent only over https in prod
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict', //allow cross-site cookies in production, strict in development
            maxAge: 2 * 60 * 60 * 1000 // 2 hrs in ms
        
        })

        const {subject, text} = welcomeEmail(user.username);

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject,
            text
        }
        transporter.sendMail(mailOptions).catch(error => {
            console.error("Error sending mail", err)

        });

        return res.json({
            message: "User registered successfully!"
        })
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error during registration process", error);
    }
}

const login = async(req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }
        const user = await User.findOne({email});
        
        if(!user){
            return res.status(400).json({
                message: "User doesn't exist"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
            return res.status(400).json({
                message: "Password is incorrect"
            })
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        );

        res.cookie('token', token, {
            httpOnly : true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 2 * 60 * 60 * 1000
        });
        return res.json({
            message: "Login successful"
        });
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error during login process", error);
    }
}

const logout = async(req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({
            message: "Logout successful"
        });
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error during logout", error);
    }
}

const isAuthenticated = async(req, res) => {
    try{
        if(!req.userId){
            return res.json({
                isAuthenticated: false,
            });
        }
        const user = await User.findById(req.userId).select('-password');//password not fetched even in hashed format

        if(!user){
            return res.json({
                isAuthenticated: false
            });
        }

        return res.json({
            isAuthenticated: true,
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                age: user.age,
                badges: user.badges
            }
        });
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error checking authentication status", error);
    }
}

export {register, logout, login, isAuthenticated};