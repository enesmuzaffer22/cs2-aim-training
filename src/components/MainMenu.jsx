import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const MainMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // localStorage'dan değerleri yükle
  const [sensitivity, setSensitivity] = useState(() => {
    const saved = localStorage.getItem("cs2_sensitivity");
    return saved ? parseFloat(saved) : 1.0;
  });

  const [dpi, setDpi] = useState(() => {
    const saved = localStorage.getItem("cs2_dpi");
    return saved ? parseInt(saved) : 800;
  });

  // Değerler değiştiğinde otomatik kaydet
  useEffect(() => {
    if (typeof sensitivity === "number" && !isNaN(sensitivity)) {
      localStorage.setItem("cs2_sensitivity", sensitivity.toString());
    }
  }, [sensitivity]);

  useEffect(() => {
    localStorage.setItem("cs2_dpi", dpi.toString());
  }, [dpi]);

  const gameMode = [
    {
      id: "circle-target",
      title: "Circle Target",
      description: "Rastgele beliren daireleri vur",
      path: "/game/circle-target",
    },
    {
      id: "reaction-time",
      title: "Reaction Time",
      description: "Refleks hızını ölç",
      path: "/game/reaction-time",
    },
    {
      id: "statistics",
      title: "İstatistiklerim",
      description: "Performans grafiklerin ve skorların",
      path: "/statistics",
    },
  ];

  const handleGameStart = (gamePath) => {
    // Değerler zaten otomatik kaydediliyor, sadece navigate et
    navigate(gamePath);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* User Info Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {user?.displayName || "Kullanıcı"}
              </p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              const result = await logout();
              if (result.success) {
                navigate("/auth");
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">CS2 Aim Trainer</h1>
          <p className="text-xl text-gray-300">
            Aimini geliştir, profesyonel ol
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sensitivity Settings */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">
                Sensitivity Ayarları
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    CS2 Sensitivity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="20"
                    value={sensitivity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || value === ".") {
                        setSensitivity(value);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setSensitivity(numValue);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Örn: 1.25, 0.8, 2.35"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mouse DPI
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    max="5000"
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>

                <div className="bg-gray-700 p-3 rounded-md">
                  <p className="text-sm text-gray-300">
                    <strong>Effective DPI:</strong>{" "}
                    {typeof sensitivity === "number" && !isNaN(sensitivity)
                      ? (sensitivity * dpi).toFixed(1)
                      : "Bekliyor..."}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    CS2 YAW değeri: 0.022 (sabit)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sensitivity: {sensitivity} × DPI: {dpi}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Modes */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">
                Oyun Modları
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameMode.map((mode) => (
                  <div
                    key={mode.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300"
                  >
                    <h3 className="text-xl font-semibold mb-2">{mode.title}</h3>
                    <p className="text-gray-300 mb-3">{mode.description}</p>
                    <div className="flex w-full items-center">
                      <button
                        style={{ width: "100%" }}
                        onClick={() => handleGameStart(mode.path)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 font-semibold"
                      >
                        Başla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            🎯 CS2 Aim Training - Aimini geliştir, rekorlarını kır!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
