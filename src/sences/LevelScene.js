import Phaser from "phaser";
import { STYLES } from "../styles";
import { createRectButton } from "../utils/Button";

export default class LevelScene extends Phaser.Scene {
  constructor() {
    super("LevelScene");

    this.levels = [];
    this.bestMoves = {};

    this.currentPage = 0;
    this.levelsPerPage = 6;

    this.pagesContainer = null;
    this.dots = [];
  }

  preload() {
    this.load.json("levels", "/assets/data/levels.json");
    this.load.image("home-button", "/assets/ui/home.png");
    this.load.image("least-moves", "/assets/ui/least_moves.png");
    this.load.image("best-moves", "/assets/ui/best_moves.png");
  }

  create() {
    this.currentPage = 0;
    this.dots = [];

    const { width, height } = this.scale;

    this.createBackground();

    this.uiContainer = this.add.container(0, 0);

    const data = this.cache.json.get("levels");
    this.levels = data.levels;

    this.bestMoves = JSON.parse(localStorage.getItem("levelBestMoves")) || {};

    this.add
      .text(width / 2, height * 0.1, "MISSIONS", {
        fontSize: `${height * 0.05}px`,
        fontStyle: "bold",
        color: "#FFC105",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    this.createPages();
    this.createPaginationDots();
    this.enableSwipe();

    this.createHomeButton();

    /* ===== INTRO ANIMATION ===== */
    this.uiContainer.setAlpha(0);
    this.uiContainer.y = 40;

    this.tweens.add({
      targets: this.uiContainer,
      alpha: 1,
      y: 0,
      duration: 500,
      ease: "Power2.Out",
    });

    this.pagesContainer.setAlpha(0);

    this.tweens.add({
      targets: this.pagesContainer,
      alpha: 1,
      duration: 500,
      ease: "Power2.Out",
    });
  }

  /* ================= BACKGROUND ================= */

  createBackground() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x231e0f, 0x231e0f, 0x231e0f, 0x231e0f, 0.1, 1, 1, 1);
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
    const topOffset = height * 0.05;

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
    const { width, height } = this.scale;

    const buttonWidth = width * 0.41;
    const buttonHeight = height * 0.215;
    const radius = 24; // Border radius

    // Create background with linear gradient using Graphics
    const bg = this.add.graphics();

    bg.fillGradientStyle(
      0x231e0f,
      0xffc105,
      0x231e0f,
      0x231e0f,
      0.5,
      0.5,
      0.5,
      0.5,
    );

    bg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      radius,
    );

