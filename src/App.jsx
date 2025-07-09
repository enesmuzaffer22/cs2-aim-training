import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import MainMenu from "./components/MainMenu";
import CircleTargetGame from "./components/CircleTargetGame";
import ReactionTimeGame from "./components/ReactionTimeGame";
import Statistics from "./components/Statistics";
import { useAuth } from "./hooks/useAuth";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MainMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/circle-target"
            element={
              <ProtectedRoute>
                <CircleTargetGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/reaction-time"
            element={
              <ProtectedRoute>
                <ReactionTimeGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
