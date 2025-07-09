import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Skor kaydetme
export const saveScore = async (userId, gameType, scoreData) => {
  try {
    const scoresRef = collection(db, "scores");
    const score = {
      userId,
      gameType, // 'circle-target' veya 'reaction-time'
      ...scoreData,
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(scoresRef, score);
    console.log("Skor kaydedildi:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Skor kaydetme hatası:", error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının skorlarını getirme
export const getUserScores = async (
  userId,
  gameType = null,
  limitCount = 50
) => {
  try {
    const scoresRef = collection(db, "scores");
    let q;

    if (gameType) {
      // Specific game type - basit query, memory'de sıralama
      q = query(
        scoresRef,
        where("userId", "==", userId),
        where("gameType", "==", gameType),
        limit(limitCount)
      );
    } else {
      // All games - basit query, memory'de sıralama
      q = query(scoresRef, where("userId", "==", userId), limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const scores = [];

    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Memory'de timestamp'e göre sırala (orderBy yerine)
    scores.sort((a, b) => {
      const aTime = a.timestamp?.toDate
        ? a.timestamp.toDate()
        : new Date(a.createdAt);
      const bTime = b.timestamp?.toDate
        ? b.timestamp.toDate()
        : new Date(b.createdAt);
      return bTime - aTime; // Yeniden eskiye doğru
    });

    return { success: true, scores };
  } catch (error) {
    console.error("Skor getirme hatası:", error);
    return { success: false, error: error.message, scores: [] };
  }
};

// En iyi skorları getirme
export const getBestScores = async (userId, gameType) => {
  try {
    const scoresRef = collection(db, "scores");

    // Basit query, memory'de sıralama
    const q = query(
      scoresRef,
      where("userId", "==", userId),
      where("gameType", "==", gameType)
    );

    const querySnapshot = await getDocs(q);
    const scores = [];

    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Memory'de sırala ve limit uygula
    if (gameType === "reaction-time") {
      // Reaction time için en düşük süre en iyidir
      scores.sort(
        (a, b) => (a.reactionTime || Infinity) - (b.reactionTime || Infinity)
      );
    } else if (gameType === "circle-target") {
      // Circle target için en yüksek skor en iyidir
      scores.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    // İlk 10 tanesini al
    const topScores = scores.slice(0, 10);

    return { success: true, scores: topScores };
  } catch (error) {
    console.error("En iyi skor getirme hatası:", error);
    return { success: false, error: error.message, scores: [] };
  }
};

// İstatistik verileri hesaplama
export const getGameStats = async (userId, gameType) => {
  try {
    const result = await getUserScores(userId, gameType, 100); // Son 100 oyun

    if (!result.success) {
      return result;
    }

    const scores = result.scores;

    if (scores.length === 0) {
      return {
        success: true,
        stats: {
          totalGames: 0,
          averageScore: 0,
          bestScore: null,
          improvement: 0,
          chartData: [],
        },
      };
    }

    let stats = {
      totalGames: scores.length,
      chartData: [],
    };

    if (gameType === "reaction-time") {
      const reactionTimes = scores
        .map((s) => s.reactionTime)
        .filter((rt) => rt);
      stats.averageScore =
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
      stats.bestScore = Math.min(...reactionTimes);

      // Chart data - son 20 oyun
      stats.chartData = scores
        .slice(0, 20)
        .reverse()
        .map((score, index) => ({
          game: index + 1,
          value: score.reactionTime,
          date: score.timestamp?.toDate
            ? score.timestamp.toDate().toLocaleDateString()
            : score.createdAt,
        }));
    } else if (gameType === "circle-target") {
      const gameScores = scores
        .map((s) => s.score)
        .filter((score) => score !== undefined);
      stats.averageScore =
        gameScores.reduce((a, b) => a + b, 0) / gameScores.length;
      stats.bestScore = Math.max(...gameScores);

      // Chart data - son 20 oyun
      stats.chartData = scores
        .slice(0, 20)
        .reverse()
        .map((score, index) => ({
          game: index + 1,
          value: score.score,
          accuracy: score.accuracy || 0,
          date: score.timestamp?.toDate
            ? score.timestamp.toDate().toLocaleDateString()
            : score.createdAt,
        }));
    }

    // İlerleme hesaplama (son 10 oyun vs önceki 10 oyun)
    if (scores.length >= 10) {
      const recent = scores.slice(0, 10);
      const previous = scores.slice(10, 20);

      if (gameType === "reaction-time") {
        const recentAvg =
          recent.reduce((a, b) => a + b.reactionTime, 0) / recent.length;
        const previousAvg =
          previous.length > 0
            ? previous.reduce((a, b) => a + b.reactionTime, 0) / previous.length
            : recentAvg;
        stats.improvement = ((previousAvg - recentAvg) / previousAvg) * 100; // Pozitif = iyileşme
      } else {
        const recentAvg =
          recent.reduce((a, b) => a + b.score, 0) / recent.length;
        const previousAvg =
          previous.length > 0
            ? previous.reduce((a, b) => a + b.score, 0) / previous.length
            : recentAvg;
        stats.improvement = ((recentAvg - previousAvg) / previousAvg) * 100; // Pozitif = iyileşme
      }
    } else {
      stats.improvement = 0;
    }

    return { success: true, stats };
  } catch (error) {
    console.error("İstatistik hesaplama hatası:", error);
    return { success: false, error: error.message };
  }
};
