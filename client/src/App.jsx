import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthLayout from './components/layout/AuthLayout';
import BotDashboard from './pages/BotDashboard';
import About from './pages/About';
import ChatPage from './components/chatbot/ChatPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Insights from './pages/Insights';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import AnxietyQuiz from './components/quiz/AnxietyQuiz';
import DepressionQuiz from './components/quiz/DepressionQuiz';

const CommunityChat = () => <div className="p-20 text-center text-2xl font-serif text-gray-600">Community Chat Coming Soon</div>;
const DailyQuiz = () => <div className="p-20 text-center text-2xl font-serif text-gray-600">Daily Quiz Coming Soon</div>;


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
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/anxiety-quiz" element={<ProtectedRoute><AnxietyQuiz /></ProtectedRoute>} />
                  <Route path="/depression-quiz" element={<ProtectedRoute><DepressionQuiz /></ProtectedRoute>} />
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
