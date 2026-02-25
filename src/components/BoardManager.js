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

    this.moves = 0;
    this.onMove = config.onMove;

    this.cards = [];
    this.flipped = [];
    this.lock = false;

    // Card images array - you need to pass this from the scene
    this.cardImages = config.cardImages || []; // Array of image keys

    this.createContainer();
    this.createBoard();
  }

  /* ================= CONTAINER ================= */

  createContainer() {
    this.container = this.scene.add.container(this.x, this.y);

    const bg = this.scene.add.graphics();
    const radius = 25;

    const startX = -this.width / 2;
    const startY = -this.height / 2 + 10;

    // bg.fillStyle(0xf0b13b, 0.15);
    // bg.fillRoundedRect(startX + 6, startY + 6, this.width, this.height, radius);

    bg.fillGradientStyle(
      0x1a1a00,
      0x1a1a00,
      0x1a1a00,
      0x1a1a00,
      0.5,
      1,
      0.5,
      1,
    );
    bg.fillRoundedRect(startX, startY, this.width, this.height, radius);

    bg.lineStyle(1, 0xfacc15, 0.9);
    bg.strokeRoundedRect(startX, startY, this.width, this.height, radius);

    this.container.add(bg);
  }

  /* ================= SHAPE BOARD ================= */

  createBoard() {
    const padding = this.width * 0.04;
    const margin = this.width * 0.083; // Space from board edges

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

    /* ===== CARD IMAGES ===== */
    // Make sure we have enough images
    if (this.cardImages.length < pairCount) {
      console.error("Not enough card images for the number of pairs");
      return;
    }

    // Create pairs of images (each image appears twice)
    let cardImageKeys = [];
    for (let i = 0; i < pairCount; i++) {
      const imageKey = this.cardImages[i];
      cardImageKeys.push(imageKey, imageKey);
    }

    // Shuffle the images
    Phaser.Utils.Array.Shuffle(cardImageKeys);

    /* ===== CALCULATE AVAILABLE SPACE ===== */
    const availableWidth = this.width - margin * 2;
    const availableHeight = this.height - margin * 2;

    // Calculate optimal card dimensions
    const paddingTotalWidth = padding * (cols - 1);
    const paddingTotalHeight = padding * (rows - 1);

    // Calculate final dimensions
    let cardWidth = (availableWidth - paddingTotalWidth) / cols;
    let cardHeight = (availableHeight - paddingTotalHeight) / rows;

    // Ensure minimum size
    cardWidth = Math.max(60, Math.floor(cardWidth)); // Slightly larger for images
    cardHeight = Math.max(60, Math.floor(cardHeight));

    // Recalculate actual grid dimensions with these card sizes
    const gridWidth = cols * cardWidth + padding * (cols - 1);
    const gridHeight = rows * cardHeight + padding * (rows - 1);

    // Center the grid
    const startX = -gridWidth / 2 + cardWidth / 2;
    const startY = -gridHeight / 2 + cardHeight / 2;

    /* ===== CREATE CARDS ===== */
    activeCells.forEach((cell, index) => {
      const x = startX + cell.c * (cardWidth + padding);
      const y = startY + cell.r * (cardHeight + padding);

      // Create a container for each card
      const cardContainer = this.scene.add.container(x, y);

      // Create background color rectangle (full size)
      // const cardBg = this.scene.add
      //   .rectangle(0, 0, cardWidth, cardHeight, 0x1a1a00)
      //   .setOrigin(0.5)
      //   .setStrokeStyle(2, 0x2a2a00);

      const radius = 50;
      // Create card back with background color and border radius using Graphics
      const cardBack = this.scene.add.graphics();

      // Draw background with rounded corners
      cardBack.fillStyle(0x1a1a00, 0.9); // Brown background
      cardBack.fillRoundedRect(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
        radius,
      );

      // Draw border with rounded corners
      cardBack.lineStyle(3, 0x2a2a00, 1);
      cardBack.strokeRoundedRect(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
        radius,
      );

      // Create card back (base image)
      const baseImage = this.scene.add
        .image(0, 0, "base_image")
        .setDisplaySize(cardWidth * 0.3, cardHeight * 0.3)
        .setOrigin(0.5);

      // Create card front (hidden initially)
      const cardFront = this.scene.add
        .image(0, 0, cardImageKeys[index])
        .setDisplaySize(cardWidth, cardHeight)
        .setOrigin(0.5)
        .setVisible(false);

      cardContainer.add([cardBack, baseImage, cardFront]);

      // Store card data
      cardContainer.cardData = {
        imageKey: cardImageKeys[index],
        isFlipped: false,
        cardFront: cardFront,
        baseImage: baseImage,
        cardBack: cardBack,
        backColor: 0x1a1a00, // Back side color
        frontColor: 0xffc107, // Front side color (lighter/brighter)
        radius: radius,
        x: x,
        y: y,
        width: cardWidth,
        height: cardHeight,
      };

      // Create hit area
      const hitArea = this.scene.add
        .rectangle(0, 0, cardWidth, cardHeight, 0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.flipCard(cardContainer));

      cardContainer.add(hitArea);

      this.container.add(cardContainer);
      this.cards.push(cardContainer);
    });
  }

  /* ================= GAMEPLAY ================= */

  flipCard(cardContainer) {
    if (this.lock || cardContainer.cardData.isFlipped) return;

    this.lock = true;
    cardContainer.cardData.isFlipped = true;

    const baseImage = cardContainer.cardData.baseImage;
    const cardFront = cardContainer.cardData.cardFront;
    const cardBackground = cardContainer.cardData.cardBack;
    const frontColor = cardContainer.cardData.frontColor;
    const width = cardContainer.cardData.width;
    const height = cardContainer.cardData.height;
    const radius = cardContainer.cardData.radius;

    // Shrink animation (first half)
    this.scene.tweens.add({
      targets: cardContainer,
      scaleX: 0,
      duration: 150,
      ease: "Linear",
      onComplete: () => {
        // Clear and redraw background with front color
        cardBackground.clear();

        // Draw new background with front color
        cardBackground.fillStyle(frontColor, 0.5);
        cardBackground.fillRoundedRect(
          -width / 2,
          -height / 2,
          width,
          height,
          radius,
        );

        // Redraw border
        cardBackground.lineStyle(3, 0xffc105, 1); // Brighter border for front
        cardBackground.strokeRoundedRect(
          -width / 2,
          -height / 2,
          width,
          height,
          radius,
        );

        // Swap images
        baseImage.setVisible(false);
        cardFront.setVisible(true);

        // Expand animation (second half)
        this.scene.tweens.add({
          targets: cardContainer,
          scaleX: 1,
          duration: 150,
          ease: "Linear",
          onComplete: () => {
            this.flipped.push(cardContainer);

            if (this.flipped.length === 2) {
              this.checkMatch();
            } else {
              this.lock = false;
            }
          },
        });
      },
    });
  }

  checkMatch() {
    const [cardA, cardB] = this.flipped;

    this.moves++;
    this.onMove?.(this.moves);

    this.lock = true;

    if (cardA.cardData.imageKey === cardB.cardData.imageKey) {
      // MATCH
      this.scene.time.delayedCall(300, () => {
        this.flipped = [];
        this.lock = false;

        this.onMatch?.();

        if (this.cards.every((card) => card.cardData.isFlipped)) {
          this.onWin?.(this.moves);
        }
      });
    } else {
      // NOT MATCH → flip back animation
      this.scene.time.delayedCall(500, () => {
        this.flipBack(cardA);
        this.flipBack(cardB);
      });
    }
  }

  flipBack(cardContainer) {
    const baseImage = cardContainer.cardData.baseImage;
    const cardFront = cardContainer.cardData.cardFront;
    const cardBackground = cardContainer.cardData.cardBack;
    const backColor = cardContainer.cardData.backColor;
    const width = cardContainer.cardData.width;
    const height = cardContainer.cardData.height;
    const radius = cardContainer.cardData.radius;

    this.scene.tweens.add({
      targets: cardContainer,
      scaleX: 0,
      duration: 150,
      ease: "Linear",
      onComplete: () => {
        // Clear and redraw background with back color
        cardBackground.clear();

        // Draw original background
        cardBackground.fillStyle(backColor, 0.9);
        cardBackground.fillRoundedRect(
          -width / 2,
          -height / 2,
          width,
          height,
          radius,
        );

        // Redraw border
        cardBackground.lineStyle(3, 0x2a2a00, 1);
        cardBackground.strokeRoundedRect(
          -width / 2,
          -height / 2,
          width,
          height,
          radius,
        );

        // Swap images back
        cardFront.setVisible(false);
        baseImage.setVisible(true);
        cardContainer.cardData.isFlipped = false;

        this.scene.tweens.add({
          targets: cardContainer,
          scaleX: 1,
          duration: 150,
          ease: "Linear",
          onComplete: () => {
            // When both cards finished closing
            this.backCount = (this.backCount || 0) + 1;

            if (this.backCount === 2) {
              this.backCount = 0;
              this.flipped = [];
              this.lock = false;
            }
          },
        });
      },
    });
  }

  destroy() {
    this.container.destroy(true);
  }
}
