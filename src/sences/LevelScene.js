import Phaser from "phaser";

export default class LevelScene extends Phaser.Scene {
  constructor() {
    super("LevelScene");

    this.levels = [];
    this.bestTimes = {};

    this.currentPage = 0;
    this.levelsPerPage = 6;

    this.pagesContainer = null;
    this.dots = [];
  }

  preload() {
    this.load.json("levels", "/assets/data/levels.json");
  }

  create() {
    const { width, height } = this.scale;

    this.children.removeAll();

    this.createBackground();

    const data = this.cache.json.get("levels");
    this.levels = data.levels;

    this.bestTimes = JSON.parse(localStorage.getItem("levelBestTimes")) || {};

    this.add
      .text(width / 2, height * 0.1, "SELECT LEVEL", {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);

    this.createPages();
    this.createPaginationDots();
    this.enableSwipe();
  }

  /* ================= BACKGROUND ================= */

  createBackground() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfefce8, 0xfefce8, 0xfef9c2, 0xfef9c2, 1);
    bg.fillRect(0, 0, width, height);
  }

  /* ================= CREATE PAGES ================= */

  createPages() {
    const { width, height } = this.scale;

    this.pagesContainer = this.add.container(0, 0);

    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    for (let p = 0; p < totalPages; p++) {
      const page = this.add.container(width * p, 0);

      const startIndex = p * this.levelsPerPage;
      const endIndex = startIndex + this.levelsPerPage;
      const pageLevels = this.levels.slice(startIndex, endIndex);

      this.createLevelGrid(page, pageLevels);

      this.pagesContainer.add(page);
    }
  }

  /* ================= GRID (2 COL, 3 ROW) ================= */

  createLevelGrid(page, levels) {
    const { width, height } = this.scale;

    const cols = 2;
    const rows = 3;

    // Responsive spacing
    const spacingX = width * 0.512;
    const spacingY = height * 0.244;

    const totalGridWidth = (cols - 1) * spacingX;
    const totalGridHeight = (rows - 1) * spacingY;

    // Horizontal center
    const startX = width / 2 - totalGridWidth / 2;

    // Leave space for title (top UI)
    const topOffset = height * 0.1;

    // Remaining space after title
    const availableHeight = height - topOffset;

    // Vertically center grid inside remaining space
    const startY = topOffset + availableHeight / 2 - totalGridHeight / 2;

    levels.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const btn = this.createLevelButton(level);
      btn.setPosition(x, y);

      page.add(btn);
    });
  }

  /* ================= LEVEL BUTTON ================= */

  createLevelButton(level) {
    const container = this.add.container(0, 0);

    const bg = this.add
      .rectangle(0, 0, 160, 120, 0xffd54f)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const title = this.add
      .text(0, -35, `Level ${level.id}`, {
        fontSize: "18px",
        fontStyle: "bold",
        color: "#000",
      })
      .setOrigin(0.5);

    const limit = this.add
      .text(0, -5, `Limit: ${level.time}s`, {
        fontSize: "14px",
        color: "#000",
      })
      .setOrigin(0.5);

    const best = this.bestTimes[level.id];

    const bestText = this.add
      .text(0, 25, best ? `⭐ ${best}s` : "⭐ --", {
        fontSize: "14px",
        color: best ? "#2e7d32" : "#555",
      })
      .setOrigin(0.5);

    container.add([bg, title, limit, bestText]);

    bg.on("pointerover", () => container.setScale(1.08));
    bg.on("pointerout", () => container.setScale(1));

    bg.on("pointerdown", () => {
      this.cameras.main.fade(300, 0, 0, 0);

      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("LoadingScene", {
          next: "GameScene",
          level: level.id,
        });
      });
    });

    return container;
  }

  /* ================= PAGINATION DOTS ================= */

  createPaginationDots() {
    const { width, height } = this.scale;

    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    const dotSpacing = 20;
    const totalWidth = (totalPages - 1) * dotSpacing;
    const startX = width / 2 - totalWidth / 2;

    for (let i = 0; i < totalPages; i++) {
      const dot = this.add
        .circle(startX + i * dotSpacing, height - 20, 6, 0x999999)
        .setAlpha(i === 0 ? 1 : 0.4);

      this.dots.push(dot);
    }
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.setAlpha(index === this.currentPage ? 1 : 0.4);
    });
  }

  /* ================= SWIPE ================= */

  enableSwipe() {
    const { width } = this.scale;

    let startX = 0;

    this.input.on("pointerdown", (pointer) => {
      startX = pointer.x;
    });

    this.input.on("pointerup", (pointer) => {
      const delta = pointer.x - startX;

      if (Math.abs(delta) < 50) return;

      if (delta < 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    });
  }

  nextPage() {
    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    if (this.currentPage >= totalPages - 1) return;

    this.currentPage++;

    this.tweens.add({
      targets: this.pagesContainer,
      x: -this.scale.width * this.currentPage,
      duration: 300,
      ease: "Power2",
    });

    this.updateDots();
  }

  prevPage() {
    if (this.currentPage <= 0) return;

    this.currentPage--;

    this.tweens.add({
      targets: this.pagesContainer,
      x: -this.scale.width * this.currentPage,
      duration: 300,
      ease: "Power2",
    });

    this.updateDots();
  }
}
