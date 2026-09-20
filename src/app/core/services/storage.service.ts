import { Injectable } from '@angular/core';

interface QuizStorage {
  bestScore: number;
  gamesPlayed: number;
  bestBadgeId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly storageKey = 'aventura-mesoamerica';

  private readonly defaultStorage: QuizStorage = {
    bestScore: 0,
    gamesPlayed: 0,
    bestBadgeId: null,
  };

  getProgress(): QuizStorage {
    const storedData = localStorage.getItem(this.storageKey);

    if (!storedData) {
      return { ...this.defaultStorage };
    }

    try {
      return {
        ...this.defaultStorage,
        ...JSON.parse(storedData),
      };
    } catch {
      return { ...this.defaultStorage };
    }
  }

  saveResult(score: number, badgeId: string): void {
    const progress = this.getProgress();

    const updatedProgress: QuizStorage = {
      bestScore: Math.max(progress.bestScore, score),
      gamesPlayed: progress.gamesPlayed + 1,
      bestBadgeId:
        score >= progress.bestScore ? badgeId : progress.bestBadgeId,
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(updatedProgress)
    );
  }

  getBestScore(): number {
    return this.getProgress().bestScore;
  }

  getGamesPlayed(): number {
    return this.getProgress().gamesPlayed;
  }

  getBestBadgeId(): string | null {
    return this.getProgress().bestBadgeId;
  }

  clearProgress(): void {
    localStorage.removeItem(this.storageKey);
  }
}