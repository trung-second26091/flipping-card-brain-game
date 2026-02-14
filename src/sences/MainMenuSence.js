import Phaser from "phaser";
import { createRectButton } from "../utils/Button";
import { toggleSound } from "../helpers/SoundHelper";
import GuidePopup from "../ui/GuidePopup";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    GuidePopup.preload(this);
  }

  create() {
    this.guidePopup = null;

    const { width, height } = this.scale;

    /* ===== ROOT CONTAINER ===== */
    this.root = this.add.container(0, 0);

    /* ===== BACKGROUND ===== */
    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x0f172a,
    );

    /* ===== TITLE ===== */
    const title = this.add
      .text(width / 2, height * 0.3, "🧠 Flipping Brain", {
        fontSize: "38px",
        fontStyle: "bold",
        color: "#fde68a",
      })
      .setOrigin(0.5);

    /* ===== PLAY BUTTON ===== */
    const playBtn = this.createPlayButton(width / 2, height * 0.55);

    /* ===== FOOTER ===== */
    const footer = this.add
      .text(width / 2, height * 0.9, "Tap PLAY to start", {
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    this.root.add([bg, title, playBtn, footer]);

    /* ===== INTRO ANIMATION ===== */
    this.root.setAlpha(0);
    this.root.y = 40;

    this.tweens.add({
      targets: this.root,
      alpha: 1,
      y: 0,
      duration: 500,
      ease: "Power2.Out",
    });

    /* ===== ICON BUTTONS ===== */
    this.soundOn = true;
    const size = 40;

    const guideBtn = createRectButton({
      scene: this,
      x: width - 110,
      y: 50,
      width: size,
      height: size,
      icon: "❓",
      onClick: () => this.openGuide(),
      radius: 5,
    });

    const soundBtn = createRectButton({
      scene: this,
      x: width - 50,
      y: 50,
      width: size,
      height: size,
      icon: "🔊",
      onClick: () => toggleSound(this, soundBtn),
      radius: 5,
    });

    this.root.add([guideBtn, soundBtn]);
  }

  createPlayButton(x, y) {
    const btn = createRectButton({
      scene: this,
      x,
      y,
      width: 240,
      height: 70,
      icon: "▶ PLAY",
      onClick: () => this.playGame(),
    });

    // idle pulse animation
    this.tweens.add({
      targets: btn,
      scale: 1.03,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    return btn;
  }
  playGame() {
    this.input.enabled = false;

    /* ===== EXIT ANIMATION ===== */
    this.tweens.add({
      targets: this.root,
      scale: 0.8,
      alpha: 0,
      duration: 350,
      ease: "Back.In",
      onComplete: () => {
        this.scene.start("LoadingScene", {
          next: "GameScene",
        });
      },
    });
  }

  openGuide() {
    if (this.guidePopup) return;

    this.guidePopup = new GuidePopup(this);

    // lắng nghe event từ Scene
    this.events.once("guideClosed", () => {
      this.input.enabled = true;
      this.guidePopup = null;
    });
  }
}
