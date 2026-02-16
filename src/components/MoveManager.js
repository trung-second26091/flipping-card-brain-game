export default class MoveManager {
  constructor(scene, config = {}) {
    this.scene = scene;

    this.onMove = config.onMove; // called every move
    this.onLimitReach = config.onLimitReach; // optional lose condition

    this.moves = 0;
    this.maxMoves = config.maxMoves || null;
  }

  /* ================= START ================= */

  start(maxMoves = null) {
    this.reset();

    if (maxMoves !== null) {
      this.maxMoves = maxMoves;
    }
  }

  /* ================= ADD MOVE ================= */

  addMove() {
    this.moves++;

    this.onMove?.(this.moves);

    // Optional limit system
    if (this.maxMoves && this.moves >= this.maxMoves) {
      this.onLimitReach?.(this.moves);
    }
  }

  /* ================= GETTERS ================= */

  getMoves() {
    return this.moves;
  }

  getRemainingMoves() {
    if (!this.maxMoves) return null;
    return this.maxMoves - this.moves;
  }

  /* ================= RESET ================= */

  reset() {
    this.moves = 0;
  }
}