    // Add border
    bg.lineStyle(2, 0xffc105, 1);
    bg.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      radius,
    );

    // Text elements
    const title = this.add
      .text(
        0,
        -buttonHeight * 0.25,
        `${level.id > 9 ? level.id : "0" + level.id}`,
        {
          fontSize: `${height * 0.07}px`,
          fontStyle: "bold",
          color: "#FFC105",
          stroke: "#ffffff",
          strokeThickness: 1,
          ...STYLES.TextButton,
        },
      )
      .setOrigin(0.5);

    const limitImage = this.add
      .image(-10, buttonHeight * 0.05, "least-moves")
      .setDisplaySize(height * 0.025, height * 0.025)
      .setOrigin(0.5);
    const limit = this.add
      .text(10, buttonHeight * 0.05, `${level.maxMoves || "--"}`, {
        fontSize: `${height * 0.025}px`,
        color: "#94A3B8",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    const bestImage = this.add
      .image(-10, buttonHeight * 0.25, "best-moves")
      .setDisplaySize(height * 0.025, height * 0.025)
      .setOrigin(0.5);

    const best = this.bestMoves[level.id];
    const bestText = this.add
      .text(10, buttonHeight * 0.25, best ? `${best}` : "--", {
        fontSize: `${height * 0.025}px`,
        color: best ? "#FFC105" : "#555555",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);
    const hitArea = this.add
      .rectangle(0, 0, buttonWidth, buttonHeight, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    container.add([bg, hitArea, title, limitImage, limit, bestImage, bestText]);

    // Interactive effects (attach to hitArea instead of bg)
    hitArea.on("pointerover", () => {
      container.setScale(1.08);
    });

    hitArea.on("pointerout", () => {
      container.setScale(1);
    });

    hitArea.on("pointerdown", () => {
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

    const paginationY = height - height * 0.05;
    const dotSpacing = width * 0.05;
    const totalWidth = (totalPages - 1) * dotSpacing;
    const startX = width / 2 - totalWidth / 2;

    // ===== PREV BUTTON =====
    this.prevBtn = this.add
      .text(startX - dotSpacing * 2, paginationY, "◀", {
        fontSize: `${height * 0.04}px`,
        color: "#333",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.prevBtn.on("pointerdown", () => this.prevPage());

    // ===== DOTS =====
    for (let i = 0; i < totalPages; i++) {
      const dot = this.add
        .circle(startX + i * dotSpacing, paginationY, 8, 0xffc105)
        .setInteractive({ useHandCursor: true })
        .setAlpha(i === 0 ? 1 : 0.4)
        .setScale(i === 0 ? 1.1 : 0.8);

      // CLICKABLE DOT
      dot.on("pointerdown", () => {
        this.goToPage(i);
      });

      this.dots.push(dot);
    }

    // ===== NEXT BUTTON =====
    this.nextBtn = this.add
      .text(startX + totalWidth + dotSpacing * 2, paginationY, "▶", {
        fontSize: `${height * 0.04}px`,
        color: "#333",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.nextBtn.on("pointerdown", () => this.nextPage());
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      if (index === this.currentPage) {
        dot.setFillStyle(0xffc105);
        dot.setAlpha(1);
        this.tweens.add({
          targets: dot,
          scale: 1.1,
          duration: 200,
        });
      } else {
        dot.setFillStyle(0xffc105);
        dot.setAlpha(0.4);
        dot.setScale(0.8);
      }
    });
  }

  goToPage(pageIndex) {
    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    if (pageIndex < 0 || pageIndex >= totalPages) return;

    this.currentPage = pageIndex;

    this.tweens.add({
      targets: this.pagesContainer,
      x: -this.scale.width * this.currentPage,
      duration: 300,
      ease: "Power2",
    });

    this.updateDots();
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

  /* ================= BUTTONS ================= */
  createHomeButton() {
    const { width, height } = this.scale;

    const btnSize = 50;

    // const homeBtn = this.add
    //   .rectangle(width - btnSize, height * 0.1, btnSize, btnSize, 0xffd54f)
    //   .setStrokeStyle(3, 0xffffff)
    //   .setOrigin(0.5)
    //   .setInteractive({ useHandCursor: true });

    // const icon = this.add
    //   .text(homeBtn.x, homeBtn.y, "🏠", {
    //     fontSize: `${btnSize * 0.5}px`,
    //   })
    //   .setOrigin(0.5);

    // homeBtn.on("pointerover", () => homeBtn.setScale(1.1));
    // homeBtn.on("pointerout", () => homeBtn.setScale(1));

    // homeBtn.on("pointerdown", () => this.navigateToMenu());

    const homeBtn = createRectButton({
      scene: this,
      x: width - btnSize,
      y: height * 0.09,
      width: btnSize,
      height: btnSize,
      imageKey: "home-button",
      onClick: () => this.navigateToMenu(),
      radius: btnSize / 2,
      bgColor: 0xffc105,
      opacity: 0.05,
    });

    this.uiContainer.add([homeBtn]);
  }

  /* ================= NAVIGATION ================= */
  navigateToMenu() {
    this.cameras.main.fade(300, 0, 0, 0);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("LoadingScene", {
        next: "MainMenuScene",
      });
    });
  }
}
