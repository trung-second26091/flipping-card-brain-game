import Phaser from "phaser";
import SkillManager from "../actions/SkillManager";
import PausePopup from "../ui/PausePopup";
import { createRectButton } from "../utils/Button";
import UserInformation from "../ui/UserInformation";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init() {
    this.rows = 5;
    this.cols = 4;
    this.timeLeft = 60;
    this.gold = 0;
    this.flipped = [];
    this.lock = false;
    this.GAME_WIDTH = this.game.config.width;
    this.GAME_HEIGHT = this.game.config.height;
    this.skillManager = new SkillManager(this);
  }

  create() {
    this.createBackground();

    this.createUI();
    this.createBoardContainer();
    this.createBoard();
    this.startTimer();

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
    this.load.image("card", "/assets/cards/cucatim.png");

    UserInformation.preload(this);
  }

  /* ================= UI ================= */
  createUI() {
    const UI_TOP = 10;

    this.timeText = this.add.text(
      this.GAME_WIDTH - 100,
      UI_TOP + 50,
      "⏱ Time: 60",
      {
        fontSize: "14px",
        color: "#030712",
      },
    );
    /* ===== ITEM BAR ===== */
    const ITEM_BAR_HEIGHT = this.GAME_HEIGHT * 0.2;

    // background
    const bg = this.add.graphics();

    // fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, alpha)
    bg.fillGradientStyle(
      // 0xffb93b, // bottom-right
      0xfef9c2, // top-left
      0xfef9c2, // top-right
      0xfefce8, // bottom-left
      0xfefce8, // bottom-right
      0.9, // alpha top
      0.9,
      1, // alpha bottom
      1,
    );

    bg.fillRect(
      0,
      this.GAME_HEIGHT - ITEM_BAR_HEIGHT,
      this.GAME_WIDTH,
      ITEM_BAR_HEIGHT,
    );

    bg.lineStyle(10, 0xffb93b, 1); // thickness, color, alpha
    bg.beginPath();
    bg.moveTo(0, this.GAME_HEIGHT - ITEM_BAR_HEIGHT);
    bg.lineTo(this.GAME_WIDTH, this.GAME_HEIGHT - ITEM_BAR_HEIGHT);
    bg.strokePath();

    // tạo 3 button
    this.createItemButton({
      x: this.GAME_WIDTH * 0.2,
      y: this.GAME_HEIGHT * 0.91,
      width: this.GAME_WIDTH * 0.2,
      height: this.GAME_HEIGHT * 0.16,
      imageKey: "search-skill",
      price: "50",
      callback: () => this.skillManager.useHint(),
    });

    this.createItemButton({
      x: this.GAME_WIDTH * 0.5,
      y: this.GAME_HEIGHT * 0.91,
      width: this.GAME_WIDTH * 0.2,
      height: this.GAME_HEIGHT * 0.16,
      imageKey: "card",
      price: "50",
      callback: () => this.skillManager.addTime(),
    });

    this.createItemButton({
      x: this.GAME_WIDTH * 0.8,
      y: this.GAME_HEIGHT * 0.91,
      width: this.GAME_WIDTH * 0.2,
      height: this.GAME_HEIGHT * 0.16,
      imageKey: "search-skill",
      price: "100",
      callback: () => this.skillManager.openAllCards(),
    });

    this.createPauseButton();

    // ===== TOP BAR ===== (user information)
    this.userInfo = new UserInformation(this);

    this.userInfo.setLevel(5);
    this.userInfo.setGold(2500);
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

  /* ================= Board Container ================= */
  createBoardContainer() {
    const boardWidth = this.GAME_WIDTH * 0.7;
    const boardHeight = this.GAME_HEIGHT * 0.5;

    // container ở giữa màn hình
    this.boardContainer = this.add.container(
      this.GAME_WIDTH / 2,
      this.GAME_HEIGHT / 2 - 30,
    );

    /* ===== Background rectangle ===== */
    const bg = this.add.graphics();

    const x = -boardWidth / 2;
    const y = -boardHeight / 2;
    const radius = 25;

    // shadow
    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(x + 6, y + 6, boardWidth, boardHeight, radius);

    // gradient
    bg.fillGradientStyle(0xffffff, 0xffffff, 0xfef3c7, 0xfde68a, 1);

    bg.fillRoundedRect(x, y, boardWidth, boardHeight, radius);

    // border
    bg.lineStyle(4, 0xfacc15, 0.8);
    bg.strokeRoundedRect(x, y, boardWidth, boardHeight, radius);

    this.boardContainer.add(bg);
  }

  /* ================= BOARD ================= */
  createBoard() {
    const total = this.rows * this.cols;
    const pairCount = total / 2;

    let colors = [];
    for (let i = 0; i < pairCount; i++) {
      const color = Phaser.Display.Color.RandomRGB();
      colors.push(color, color);
    }

    Phaser.Utils.Array.Shuffle(colors);

    const boardWidth = this.GAME_WIDTH * 0.5;
    const boardHeight = this.GAME_HEIGHT * 0.5;

    const cardSize = boardHeight / this.rows - 10;

    const offsetX = -boardWidth / 2 + cardSize / 2 - 20;
    const offsetY = -boardHeight / 2 + cardSize / 2;

    this.cards = [];

    colors.forEach((color, index) => {
      const x = offsetX + (index % this.cols) * cardSize;
      const y = offsetY + Math.floor(index / this.cols) * cardSize;

      const card = this.add.rectangle(
        x,
        y,
        cardSize - 10,
        cardSize - 10,
        0x444444,
      );

      card.colorValue = color.color;
      card.isFlipped = false;
      card.setInteractive();

      card.on("pointerdown", () => this.flipCard(card));

      this.boardContainer.add(card); // 👈 add vào container
      this.cards.push(card);
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
      .image(-10, height / 2 - 15, "icon-gold")
      .setDisplaySize(this.GAME_WIDTH * 0.05, this.GAME_HEIGHT * 0.04);

    const priceText = this.add
      .text(15, height / 2 - 15, price, {
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
      0xfefce8, // top-left
      0xfefce8, // top-right
      0xfef9c2, // bottom-left
      0xfef9c2, // bottom-right
      1,
    );

    bg.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
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
      this.gold += 1;
      this.goldText.setText(`💰 Gold: ${this.gold}`);
      this.flipped = [];
      this.lock = false;

      if (this.cards.every((c) => c.isFlipped)) {
        this.winGame();
      }
    } else {
      this.time.delayedCall(700, () => {
        a.isFlipped = false;
        b.isFlipped = false;
        a.fillColor = 0x444444;
        b.fillColor = 0x444444;
        this.flipped = [];
        this.lock = false;
      });
    }
  }

  /* ================= TIMER ================= */
  startTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft--;
        this.timeText.setText(`⏱ Time: ${this.timeLeft}`);

        if (this.timeLeft <= 0) {
          this.timer.remove();
          this.loseGame();
        }
      },
    });
  }

  /* ================= END ================= */
  winGame() {
    this.timer.remove();
    this.gold += 20;
    this.goldText.setText(`💰 Gold: ${this.gold}`);

    this.add
      .text(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, "🎉 YOU WIN!", {
        fontSize: "24px",
      })
      .setOrigin(0.5);
  }

  loseGame() {
    this.add
      .text(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, "⏰ TIME UP!", {
        fontSize: "24px",
        color: "#ff5555",
      })
      .setOrigin(0.5);
  }
}
