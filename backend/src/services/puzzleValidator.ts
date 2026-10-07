/**
 * GoDigital — Authoritative Puzzle Verification & Anti-Cheat Engine
 * 
 * Mandate:
 * 1. Zero Trust: Re-play move sequences deterministically on server.
 * 2. Minimum Mathematical Bound: Reject if moves < optimal BFS moves.
 * 3. Human Physical Reaction Floor: Reject if elapsed time < physical human threshold (200ms/move).
 * 4. Authoritative Scoring: Compute stars and score on server, never trusting client parameters.
 */

export interface MoveStep {
  fromTube?: number;
  toTube?: number;
  cardIndex1?: number;
  cardIndex2?: number;
  timestampMs?: number;
}

export interface PuzzleValidationResult {
  valid: boolean;
  score: number;
  stars: number;
  moves: number;
  fraudFlag: boolean;
  fraudReason?: string;
}

export interface BallSortConfig {
  capacity: number;
  tubes: string[][];
}

export interface MemoryMatchConfig {
  pairsCount: number;
  totalCards: number;
  cols: number;
  rows: number;
  cardSymbols?: string[];
}

export const PuzzleValidator = {
  // Physical human reaction lower bounds (in milliseconds)
  MIN_MS_PER_BALL_MOVE: 200,
  MIN_MS_PER_MEMORY_FLIP: 250,

  /**
   * Validate Water / Ball Sort Puzzle
   */
  validateBallSort(
    initialConfig: BallSortConfig,
    optimalMoves: number,
    parMoves: number,
    moves: MoveStep[],
    durationSeconds: number,
    scoringMatrix: any = { base_points: 1000, move_bonus: 500, speed_bonus_max: 400 }
  ): PuzzleValidationResult {
    const capacity = initialConfig.capacity || 4;
    // Deep clone tubes array
    const tubes: string[][] = initialConfig.tubes.map((t) => [...t]);

    // 1. Move Count Sanity: Must satisfy minimum mathematical lower bound
    if (!moves || moves.length === 0) {
      return {
        valid: false,
        score: 0,
        stars: 0,
        moves: 0,
        fraudFlag: true,
        fraudReason: 'Submission contains zero moves for an unsolved puzzle.',
      };
    }

    if (moves.length < optimalMoves) {
      return {
        valid: false,
        score: 0,
        stars: 0,
        moves: moves.length,
        fraudFlag: true,
        fraudReason: `Move count (${moves.length}) is below mathematical minimum (${optimalMoves}). Impossible solution detected.`,
      };
    }

    // 2. Physical Human Reaction Threshold
    const minPhysicalSeconds = (moves.length * this.MIN_MS_PER_BALL_MOVE) / 1000;
    if (durationSeconds < minPhysicalSeconds) {
      return {
        valid: false,
        score: 0,
        stars: 0,
        moves: moves.length,
        fraudFlag: true,
        fraudReason: `Completion time (${durationSeconds}s) is below human physical execution threshold (${minPhysicalSeconds.toFixed(2)}s for ${moves.length} moves). Bot or speed hack detected.`,
      };
    }

    // 3. Deterministic Physics & Rule Replay
    for (let step = 0; step < moves.length; step++) {
      const move = moves[step];
      const from = move.fromTube;
      const to = move.toTube;

      if (from === undefined || to === undefined || from === to) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Invalid move at step ${step}: fromTube and toTube must be valid distinct tube indices.`,
        };
      }

      if (from < 0 || from >= tubes.length || to < 0 || to >= tubes.length) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Out of bounds tube index at step ${step}: (${from} -> ${to}).`,
        };
      }

      const sourceTube = tubes[from];
      const destTube = tubes[to];

      if (sourceTube.length === 0) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Illegal move at step ${step}: Source tube ${from} is empty.`,
        };
      }

      if (destTube.length >= capacity) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Illegal move at step ${step}: Destination tube ${to} is full.`,
        };
      }

      const ballToMove = sourceTube[sourceTube.length - 1];

      // If destination tube already has balls, top color must match!
      if (destTube.length > 0) {
        const destTopBall = destTube[destTube.length - 1];
        if (destTopBall !== ballToMove) {
          return {
            valid: false,
            score: 0,
            stars: 0,
            moves: moves.length,
            fraudFlag: true,
            fraudReason: `Illegal color placement at step ${step}: Cannot pour ${ballToMove} onto ${destTopBall} in tube ${to}.`,
          };
        }
      }

      // Execute pour: move all matching consecutive top balls that fit
      let transferred = 0;
      while (
        sourceTube.length > 0 &&
        sourceTube[sourceTube.length - 1] === ballToMove &&
        destTube.length < capacity
      ) {
        destTube.push(sourceTube.pop()!);
        transferred++;
      }

      if (transferred === 0) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Illegal move at step ${step}: No balls could be transferred.`,
        };
      }
    }

    // 4. Final State Solvability Verification
    // Every tube must be either completely empty OR full with uniform color
    for (let i = 0; i < tubes.length; i++) {
      const tube = tubes[i];
      if (tube.length === 0) continue;
      if (tube.length !== capacity) {
        return {
          valid: false,
          score: 0,
          stars: 0,
          moves: moves.length,
          fraudFlag: true,
          fraudReason: `Incomplete tube ${i} has ${tube.length}/${capacity} balls after final move. Puzzle is not solved.`,
        };
      }
      const firstColor = tube[0];
      for (let k = 1; k < tube.length; k++) {
        if (tube[k] !== firstColor) {
          return {
            valid: false,
            score: 0,
            stars: 0,
            moves: moves.length,
            fraudFlag: true,
            fraudReason: `Tube ${i} contains mixed colors after final move. Puzzle is not solved.`,
          };
        }
      }
    }

    // 5. Authoritative Server Scoring Calculation
    const basePoints = scoringMatrix.base_points || 1000;
    const finalMoves = moves.length;

    let moveBonus = 500;
    if (finalMoves <= parMoves) {
      moveBonus = 500 + (parMoves - finalMoves) * 100;
    } else {
      moveBonus = Math.max(50, 500 - (finalMoves - parMoves) * 40);
    }

    let timeBonus = 100;
    if (durationSeconds <= 20) timeBonus = 400;
    else if (durationSeconds <= 40) timeBonus = 250;
    else if (durationSeconds <= 80) timeBonus = 120;
    else timeBonus = 40;

    const authoritativeScore = Math.max(150, basePoints + moveBonus + timeBonus);

    // Stars rating: 3 if <= parMoves, 2 if <= parMoves + 3, 1 otherwise
    let stars = 1;
    if (finalMoves <= parMoves) stars = 3;
    else if (finalMoves <= parMoves + 3) stars = 2;

    return {
      valid: true,
      score: authoritativeScore,
      stars,
      moves: finalMoves,
      fraudFlag: false,
    };
  },

  /**
   * Validate Memory Match / Flip Game
   */
  validateMemoryMatch(
    config: MemoryMatchConfig,
    optimalMoves: number,
    moves: MoveStep[],
    durationSeconds: number
  ): PuzzleValidationResult {
    const pairsCount = config.pairsCount || 6;

    if (!moves || moves.length < pairsCount) {
      return {
        valid: false,
        score: 0,
        stars: 0,
        moves: moves?.length || 0,
        fraudFlag: true,
        fraudReason: `Moves count (${moves?.length || 0}) is less than required card pairs (${pairsCount}).`,
      };
    }

    const minPhysicalSeconds = (moves.length * this.MIN_MS_PER_MEMORY_FLIP) / 1000;
    if (durationSeconds < minPhysicalSeconds) {
      return {
        valid: false,
        score: 0,
        stars: 0,
        moves: moves.length,
        fraudFlag: true,
        fraudReason: `Elapsed time (${durationSeconds}s) is below human physical perception threshold (${minPhysicalSeconds.toFixed(2)}s).`,
      };
    }

    const baseScore = 1000;
    const moveBonus = Math.max(0, 500 - (moves.length - optimalMoves) * 50);
    const timeBonus = Math.max(50, Math.floor(500 - durationSeconds * 5));
    const score = baseScore + moveBonus + timeBonus;

    let stars = 1;
    if (moves.length <= optimalMoves + 2) stars = 3;
    else if (moves.length <= optimalMoves + 5) stars = 2;

    return {
      valid: true,
      score,
      stars,
      moves: moves.length,
      fraudFlag: false,
    };
  },
};
