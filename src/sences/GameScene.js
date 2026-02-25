import Phaser from "phaser";
import SkillManager from "../components/SkillManager";
import PausePopup from "../ui/PausePopup";
import { createRectButton } from "../utils/Button";
import UserInformation from "../components/UserInformation";
import LevelLoader from "../components/LevelLoader";
import BoardManager from "../components/BoardManager";
// import GameTimer from "../components/GameTimer";
import WinPopup from "../ui/WinPopup";
// import LosePopup from "../ui/LosePopup";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.board = null;
    this.rows = null;
    this.cols = null;
    this.gold = null;
    this.flipped = null;
    this.lock = null;
    this.GAME_WIDTH = null;
    this.GAME_HEIGHT = null;
    this.skillManager = null;
    this.currentLevel = null;
    this.levelLoader = null;
    // this.timerManager = null;
  }

  init(data) {
    this.rows = 4;
    this.cols = 4;
    this.gold = 0;
    this.flipped = [];
    this.lock = false;
    this.GAME_WIDTH = this.game.config.width;
    this.GAME_HEIGHT = this.game.config.height;
    this.skillManager = new SkillManager(this);
    this.currentLevel = data.level || 1;
    this.levelLoader = null;
  }

  create() {
    this.createBackground();

    this.levelLoader = new LevelLoader(this);

    this.createUI();

    // this.timerManager = new GameTimer(this, {
    //   onTick: (timeLeft) => {
    //     this.timeText.setText(`⏱ Time: ${timeLeft}`);
    //   },
    //   onTimeUp: () => {
    //   },
    // });

    console.log("Current level:", this.currentLevel);

    this.loadLevel(this.currentLevel);

    // ===== START ANIMATION =====
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.cameras.main.setZoom(0.9);

    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1,
      duration: 400,
      ease: "Back.Out",
    });
  }

  preload() {
    this.load.image("search-skill", "/assets/skills/search-mac.png");
    this.load.image("cucatim", "/assets/cards/cucatim.png");
    this.load.image("base_image", "/assets/cards/base.png");
    this.load.image("banhtrungthu", "/assets/cards/banhtrungthu.png");
    this.load.image("bapcaitim", "/assets/cards/bapcaitim.png");
    this.load.image("bido", "/assets/cards/bido.png");
    this.load.image("cachua", "/assets/cards/cachua.png");
    this.load.image("caibexanh", "/assets/cards/caibexanh.png");

    UserInformation.preload(this);
  }

  /* ================= UI ================= */
  createUI() {
    const UI_TOP = 10;

    // this.timeText = this.add.text(
    //   this.GAME_WIDTH - 100,
    //   UI_TOP + 50,
    //   `⏱ Time: ${this.levelLoader.getTime()}`,
    //   {
    //     fontSize: `${this.GAME_HEIGHT * 0.02276}px`,
    //     color: "#030712",
    //   },
    // );

    this.moveText = this.add.text(this.GAME_WIDTH - 140, 30, `Moves: 0`, {
      fontSize: `${this.GAME_HEIGHT * 0.02276}px`,
      color: "#030712",
    });

    // /* ===== ITEM BAR ===== */
    // const ITEM_BAR_HEIGHT = this.GAME_HEIGHT * 0.2;

    // // background
    // const bg = this.add.graphics();

    // // fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, alpha)
    // bg.fillGradientStyle(
    //   // 0xffb93b, // bottom-right
    //   0xfef9c2, // top-left
    //   0xfef9c2, // top-right
    //   0xfefce8, // bottom-left
    //   0xfefce8, // bottom-right
    //   0.9, // alpha top
    //   0.9,
    //   1, // alpha bottom
    //   1,
    // );

    // bg.fillRect(
    //   0,
    //   this.GAME_HEIGHT - ITEM_BAR_HEIGHT,
    //   this.GAME_WIDTH,
    //   ITEM_BAR_HEIGHT,
    // );

    // bg.lineStyle(10, 0xffb93b, 1); // thickness, color, alpha
    // bg.beginPath();
    // bg.moveTo(0, this.GAME_HEIGHT - ITEM_BAR_HEIGHT);
    // bg.lineTo(this.GAME_WIDTH, this.GAME_HEIGHT - ITEM_BAR_HEIGHT);
    // bg.strokePath();

    // // tạo 3 button
    // this.createItemButton({
    //   x: this.GAME_WIDTH * 0.2,
    //   y: this.GAME_HEIGHT * 0.905,
    //   width: this.GAME_WIDTH * 0.2,
    //   height: this.GAME_HEIGHT * 0.16,
    //   imageKey: "search-skill",
    //   price: "50",
    //   callback: () => this.skillManager.useHint(),
    // });

    // this.createItemButton({
    //   x: this.GAME_WIDTH * 0.5,
    //   y: this.GAME_HEIGHT * 0.905,
    //   width: this.GAME_WIDTH * 0.2,
    //   height: this.GAME_HEIGHT * 0.16,
    //   imageKey: "card",
    //   price: "50",
    //   callback: () => this.skillManager.addTime(),
    // });

    // this.createItemButton({
    //   x: this.GAME_WIDTH * 0.8,
    //   y: this.GAME_HEIGHT * 0.905,
    //   width: this.GAME_WIDTH * 0.2,
    //   height: this.GAME_HEIGHT * 0.16,
    //   imageKey: "search-skill",
    //   price: "100",
    //   callback: () => this.skillManager.openAllCards(),
    // });

    this.createPauseButton();

    // ===== TOP BAR ===== (user information)
    this.userInfo = new UserInformation(this);

    this.userInfo.setLevel(1);
    this.userInfo.setHighest(0);
  }

  loadLevel(levelNumber) {
    const levelData = this.levelLoader.getLevel(levelNumber);

    if (!levelData) {
      console.log("No more levels!");
      return;
    }

    // destroy old board
    if (this.board) {
      this.board.destroy();
    }

    this.board = new BoardManager(this, {
      shape: levelData.shape,
      width: this.GAME_WIDTH * 0.9,
      height: this.GAME_HEIGHT * 0.8,
      x: this.GAME_WIDTH / 2,
      y: this.GAME_HEIGHT / 2 + this.GAME_HEIGHT * 0.05,
      cardImages: ["banhtrungthu", "bapcaitim", "banhtrungthu", "bapcaitim"],

      onMatch: () => {
        // this.gold += 1;
      },

      onMove: (moves) => {
        this.moveText.setText(`Moves: ${moves}`);
      },

      onWin: (totalMoves) => {
        // this.timerManager.stop(); // stop current level timer
        // this.nextLevel();
        this.handleLevelComplete(totalMoves);
      },
    });

    // ⭐ START TIMER USING LEVEL JSON TIME
    // this.timerManager.start(levelData.time);

    this.userInfo.setLevel(levelNumber);

    let bestMovesData =
      JSON.parse(localStorage.getItem("levelBestMoves")) || {};

    const currentBest = bestMovesData[levelNumber] || 0;
    this.userInfo.setHighest(currentBest);
  }

  createPauseButton() {
    const size = 40;

    this.pauseBtn = createRectButton({
      scene: this,
      x: this.GAME_WIDTH - size / 2 - 18,
      y: 35,
      width: size,
      height: size,
      icon: "⏸",
      onClick: () => {
        this.pausePopup = new PausePopup(this);
      },
      radius: 10,
    });
  }

  createItemButton({
    x,
    y,
    width = 110,
    height = 140,
    imageKey,
    price = "100",
    callback,
  }) {
    const container = this.add.container(x, y);

    const imageBoxRadius = 10;

    /* ================= CARD BACKGROUND ================= */
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xfefce8, 0.95);
    cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    /* ================= CARD BORDER ================= */
    const cardBorder = this.add.graphics();
    cardBorder.lineStyle(5, 0xffd230, 0.8);
    cardBorder.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      10, // radius
    );

    /* ================= IMAGE BOX ================= */
    const imageBoxWidth = width * 0.85;
    const imageBoxHeight = height * 0.6;
    const imageBoxY = -height / 2 + imageBoxHeight / 2 + 8;

    const imageBoxBg = this.add.graphics();
    imageBoxBg.fillStyle(0xfefce8, 1);
    imageBoxBg.fillRoundedRect(
      -imageBoxWidth / 2,
      imageBoxY - imageBoxHeight / 2,
      imageBoxWidth,
      imageBoxHeight,
      imageBoxRadius,
    );

    const imageBoxBorder = this.add.graphics();
    imageBoxBorder.lineStyle(1, 0xfacc15, 0.9);
    imageBoxBorder.strokeRoundedRect(
      -imageBoxWidth / 2,
      imageBoxY - imageBoxHeight / 2,
      imageBoxWidth,
      imageBoxHeight,
      imageBoxRadius,
    );

    /* ================= IMAGE ================= */
    const iconImage = this.add.image(0, imageBoxY, imageKey);
    iconImage.setOrigin(0.5);

    const scale =
      Math.min(
        imageBoxWidth / iconImage.width,
        imageBoxHeight / iconImage.height,
      ) * 0.75;

    iconImage.setScale(scale);

    /* ================= PRICE ================= */
    const priceIcon = this.add
      .image(-10, height / 2 - 13, "icon-gold")
      .setDisplaySize(this.GAME_WIDTH * 0.05, this.GAME_HEIGHT * 0.04);

    const priceText = this.add
      .text(10, height / 2 - 13, price, {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#A65F1B",
      })
      .setOrigin(0.5);

    /* ================= INTERACTION HIT AREA ================= */
    const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on("pointerover", () => {
      cardBorder.clear();
      cardBorder.lineStyle(5, 0xffb93b, 0.8);
      cardBorder.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      container.setScale(1.05);
    });

    hitArea.on("pointerout", () => {
      cardBorder.clear();
      cardBorder.lineStyle(5, 0xffd230, 0.8);
      cardBorder.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      container.setScale(1);
    });

    hitArea.on("pointerdown", callback);

    /* ================= ADD TO CONTAINER ================= */
    container.add([
      cardBg,
      cardBorder,
      imageBoxBg,
      imageBoxBorder,
      iconImage,
      priceIcon,
      priceText,
      hitArea,
    ]);

    return container;
  }

  createBackground() {
    const bg = this.add.graphics();
    bg.setDepth(-100); // luôn nằm dưới cùng

    bg.fillGradientStyle(
      0x1a1a00, // top-left
      0x1a1a00, // top-right
      0x1a1a00, // bottom-left
      0x1a1a00, // bottom-right
      1,
    );

    bg.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
  }

  /* ================= END ================= */

  handleLevelComplete(totalMoves) {
    /* ================= SAVE BEST MOVES ================= */

    let bestMovesData =
      JSON.parse(localStorage.getItem("levelBestMoves")) || {};

    const currentBest = bestMovesData[this.currentLevel];

    let isNewRecord = false;

    // Lower moves is better
    if (!currentBest || totalMoves < currentBest) {
      bestMovesData[this.currentLevel] = totalMoves;
      localStorage.setItem("levelBestMoves", JSON.stringify(bestMovesData));
      isNewRecord = true;
    }

    /* ================= SHOW WIN POPUP ================= */

    this.winPopup = new WinPopup(this, {
      level: this.currentLevel,
      movesUsed: totalMoves,
      bestMoves: bestMovesData[this.currentLevel],
      isNewRecord: isNewRecord,

      onReplay: () => {
        this.scene.restart({ level: this.currentLevel });
      },

      onNext: () => {
        const nextLevel = this.currentLevel + 1;

        if (nextLevel > this.levelLoader.getTotalLevels()) {
          this.scene.start("LevelScene");
          return;
        }

        this.scene.restart({ level: nextLevel });
      },

      onBack: () => {
        this.scene.start("LevelScene");
      },
    });
  }
}
