import { Storage } from '../utils/Storage.js';

/**
 * Mock Firebase Manager for local testing.
 * Implements the interface for signInAnonymously, setDoc, and getTopScores.
 * Falls back to local Storage.js.
 */
export class FirebaseManager {
  constructor() {
    this.uid = Storage.load('uid');
    if (!this.uid) {
      this.signInAnonymously();
    }
  }

  async signInAnonymously() {
    // Generate a random mock UID
    this.uid = 'anon_' + Math.random().toString(36).substr(2, 9);
    Storage.save('uid', this.uid);
    console.log('[FirebaseManager] Signed in anonymously with UID:', this.uid);
    
    // Seed some mock leaderboard data if empty
    const leaderboards = Storage.load('leaderboards') || [];
    if (leaderboards.length === 0) {
      const mockNames = ['Player_1', 'StackMaster', 'FlipGod', 'Anon_42', 'Blocker'];
      for (let i = 0; i < 5; i++) {
        leaderboards.push({
          uid: 'mock_' + i,
          displayName: mockNames[i],
          score: Math.floor(Math.random() * 50) + 10,
          timestamp: Date.now() - (Math.random() * 100000)
        });
      }
      Storage.save('leaderboards', leaderboards);
    }
  }

  /**
   * Pushes a new score to the mock database.
   */
  async submitScore(score, stats) {
    if (!this.uid) return false;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const leaderboards = Storage.load('leaderboards') || [];
    
    // Check if player already exists
    const existingIndex = leaderboards.findIndex(entry => entry.uid === this.uid);
    const newEntry = {
      uid: this.uid,
      displayName: 'You',
      score: score,
      highestCombo: stats.highestCombo || 0,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      if (score > leaderboards[existingIndex].score) {
        leaderboards[existingIndex] = newEntry;
      }
    } else {
      leaderboards.push(newEntry);
    }
    
    Storage.save('leaderboards', leaderboards);
    console.log('[FirebaseManager] Score submitted successfully');
    return true;
  }

  /**
   * Retrieves the top 10 scores.
   */
  async getTopScores() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const leaderboards = Storage.load('leaderboards') || [];
    // Sort descending
    leaderboards.sort((a, b) => b.score - a.score);
    // Return top 10
    return leaderboards.slice(0, 10);
  }
}

// Singleton export
export const firebaseManager = new FirebaseManager();
