import { STYLES } from "../styles.js";
export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super("LoadingScene");
  }

  init(data) {
    this.nextScene = data.next || "MainMenuScene";
    this.level = data.level;

    this.fakeProgress = 0;
  }

  preload() {
    const { width, height } = this.scale;

    // Add background
    this.add //
      .rectangle(0, 0, width, height, 0x231e0f)
      .setOrigin(0, 0)
      .setDepth(-1);

    /* ===== Loading Text ===== */
    this.loadingText = this.add
      .text(width / 2 - 120, height / 2 - 15, "Loading...", {
        fontSize: "14px",
        color: "#ffffff",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    /* ===== Progress Bar ===== */
    this.progressBox = this.add.graphics();
    this.progressBar = this.add.graphics();

    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(width / 2 - 70, height / 2, 230, 30, 10);

    // Create percentage text (above right of progress bar)
    this.percentText = this.add
      .text(width / 2 + 170, height / 2 - 15, "0%", {
        fontSize: "16px",
        color: "#facc15",
        fontStyle: "bold",
        ...STYLES.TextButton,
      })
      .setOrigin(1, 0.5); // Right-aligned

    // Fake progress update
    this.time.addEvent({
      delay: 1000, // every 1 second
      repeat: 4, // run 5 times total (0 → 4)
      callback: () => {
        this.progressValue += 0.2; // +20%
        this.updateProgressBar(this.progressValue);

        if (this.progressValue >= 1) {
          this.startNextScene();
        }
      },
    });

    // Also update on real progress
    this.load.on("progress", (value) => {
      // Use the real progress if it's ahead of fake progress
      if (value > this.fakeProgress) {
        this.fakeProgress = value;
        this.updateProgressBar(value);
      }
    });

    /* ===== Clean when done ===== */
    this.load.on("complete", () => {
      // Finish smoothly to 100%
      this.tweens.add({
        targets: this,
        fakeProgress: 1,
        duration: 1000,
        onUpdate: () => {
          this.updateProgressBar(this.fakeProgress);
        },
        onComplete: () => {
          this.startNextScene();
          if (this.spinnerTween) {
            this.spinnerTween.stop();
          }
        },
      });
    });
    /* ===== LOAD ASSETS ===== */
    this.load.image("loading", "/assets/ui/loading.png");
    this.load.image("loading-logo", "/assets/ui/loading_logo.png");
    // Load other assets...
  }

  updateProgressBar(value) {
    const { width } = this.scale;

    this.progressBar.clear();
    this.progressBar.fillStyle(0xfacc15, 1);
    this.progressBar.fillRoundedRect(
      width / 2 - 150,
      this.scale.height / 2 + 5,
      300 * value,
      20,
      8,
    );

    const percent = Math.floor(value * 100);
    this.percentText.setText(`${percent}%`);
  }

  startNextScene() {
    if (this.level !== undefined) {
      this.scene.start(this.nextScene, { level: this.level });
    } else {
      this.scene.start(this.nextScene);
    }
  }

  create() {
    // If the image wasn't added during preload (if loading was too fast), add it now

    const { width, height } = this.scale;
    this.imageLoading = this.add
      .image(width / 2 - 170, height / 2 - 15, "loading")
      .setDisplaySize(height * 0.02, height * 0.02)
      .setOrigin(0.5);

    this.imageLogo = this.add
      .image(width / 2, height / 2 - 120, "loading-logo") // Centered above the progress bar
      .setDisplaySize(height * 0.3, height * 0.3) // Adjusted size
      .setOrigin(0.5);

    this.spinnerTween = this.tweens.add({
      targets: this.imageLoading,
      angle: 360,
      duration: 1500,
      repeat: -1, // Infinite loop
      ease: "Linear",
    });
  }
}
