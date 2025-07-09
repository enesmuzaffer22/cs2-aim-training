import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveScore } from "../services/scoreService";
import {
  loadSensitivitySettings,
  calculateCS2Movement,
} from "../utils/sensitivity";

const CircleTargetGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameAreaRef = useRef(null);
  const crosshairRef = useRef(null);

  // Game state
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 saniye
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [missedShots, setMissedShots] = useState(0);
  const [totalShots, setTotalShots] = useState(0);

  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });

  // Game settings
  const TARGET_SIZE = 50; // px

  // Get viewport size
  useEffect(() => {
    const updateSize = () => {
      setGameAreaSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Load sensitivity settings
  useEffect(() => {
    const settings = loadSensitivitySettings();
    setSensitivity(settings.sensitivity);
    console.log("Loaded sensitivity:", settings.sensitivity);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isGameActive || isGameFinished) return;

    if (timeLeft <= 0) {
      // Oyun bitti!
      setIsGameActive(false);
      setIsGameFinished(true);
      setFinalScore(score);
      exitPointerLock();

      // Save score to Firestore
      if (user) {
        const accuracy = totalShots > 0 ? (score / totalShots) * 100 : 0;
        saveScore(user.uid, "circle-target", {
          score: score,
          accuracy: accuracy,
          totalShots: totalShots,
          missedShots: missedShots,
          gameTime: 60, // 60 seconds
        }).then((result) => {
          if (result.success) {
            console.log("Circle Target skoru kaydedildi:", result.id);
          } else {
            console.error("Skor kaydetme hatası:", result.error);
          }
        });
      }

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isGameFinished, timeLeft, score]);

  // Rastgele hedef oluştur
  const generateRandomTarget = useCallback(() => {
    const margin = TARGET_SIZE / 2;
    const x = Math.random() * (gameAreaSize.width - TARGET_SIZE * 2) + margin;
    const y = Math.random() * (gameAreaSize.height - TARGET_SIZE * 2) + margin;

    const target = {
      id: Date.now() + Math.random(),
      x,
      y,
      isBreaking: false,
    };

    console.log("Generated new target:", target);
    return target;
  }, [gameAreaSize.width, gameAreaSize.height]);

  // İlk hedefi oluştur
  useEffect(() => {
    if (isGameActive && targets.length === 0 && gameAreaSize.width > 0) {
      console.log("Creating initial target");
      setTargets([generateRandomTarget()]);
    }
  }, [isGameActive, targets.length, generateRandomTarget, gameAreaSize.width]);

  // Pointer Lock API
  const requestPointerLock = () => {
    console.log("Requesting pointer lock");
    if (gameAreaRef.current) {
      try {
        gameAreaRef.current.requestPointerLock();
        console.log("Pointer lock request sent");
      } catch (error) {
        console.error("Pointer lock request failed:", error);
      }
    } else {
      console.error("Game area ref is null");
    }
  };

  const exitPointerLock = () => {
    console.log("Exiting pointer lock");
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  // Pointer lock event listeners
  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = !!document.pointerLockElement;
      console.log("Pointer lock changed:", locked);
      setIsPointerLocked(locked);
    };

    const handlePointerLockError = () => {
      console.error("Pointer lock failed");
      setIsPointerLocked(false);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);

    return () => {
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      document.removeEventListener("pointerlockerror", handlePointerLockError);
    };
  }, []);

  // Direct DOM manipulation için pozisyon tracking
  const crosshairPosRef = useRef({ x: 50, y: 50 });

  // Mouse movement handler - DIRECT DOM manipulation (React state bypass)
  const handleMouseMove = useCallback(
    (event) => {
      if (!isPointerLocked || !isGameActive || !crosshairRef.current) return;

      const movement = calculateCS2Movement(
        event.movementX,
        event.movementY,
        sensitivity
      );

      // Daha gerçekçi sensitivity
      const conversionFactor = 1.5;

      // Pozisyonu güncelle (memory'de)
      crosshairPosRef.current.x = Math.max(
        0,
        Math.min(
          100,
          crosshairPosRef.current.x + movement.rotationX * conversionFactor
        )
      );
      crosshairPosRef.current.y = Math.max(
        0,
        Math.min(
          100,
          crosshairPosRef.current.y + movement.rotationY * conversionFactor
        )
      );

      // DOĞRUDAN CSS ile hareket ettir (GPU accelerated!)
      const x = `${crosshairPosRef.current.x}%`;
      const y = `${crosshairPosRef.current.y}%`;

      // Crosshair + lines'ı aynı anda hareket ettir
      const crosshairElements =
        crosshairRef.current.parentElement.querySelectorAll(
          ".crosshair-element"
        );
      crosshairElements.forEach((element) => {
        element.style.transform = `translate(-50%, -50%)`;
        element.style.left = x;
        element.style.top = y;
      });
    },
    [isPointerLocked, isGameActive, sensitivity]
  );

  // Mouse movement tracking
  useEffect(() => {
    if (!isPointerLocked || !isGameActive) return;

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isPointerLocked, isGameActive, handleMouseMove]);

  // Click handling - hedef vurma (ref'den pozisyon al)
  const handleClick = useCallback(() => {
    if (!isGameActive || !isPointerLocked) return;

    setTotalShots((prev) => prev + 1);

    const clickX = (crosshairPosRef.current.x / 100) * gameAreaSize.width;
    const clickY = (crosshairPosRef.current.y / 100) * gameAreaSize.height;

    // Her hedefi kontrol et
    setTargets((prevTargets) => {
      let targetHit = false;
      const updatedTargets = prevTargets.map((target) => {
        const distance = Math.sqrt(
          Math.pow(clickX - (target.x + TARGET_SIZE / 2), 2) +
            Math.pow(clickY - (target.y + TARGET_SIZE / 2), 2)
        );

        if (distance <= TARGET_SIZE / 2 && !target.isBreaking) {
          targetHit = true;
          return { ...target, isBreaking: true };
        }
        return target;
      });

      if (targetHit) {
        setScore((prev) => prev + 1);
        // 300ms sonra hedefi kaldır ve yeni hedef oluştur
        setTimeout(() => {
          setTargets(() => [generateRandomTarget()]);
        }, 300);
      } else {
        setMissedShots((prev) => prev + 1);
      }

      return updatedTargets;
    });
  }, [
    isGameActive,
    isPointerLocked,
    generateRandomTarget,
    gameAreaSize.width,
    gameAreaSize.height,
  ]);

  // Click event listener
  useEffect(() => {
    if (isGameActive && isPointerLocked) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [isGameActive, isPointerLocked, handleClick]);

  // ESC tuşu ile oyundan çıkış
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        console.log("ESC pressed, stopping game");
        setIsGameActive(false);
        setIsGameFinished(false);
        exitPointerLock();
        navigate("/menu");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  const startGame = () => {
    console.log("Starting game");
    setIsGameActive(true);
    setIsGameFinished(false);
    setScore(0);
    setTimeLeft(60);
    setTargets([]);
    setMissedShots(0);
    setTotalShots(0);
    // Ref pozisyonunu sıfırla
    crosshairPosRef.current = { x: 50, y: 50 };
    // Pointer lock manuel olarak game area'ya tıklayınca aktifleşecek
  };

  const restartGame = () => {
    startGame();
  };

  const goToMenu = () => {
    setIsGameFinished(false);
    navigate("/menu");
  };

  return (
    <div className="fixed inset-0 bg-white">
      {isGameFinished ? (
        // Oyun bitti ekranı
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-green-400">
              🎯 OYUN BİTTİ!
            </h1>
            <div className="bg-gray-800 p-8 rounded-lg mb-6">
              <h2 className="text-3xl font-bold mb-4">Skorunuz</h2>
              <p className="text-6xl font-bold text-blue-400 mb-4">
                {finalScore}
              </p>
              <p className="text-xl text-gray-300 mb-2">Hedef Vurma Başarısı</p>
              <p className="text-lg text-gray-400">60 saniye içinde</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={restartGame}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
              >
                🔄 Tekrar Oyna
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
      ) : !isGameActive ? (
        // Oyun başlama ekranı
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Circle Target Training</h1>
            <p className="text-xl mb-6">
              Beliren daireleri vur ve aimini geliştir
            </p>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <p className="mb-2">CS2 Sensitivity: {sensitivity}</p>
              <p className="text-sm text-gray-300">
                Effective DPI:{" "}
                {(
                  sensitivity *
                  (parseInt(localStorage.getItem("cs2_dpi")) || 800)
                ).toFixed(1)}
              </p>
              <p className="text-sm text-gray-400">
                Süre: 60 saniye | ESC ile çık
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={startGame}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
              >
                ⏰ Oyunu Başlat (60s)
              </button>
              <button
                onClick={() => navigate("/menu")}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                Ana Menü
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Oyun ekranı - Full Screen
        <div
          ref={gameAreaRef}
          className="relative w-full h-full bg-white cursor-none overflow-hidden"
          style={{
            width: gameAreaSize.width,
            height: gameAreaSize.height,
          }}
          onClick={() => {
            if (!isPointerLocked) {
              console.log("Game area clicked, requesting pointer lock");
              requestPointerLock();
            }
          }}
        >
          {/* Score Display */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{score}</p>
              <p className="text-xs text-gray-300">SKOR</p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg">
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${
                  timeLeft <= 10
                    ? "text-red-400 animate-pulse"
                    : "text-green-400"
                }`}
              >
                {timeLeft}
              </p>
              <p className="text-xs text-gray-300">SANİYE</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
            ESC ile çık
          </div>

          {/* Targets */}
          {targets.map((target) => (
            <div
              key={target.id}
              className={`absolute rounded-full transition-all duration-300 ${
                target.isBreaking
                  ? "bg-red-500 animate-ping"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              style={{
                left: target.x,
                top: target.y,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
                transform: target.isBreaking ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}

          {/* Crosshair */}
          <div
            ref={crosshairRef}
            className="crosshair-element absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: "50%",
              top: "50%",
            }}
          />

          {/* Crosshair Lines */}
          <div
            className="crosshair-element absolute w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: "50%",
              top: "50%",
            }}
          />
          <div
            className="crosshair-element absolute w-0.5 h-4 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: "50%",
              top: "50%",
            }}
          />

          {!isPointerLocked && (
            <div
              className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white text-xl z-30 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Overlay clicked, requesting pointer lock");
                requestPointerLock();
              }}
            >
              <div className="text-center">
                <p className="mb-4 text-2xl font-bold">🖱️ TIKLAYARAK BAŞLA</p>
                <p className="text-lg mb-2">Mouse kontrolü aktifleştirilecek</p>
                <p className="text-sm text-gray-300">
                  (Çıkmak için ESC tuşuna bas)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircleTargetGame;
