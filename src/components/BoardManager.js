import Phaser from "phaser";

export default class BoardManager {
  constructor(scene, config) {
    this.scene = scene;

    // NEW: shape instead of rows/cols
    this.shape = config.shape; // 2D array [ [1,0,1], [1,1,1] ]

    this.width = config.width;
    this.height = config.height;
    this.x = config.x;
    this.y = config.y;

    this.onMatch = config.onMatch;
    this.onWin = config.onWin;

    this.cards = [];
    this.flipped = [];
    this.lock = false;

    this.createContainer();
    this.createBoard();
  }

  /* ================= CONTAINER ================= */

  createContainer() {
    this.container = this.scene.add.container(this.x, this.y);

    const bg = this.scene.add.graphics();
    const radius = 25;

    const startX = -this.width / 2;
    const startY = -this.height / 2;

    bg.fillStyle(0xf0b13b, 0.15);
    bg.fillRoundedRect(startX + 6, startY + 6, this.width, this.height, radius);

    bg.fillGradientStyle(0xffffff, 0xffffff, 0xfef3c7, 0xfde68a, 1);
    bg.fillRoundedRect(startX, startY, this.width, this.height, radius);

    bg.lineStyle(4, 0xfacc15, 0.8);
    bg.strokeRoundedRect(startX, startY, this.width, this.height, radius);

    this.container.add(bg);
  }

  /* ================= SHAPE BOARD ================= */

  createBoard() {
    const padding = 15;

    const rows = this.shape.length;
    const cols = Math.max(...this.shape.map((r) => r.length));

    // collect active cells
    const activeCells = [];
    this.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) activeCells.push({ r, c });
      });
    });

    const total = activeCells.length;

    // must be even
    if (total % 2 !== 0) {
      console.error("Shape must contain EVEN number of cells");
      return;
    }

    const pairCount = total / 2;

    /* ===== COLORS ===== */
    let colors = [];
    for (let i = 0; i < pairCount; i++) {
      const color = Phaser.Display.Color.RandomRGB().color;
      colors.push(color, color);
    }
    Phaser.Utils.Array.Shuffle(colors);

    /* ===== CELL SIZE AUTO FIT ===== */
    const cellWidth = (this.width - padding * (cols + 1)) / cols;
    const cellHeight = (this.height - padding * (rows + 1)) / rows;
    const size = Math.min(cellWidth, cellHeight);

    /* ===== AUTO CENTER IRREGULAR SHAPE ===== */
    const gridWidth = cols * size + padding * (cols - 1);
    const gridHeight = rows * size + padding * (rows - 1);

    const startX = -gridWidth / 2 + size / 2;
    const startY = -gridHeight / 2 + size / 2;

    /* ===== CREATE CARDS ===== */
    activeCells.forEach((cell, index) => {
      const x = startX + cell.c * (size + padding);
      const y = startY + cell.r * (size + padding);

      const card = this.scene.add.rectangle(x, y, size, size, 0x444444);

      card.colorValue = colors[index];
      card.isFlipped = false;

      card.setInteractive({ useHandCursor: true });
      card.on("pointerdown", () => this.flipCard(card));

      this.container.add(card);
      this.cards.push(card);
    });
  }

  /* ================= GAMEPLAY ================= */

  flipCard(card) {
    if (this.lock || card.isFlipped) return;

    card.isFlipped = true;
    card.fillColor = card.colorValue;

    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.lock = true;
    const [a, b] = this.flipped;

    if (a.colorValue === b.colorValue) {
      this.flipped = [];
      this.lock = false;

      this.onMatch?.();

      if (this.cards.every((c) => c.isFlipped)) {
        this.onWin?.();
      }
    } else {
      this.scene.time.delayedCall(700, () => {
        a.isFlipped = false;
        b.isFlipped = false;

        a.fillColor = 0x444444;
        b.fillColor = 0x444444;

        this.flipped = [];
        this.lock = false;
      });
    }
  }

  destroy() {
    this.container.destroy(true);
  }
}
