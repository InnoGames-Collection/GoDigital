import { TileItem } from './types';

export class FlipTileBotAI {
  // Map of tileId -> icon for tiles the bot remembers
  private memory: Map<number, string> = new Map();
  private memoryRate: number = 0.75;

  constructor(memoryRate: number) {
    this.memoryRate = memoryRate;
    this.memory.clear();
  }

  public setMemoryRate(rate: number) {
    this.memoryRate = rate;
  }

  public resetMemory() {
    this.memory.clear();
  }

  /**
   * Observe a tile that was revealed by either player or bot
   */
  public observeTile(tileId: number, icon: string) {
    // Probability of storing in memory based on memory rate
    if (Math.random() <= this.memoryRate) {
      this.memory.set(tileId, icon);
    } else {
      // Chance of forgetting if previously known
      this.memory.delete(tileId);
    }
  }

  /**
   * Remove matched tiles from memory
   */
  public onTilesMatched(tileIds: number[]) {
    tileIds.forEach((id) => this.memory.delete(id));
  }

  /**
   * Decide first tile to flip
   */
  public chooseFirstTile(availableTiles: TileItem[]): TileItem {
    const unrevealedAvailable = availableTiles.filter((t) => !t.isFlipped && !t.isMatched);
    if (unrevealedAvailable.length === 0) return availableTiles[0];

    // Check if memory has a known matching pair among available tiles!
    const iconToIds = new Map<string, number[]>();
    for (const [id, icon] of this.memory.entries()) {
      const tile = unrevealedAvailable.find((t) => t.id === id);
      if (tile) {
        const list = iconToIds.get(icon) || [];
        list.push(id);
        iconToIds.set(icon, list);
        if (list.length >= 2) {
          // Found a known pair in memory! Pick the first one.
          const pairTile = unrevealedAvailable.find((t) => t.id === list[0]);
          if (pairTile) return pairTile;
        }
      }
    }

    // Otherwise, pick an unrevealed tile that is NOT in memory to explore fresh information
    const unknownTiles = unrevealedAvailable.filter((t) => !this.memory.has(t.id));
    if (unknownTiles.length > 0 && Math.random() < 0.85) {
      return unknownTiles[Math.floor(Math.random() * unknownTiles.length)];
    }

    // Fallback to random available unrevealed tile
    return unrevealedAvailable[Math.floor(Math.random() * unrevealedAvailable.length)];
  }

  /**
   * Decide second tile to flip, given the first tile just flipped
   */
  public chooseSecondTile(firstFlipped: TileItem, availableTiles: TileItem[]): TileItem {
    const remaining = availableTiles.filter(
      (t) => !t.isMatched && !t.isFlipped && t.id !== firstFlipped.id
    );
    if (remaining.length === 0) return firstFlipped;

    // Check if memory knows where the matching icon is located!
    for (const [id, icon] of this.memory.entries()) {
      if (id !== firstFlipped.id && icon === firstFlipped.icon) {
        const matchingTile = remaining.find((t) => t.id === id);
        if (matchingTile) {
          // If memory check succeeds:
          if (Math.random() <= this.memoryRate) {
            return matchingTile;
          }
        }
      }
    }

    // If not in memory or memory check failed, prefer picking an unknown tile
    const unknownTiles = remaining.filter((t) => !this.memory.has(t.id));
    if (unknownTiles.length > 0) {
      return unknownTiles[Math.floor(Math.random() * unknownTiles.length)];
    }

    return remaining[Math.floor(Math.random() * remaining.length)];
  }
}
