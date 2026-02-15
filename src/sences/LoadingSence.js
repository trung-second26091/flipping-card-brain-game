import Phaser from "phaser";

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super("LoadingScene");
  }

  init(data) {
    // scene sẽ chuyển tới sau loading
    this.nextScene = data.next || "MainMenuScene";
  }

  preload() {
    const { width, height } = this.scale;

    /* ===== Loading Text ===== */
    this.loadingText = this.add
      .text(width / 2, height / 2 - 40, "Loading...", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    /* ===== Progress Bar ===== */
    this.progressBox = this.add.graphics();
    this.progressBar = this.add.graphics();

    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(width / 2 - 160, height / 2, 320, 30, 10);

    this.load.on("progress", (value) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xfacc15, 1);
      this.progressBar.fillRoundedRect(
        width / 2 - 150,
        height / 2 + 5,
        300 * value,
        20,
        8,
      );
    });

    /* ===== Clean when done ===== */
    this.load.on("complete", () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.setText("Almost done...");
    });

    /* ===== LOAD ASSETS (ví dụ) ===== */
    // this.load.image("search-skill", "/assets/skills/search.png");
    // this.load.image("card", "/assets/skills/search.png");
  }

  create() {
    // ⏱ đợi thêm 300ms cho mượt UX
    this.time.delayedCall(1000, () => {
      if (this.level !== undefined) {
        // ✅ Only GameScene needs level
        this.scene.start(this.nextScene, {
          level: this.level,
        });
      } else {
        // ✅ Other scenes don't need data
        this.scene.start(this.nextScene);
      }
    });
  }
}
