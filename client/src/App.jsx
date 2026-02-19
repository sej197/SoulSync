import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import Journal from './pages/Journal';
import AnxietyQuiz from './components/quiz/AnxietyQuiz';
import DepressionQuiz from './components/quiz/DepressionQuiz';
import SleepQuiz from './components/quiz/SleepQuiz';
import StressQuiz from './components/quiz/StressQuiz';
import DailyQuiz from './components/quiz/DailyQuiz';
import Helplines from './pages/Helplines';
import CommunityExplore from './pages/CommunityExplore';
import CommunityLanding from './pages/CommunityLanding';

function App() {
  console.log("[App] Rendering. Time:", new Date().toLocaleTimeString());


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
                  <Route path="/communities" element={<ProtectedRoute><CommunityLanding/></ProtectedRoute>} />
                  <Route path="/communities/explore" element={<ProtectedRoute><CommunityExplore/></ProtectedRoute>} />
                  <Route path="/daily-quiz" element={<ProtectedRoute><DailyQuiz /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                  <Route path="/helplines" element={<ProtectedRoute><Helplines /></ProtectedRoute>} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/anxiety-quiz" element={<ProtectedRoute><AnxietyQuiz /></ProtectedRoute>} />
                  <Route path="/depression-quiz" element={<ProtectedRoute><DepressionQuiz /></ProtectedRoute>} />
                  <Route path="/sleep-quiz" element={<ProtectedRoute><SleepQuiz /></ProtectedRoute>} />
                  <Route path="/stress-quiz" element={<ProtectedRoute><StressQuiz /></ProtectedRoute>} />
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
