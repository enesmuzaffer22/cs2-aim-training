import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getGameStats } from "../services/scoreService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reaction-time");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [activeTab, user]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await getGameStats(user.uid, activeTab);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("İstatistik yükleme hatası:", error);
    }
    setLoading(false);
  };

  const formatValue = (value, gameType) => {
    if (gameType === "reaction-time") {
      return `${Math.round(value)}ms`;
    }
    return Math.round(value);
  };

  const getImprovementColor = (improvement) => {
    if (improvement > 0) return "text-green-400";
    if (improvement < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getImprovementIcon = (improvement) => {
    if (improvement > 0) return "📈";
    if (improvement < 0) return "📉";
    return "➖";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">İstatistikler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">📊 İstatistiklerim</h1>
          <button
            onClick={() => navigate("/menu")}
            className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            ← Ana Menü
          </button>
        </div>

        {/* Game Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("reaction-time")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
              activeTab === "reaction-time"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ⚡ Reaction Time
          </button>
          <button
            onClick={() => setActiveTab("circle-target")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-300 ${
              activeTab === "circle-target"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            🎯 Circle Target
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Total Games */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Toplam Oyun
                </h3>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.totalGames}
                </p>
              </div>

              {/* Best Score */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  En İyi Skor
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  {stats.bestScore !== null
                    ? formatValue(stats.bestScore, activeTab)
                    : "Henüz yok"}
                </p>
              </div>

              {/* Average Score */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Ortalama Skor
                </h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.averageScore
                    ? formatValue(stats.averageScore, activeTab)
                    : "Henüz yok"}
                </p>
              </div>

              {/* Improvement */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  İlerleme
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {getImprovementIcon(stats.improvement)}
                  </span>
                  <p
                    className={`text-2xl font-bold ${getImprovementColor(
                      stats.improvement
                    )}`}
                  >
                    {stats.improvement > 0 ? "+" : ""}
                    {stats.improvement.toFixed(1)}%
                  </p>
                </div>
                <p className="text-sm text-gray-400 mt-2">Son 10 oyuna göre</p>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-6">
                  {activeTab === "reaction-time"
                    ? "Tepki Süren Grafiği (ms)"
                    : "Skor Grafiğin"}
                </h3>

                {stats.chartData && stats.chartData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeTab === "reaction-time" ? (
                        <ScatterChart data={stats.chartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="game"
                            stroke="#9CA3AF"
                            label={{
                              value: "Oyun #",
                              position: "insideBottom",
                              offset: -10,
                              fill: "#9CA3AF",
                            }}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            label={{
                              value: "Tepki Süresi (ms)",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#9CA3AF",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                            formatter={(value) => [
                              `${value}ms`,
                              "Tepki Süresi",
                            ]}
                            labelFormatter={(value) => `Oyun #${value}`}
                          />
                          <Scatter
                            dataKey="value"
                            fill="#3B82F6"
                            stroke="#2563EB"
                            strokeWidth={2}
                          />
                        </ScatterChart>
                      ) : (
                        <LineChart data={stats.chartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="game"
                            stroke="#9CA3AF"
                            label={{
                              value: "Oyun #",
                              position: "insideBottom",
                              offset: -10,
                              fill: "#9CA3AF",
                            }}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            label={{
                              value: "Skor",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#9CA3AF",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                            formatter={(value, name) => {
                              if (name === "value") return [value, "Skor"];
                              if (name === "accuracy")
                                return [`${value.toFixed(1)}%`, "İsabet"];
                              return [value, name];
                            }}
                            labelFormatter={(value) => `Oyun #${value}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                            activeDot={{
                              r: 8,
                              stroke: "#10B981",
                              strokeWidth: 2,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-xl mb-2">📊</p>
                      <p>Henüz oyun verisi yok</p>
                      <p className="text-sm">
                        Birkaç oyun oynadıktan sonra grafikler burada görünecek
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-medium mb-4">💡 İpuçları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            {activeTab === "reaction-time" ? (
              <>
                <div>
                  <span className="text-green-400 font-medium">🎯 İyi:</span>{" "}
                  200ms altı
                </div>
                <div>
                  <span className="text-yellow-400 font-medium">
                    📊 Ortalama:
                  </span>{" "}
                  200-300ms
                </div>
                <div>
                  <span className="text-red-400 font-medium">🐌 Yavaş:</span>{" "}
                  300ms üstü
                </div>
                <div>
                  <span className="text-blue-400 font-medium">⚡ Pro:</span>{" "}
                  150ms altı
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-green-400 font-medium">🎯 İsabet:</span>{" "}
                  %80+ iyi
                </div>
                <div>
                  <span className="text-yellow-400 font-medium">⚡ Hız:</span>{" "}
                  Daha hızlı tıkla
                </div>
                <div>
                  <span className="text-blue-400 font-medium">
                    🎮 Antrenman:
                  </span>{" "}
                  Düzenli oyna
                </div>
                <div>
                  <span className="text-purple-400 font-medium">🏆 Hedef:</span>{" "}
                  1000+ skor
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
