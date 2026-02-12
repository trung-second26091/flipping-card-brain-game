export default class UserInformation {
  /* =========================
     STATIC PRELOAD (QUAN TRỌNG)
  ========================== */
  static preload(scene) {
    scene.load.image("icon-level", "/assets/ui/level.png");
    scene.load.image("icon-gold", "/assets/ui/coin.png");
    scene.load.image("avatar", "/assets/ui/avatar.jpeg");
  }

  /* =========================
     CONSTRUCTOR
  ========================== */
  constructor(scene) {
    this.scene = scene;

    this.gameWidth = scene.scale.width;
    this.gameHeight = scene.scale.height;

    this.container = scene.add.container(10, 10);
    this.container.setDepth(1000);

    this.createUI();
  }

  /* =========================
     CREATE UI
  ========================== */
  createUI() {
    const scene = this.scene;

    /* ===== Background ===== */
    /* ===== Background (Gradient + Border + Shadow) ===== */
    const width = this.gameWidth * 0.35;
    const height = this.gameHeight * 0.1;
    const radius = 14;

    const bgGraphics = scene.add.graphics();

    /* ---- BOX SHADOW ---- */
    bgGraphics.fillStyle(0x000000, 0.35);
    bgGraphics.fillRoundedRect(6, 6, width, height, radius);

    /* ---- LINEAR GRADIENT ---- */
    bgGraphics.fillGradientStyle(
      0xfef9c2, // top-left
      0xfefce8, // top-right
      0xfef9c2, // bottom-left
      0xfefce8, // bottom-right
      0.9, // alpha top
      0.9,
      1, // alpha bottom
      1,
    );

    bgGraphics.fillRoundedRect(0, 0, width, height, radius);

    /* ---- BORDER ---- */
    bgGraphics.lineStyle(10, 0xfacc15, 0.6);
    bgGraphics.strokeRoundedRect(0, 0, width, height, radius);

    /* ---- INNER HIGHLIGHT (glass effect) ---- */
    bgGraphics.lineStyle(2, 0x88ccff, 0.25);
    bgGraphics.strokeRoundedRect(2, 2, width - 4, height - 4, radius - 4);

    /* ===== Avatar ===== */
    this.avatar = scene.add
      .image(this.gameWidth * 0.07, this.gameHeight * 0.05, "avatar")
      .setDisplaySize(this.gameWidth * 0.11, this.gameHeight * 0.07);

    /* ===== Level ===== */
    const levelIcon = scene.add
      .image(this.gameWidth * 0.186, this.gameHeight * 0.03, "icon-level")
      .setDisplaySize(this.gameWidth * 0.05, this.gameHeight * 0.04);

    this.levelText = scene.add.text(
      this.gameWidth * 0.186 + 20,
      this.gameHeight * 0.03 - 8,
      "1",
      {
        fontSize: `${this.gameWidth * 0.04}px`,
        color: "#A65F1B",
        fontStyle: "bold",
      },
    );

    /* ===== Gold ===== */
    const goldIcon = scene.add
      .image(this.gameWidth * 0.186, this.gameHeight * 0.07, "icon-gold")
      .setDisplaySize(this.gameWidth * 0.05, this.gameHeight * 0.04);

    this.goldText = scene.add.text(
      this.gameWidth * 0.186 + 20,
      this.gameHeight * 0.07 - 8,
      "0",
      {
        fontSize: `${this.gameWidth * 0.04}px`,
        color: "#A65F1B",
        fontStyle: "bold",
      },
    );

    this.container.add([
      bgGraphics,
      this.avatar,
      levelIcon,
      this.levelText,
      goldIcon,
      this.goldText,
    ]);
  }

  /* =========================
     PUBLIC API
  ========================== */

  setLevel(level) {
    this.levelText.setText(level);

    this.scene.tweens.add({
      targets: this.levelText,
      scale: 1.3,
      yoyo: true,
      duration: 150,
    });
  }

  setGold(gold) {
    this.goldText.setText(gold);

    this.scene.tweens.add({
      targets: this.goldText,
      scale: 1.3,
      yoyo: true,
      duration: 150,
    });
  }

  setAvatar(textureKey) {
    if (this.scene.textures.exists(textureKey)) {
      this.avatar.setTexture(textureKey);
    }
  }

  destroy() {
    this.container.destroy(true);
  }
}
