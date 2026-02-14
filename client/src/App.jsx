import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthLayout from './components/layout/AuthLayout';
import BotDashboard from './pages/BotDashboard';
import About from './pages/About';
import ChatPage from './components/chatbot/ChatPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';

const Home = () => (
  <div className="hero min-h-screen bg-bloom-cream">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold font-serif text-bloom-primary">SoulSync</h1>
        <p className="py-6 text-gray-600 text-lg">Your journey to mental wellness starts here.</p>
        <a href="/login" className="btn bg-bloom-primary text-white border-none hover:bg-bloom-primary/90">Get Started</a>
      </div>
    </div>
  </div>
);

const CommunityChat = () => <div className="p-20 text-center text-2xl font-serif text-gray-600">Community Chat Coming Soon</div>;
const DailyQuiz = () => <div className="p-20 text-center text-2xl font-serif text-gray-600">Daily Quiz Coming Soon</div>;
const Insights = () => <div className="p-20 text-center text-2xl font-serif text-gray-600">Insights Coming Soon</div>;

function App() {
  return (
    <Router>
      <Routes>

        <Route element={<AuthLayout><Login /></AuthLayout>} path="/login" />
        <Route element={<AuthLayout><Signup /></AuthLayout>} path="/signup" />

        <Route
          element={
            <div className="min-h-screen flex flex-col font-sans bg-base-100">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/chatbot" element={<ProtectedRoute><BotDashboard /></ProtectedRoute>}>
                    <Route path=":id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="new" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  </Route>
                  <Route path="/community-chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
                  <Route path="/daily-quiz" element={<ProtectedRoute><DailyQuiz /></ProtectedRoute>} />
                  <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
          path="*"
        />
      </Routes>
    </Router>
  );
}

export default App;
