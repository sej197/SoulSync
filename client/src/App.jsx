import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BotDashboard from './pages/BotDashboard';
import About from './pages/About';
import ChatPage from './components/chatbot/ChatPage';

const Home = () => (
  <div className="hero min-h-screen bg-bloom-cream">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold font-serif text-bloom-green">SoulSync</h1>
        <p className="py-6 text-gray-600">Your journey to mental wellness starts here.</p>
        <button className="btn bg-bloom-primary text-white border-none hover:bg-purple-700">Get Started</button>
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
      <div className="min-h-screen flex flex-col font-sans bg-base-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/community-chat" element={<CommunityChat />} />
            <Route path="/daily-quiz" element={<DailyQuiz />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/chatbot" element={<BotDashboard />}>
              <Route path=":id" element={<ChatPage />} />
              <Route path="new" element={<ChatPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
