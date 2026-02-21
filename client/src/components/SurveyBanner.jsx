import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SurveyBanner = () => {
  const { user, isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn || !user || user.surveyCompleted) return null;

  return (
    <div className="bg-gradient-to-r from-bloom-primary/90 to-bloom-primary text-white px-4 py-3 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">📋</span>
          <p className="text-sm font-medium truncate">
            Complete your wellness survey to personalize your SoulSync experience!
          </p>
        </div>
        <Link
          to="/survey"
          className="shrink-0 bg-white text-bloom-primary text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-all shadow-sm"
        >
          Take Survey →
        </Link>
      </div>
    </div>
  );
};

export default SurveyBanner;
