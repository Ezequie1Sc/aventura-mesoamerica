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
  private readonly explorerNameKey =
    'aventura-explorer-name';

  private readonly defaultStorage: QuizStorage = {
    bestScore: 0,
    gamesPlayed: 0,
    bestBadgeId: null,
  };

  // =========================================================
  // OBTENER PROGRESO
  // =========================================================

  getProgress(): QuizStorage {
    const storedData = localStorage.getItem(
      this.storageKey
    );

    if (!storedData) {
      return { ...this.defaultStorage };
    }

    try {
      const parsedData = JSON.parse(
        storedData
      );

      return {
        ...this.defaultStorage,
        ...parsedData,
      };
    } catch {
      return { ...this.defaultStorage };
    }
  }

  // =========================================================
  // GUARDAR RESULTADO
  // =========================================================

  saveResult(
    score: number,
    badgeId: string
  ): void {
    const progress = this.getProgress();

    const updatedProgress: QuizStorage = {
      bestScore: Math.max(
        progress.bestScore,
        score
      ),

      gamesPlayed:
        progress.gamesPlayed + 1,

      bestBadgeId:
        score >= progress.bestScore
          ? badgeId
          : progress.bestBadgeId,
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(updatedProgress)
    );
  }

  // =========================================================
  // MEJOR PUNTUACIÓN
  // =========================================================

  getBestScore(): number {
    return this.getProgress().bestScore;
  }

  // =========================================================
  // PARTIDAS JUGADAS
  // =========================================================

  getGamesPlayed(): number {
    return this.getProgress().gamesPlayed;
  }

  // =========================================================
  // MEJOR INSIGNIA
  // =========================================================

  getBestBadgeId(): string | null {
    return this.getProgress().bestBadgeId;
  }

  // =========================================================
  // LIMPIAR PROGRESO
  // =========================================================

  clearProgress(): void {
    localStorage.removeItem(
      this.storageKey
    );

    localStorage.removeItem(
      this.explorerNameKey
    );

    sessionStorage.clear();
  }

  // =========================================================
  // REINICIAR AVENTURA COMPLETAMENTE
  // =========================================================

  resetAdventure(): void {
    this.clearProgress();
  }
}