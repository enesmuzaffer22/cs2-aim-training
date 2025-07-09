import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveScore } from "../services/scoreService";

const ReactionTimeGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  // Game states: 'start', 'waiting', 'blue', 'result', 'early'
  const [gameState, setGameState] = useState("start");
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem("best_reaction_time");
    return saved ? parseInt(saved) : null;
  });

  // Random delay between 2-6 seconds
  const getRandomDelay = () => Math.random() * 4000 + 2000;

  const startGame = () => {
    setGameState("waiting");
    setReactionTime(0);

    // Button tıklamasından sonra kısa delay (double click önleme)
    setTimeout(() => {
      // Random delay sonra mavi ekran
      const delay = getRandomDelay();
      console.log(
        `Mavi ekran ${(delay / 1000).toFixed(1)} saniye sonra gelecek`
      );

      timeoutRef.current = setTimeout(() => {
        console.log("🔵 Mavi ekran gösterildi!");
        setGameState("blue");
        startTimeRef.current = Date.now();
      }, delay);
    }, 300); // 300ms delay
  };

  const handleClick = useCallback(() => {
    if (gameState === "waiting") {
      // Erken tıklama!
      console.log("Early click detected!");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState("early");

      // 3 saniye sonra otomatik restart
      timeoutRef.current = setTimeout(() => {
        startGame();
      }, 3000);
      return;
    }

    if (gameState === "blue") {
      // Doğru tıklama!
      const endTime = Date.now();
      const reaction = endTime - startTimeRef.current;
      setReactionTime(reaction);
      setGameState("result");

      console.log("Reaction time:", reaction, "ms");

      // Best time update
      if (!bestTime || reaction < bestTime) {
        setBestTime(reaction);
        localStorage.setItem("best_reaction_time", reaction.toString());
      }

      // Save score to Firestore
      if (user) {
        saveScore(user.uid, "reaction-time", {
          reactionTime: reaction,
          isNewRecord: !bestTime || reaction < bestTime,
        }).then((result) => {
          if (result.success) {
            console.log("Skor kaydedildi:", result.id);
          } else {
            console.error("Skor kaydetme hatası:", result.error);
          }
        });
      }
    }
  }, [gameState, bestTime, startGame]);

  const restartGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startGame();
  };

  const goToMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigate("/menu");
  };

  // Click event listener - delay only for waiting state
  useEffect(() => {
    if (gameState === "waiting") {
      // Kısa bir delay ekleyerek start butonunun click eventi ile çakışmayı önle
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClick);
      }, 500); // 500ms delay sadece waiting için

      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClick);
      };
    } else if (gameState === "blue") {
      // Mavi ekranda hemen listener ekle (gecikme yok)
      document.addEventListener("click", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [gameState, handleClick]);

  // ESC key handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        navigate("/menu");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting":
        return "bg-white";
      case "blue":
        return "bg-blue-500";
      case "result":
        return "bg-green-500";
      case "early":
        return "bg-red-500";
      default:
        return "bg-gray-900";
    }
  };

  return (
    <div
      className={`fixed inset-0 transition-colors duration-200 ${getBackgroundColor()}`}
    >
      {gameState === "start" && (
        // Başlangıç ekranı
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center max-w-2xl p-8">
            <h1 className="text-4xl font-bold mb-6">⚡ Reaction Time Test</h1>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Nasıl Oynanır?</h2>
              <div className="text-left space-y-3">
                <p>
                  1. 🤍 <strong>Beyaz ekran</strong> görünce bekleyin
                </p>
                <p>
                  2. 🔵 <strong>Mavi ekran</strong> görür görmez tıklayın
                </p>
                <p>
                  3. 🟢 <strong>Yeşil ekran</strong> ile sonucunuzu görün
                </p>
                <p className="text-red-400 text-sm">
                  ⚠️ Erken tıklarsanız kırmızı ekran!
                </p>
              </div>
              {bestTime && (
                <div className="mt-4 p-3 bg-gray-700 rounded">
                  <p className="text-green-400">
                    🏆 En İyi Zamanınız: {bestTime}ms
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={startGame}
                className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition duration-300 font-semibold text-xl"
              >
                ⚡ Testi Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "waiting" && (
        // Bekleme ekranı
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-700 mb-4">
              Bekleyin...
            </h1>
            <p className="text-xl text-gray-600">
              Mavi ekranı görünce hemen tıklayın!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Şimdi henüz tıklamayın! Ekran maviye dönünce tıklayın.
            </p>
            <div className="mt-8">
              <div className="animate-pulse text-4xl">⏳</div>
            </div>
          </div>
        </div>
      )}

      {gameState === "blue" && (
        // Mavi ekran - hemen tıkla!
        <div className="flex items-center justify-center min-h-screen cursor-pointer">
          <div className="text-center">
            <h1 className="text-8xl font-bold text-white mb-4">TIKLA!</h1>
            <p className="text-2xl text-white">Hemen şimdi!</p>
          </div>
        </div>
      )}

      {gameState === "result" && (
        // Sonuç ekranı
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">🎯 Harika!</h1>
            <div className="bg-white bg-opacity-20 p-8 rounded-lg mb-6">
              <p className="text-2xl text-white mb-2">Tepki Süreniz</p>
              <p className="text-6xl font-bold text-white mb-4">
                {reactionTime}ms
              </p>
              <div className="space-y-2">
                {reactionTime < 200 && (
                  <p className="text-white text-xl">🚀 Süper Hızlı!</p>
                )}
                {reactionTime >= 200 && reactionTime < 300 && (
                  <p className="text-white text-xl">⚡ Çok İyi!</p>
                )}
                {reactionTime >= 300 && reactionTime < 400 && (
                  <p className="text-white text-xl">👍 İyi!</p>
                )}
                {reactionTime >= 400 && (
                  <p className="text-white text-xl">🐌 Biraz Yavaş</p>
                )}
                {bestTime && reactionTime === bestTime && (
                  <p className="text-white text-lg">🏆 YENİ REKOR!</p>
                )}
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={restartGame}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
              >
                🔄 Tekrar Dene
              </button>
              <button
                onClick={goToMenu}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                🏠 Ana Menü
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "early" && (
        // Erken tıklama ekranı - otomatik restart
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              ❌ Çok Erken!
            </h1>
            <div className="bg-white bg-opacity-20 p-8 rounded-lg mb-6">
              <p className="text-2xl text-white mb-4">Mavi ekranı bekleyin!</p>
              <p className="text-lg text-red-200">
                Sabırlı olun ve mavi ekranı görünce tıklayın
              </p>
              <p className="text-sm text-white mt-4">
                3 saniye sonra otomatik olarak yeniden başlayacak...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ESC Instructions */}
      {gameState !== "start" && (
        <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
          ESC ile çık
        </div>
      )}
    </div>
  );
};

export default ReactionTimeGame;
