import Phaser from "phaser";
import { createRectButton } from "../utils/Button";
import { toggleSound } from "../helpers/SoundHelper";
import GuidePopup from "../ui/GuidePopup";
import { STYLES } from "../styles";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    GuidePopup.preload(this);

    this.load.image("logo", "/assets/ui/logo.png");
    this.load.image("play-button", "/assets/ui/play_btn.png");
    this.load.image("guide-button", "/assets/ui/guide_btn.png");
    this.load.image("sound-on-button", "/assets/ui/sound_on_btn.png");
    this.load.image("sound-off-button", "/assets/ui/sound_off_btn.png");
  }

  create() {
    this.guidePopup = null;

    const { width, height } = this.scale;

    /* ===== ROOT CONTAINER ===== */
    this.root = this.add.container(0, 0);

    /* ===== BACKGROUND ===== */
    const bg = this.add.graphics();

    bg.fillGradientStyle(
      0xffc105,
      0x231e0f,
      0x231e0f,
      0xffc105,
      0.1,
      1,
      1,
      0.1,
    );

    bg.fillRect(0, 0, width, height);

    /* ===== TITLE ===== */
    // const title = this.add
    //   .text(width / 2, height * 0.3, "Flipping Brain", {
    //     fontSize: "38px",
    //     fontStyle: "bold",
    //     color: "#fde68a",
    //     ...STYLES.TextButton,
    //   })
    //   .setOrigin(0.5);

    const titleLogo = this.add
      .image(width / 2, height * 0.35, "logo")
      .setOrigin(0.5)
      .setScale(0.4);

    const titleTop = this.add
      .text(width / 2, height * 0.52, "Flipping", {
        fontSize: "42px",
        fontStyle: "bold",
        color: "#fde68a",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    // BRAIN (white)
    const titleBottom = this.add
      .text(width / 2, height * 0.62, "Brain", {
        fontSize: "42px",
        fontStyle: "bold",
        color: "#ffffff",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    /* ===== PLAY BUTTON ===== */
    const playBtn = this.createPlayButton(width / 2, height * 0.85);

    /* ===== FOOTER ===== */
    // const footer = this.add
    //   .text(width / 2, height * 0.9, "Tap PLAY to start", {
    //     fontSize: "18px",
    //     color: "#94A3B8",
    //     ...STYLES.TextButton,
    //   })
    //   .setOrigin(0.5);

    this.root.add([bg, titleLogo, titleTop, titleBottom, playBtn]);

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
    const size = 50;

    const guideBtn = createRectButton({
      scene: this,
      x: width - 115,
      y: 50,
      width: size,
      height: size,
      imageKey: "guide-button",
      onClick: () => this.openGuide(),
      radius: size / 2,
      bgColor: 0xffc105,
      opacity: 0.05,
    });

    const soundBtn = createRectButton({
      scene: this,
      x: width - 50,
      y: 50,
      width: size,
      height: size,
      imageKey: "sound-on-button",
      onClick: () => toggleSound(this, soundBtn),
      radius: size / 2,
      bgColor: 0xffc105,
      opacity: 0.05,
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
      text: "PLAY",
      imageKey: "play-button",
      onClick: () => this.playGame(),
    });

    // idle pulse animation
    this.tweens.add({
      targets: btn,
      scale: 1.03,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    return btn;
  }
  playGame() {
    /* ===== EXIT ANIMATION ===== */
    this.tweens.add({
      targets: this.root,
      scale: 0.8,
      alpha: 0,
      duration: 500,
      ease: "Back.In",
      onComplete: () => {
        this.scene.start("LoadingScene", {
          next: "LevelScene",
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
