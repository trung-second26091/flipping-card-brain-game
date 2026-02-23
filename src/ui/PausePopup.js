import { toggleSound } from "../helpers/SoundHelper";
import { createRectButton } from "../utils/Button";

export default class PausePopup {
  constructor(scene) {
    this.scene = scene;
    this.GW = scene.GAME_WIDTH;
    this.GH = scene.GAME_HEIGHT;

    this.create();
  }

  create() {
    const scene = this.scene;

    // scene.timer && (scene.timer.paused = true);

    this.container = scene.add.container(this.GW / 2, this.GH / 2);
    this.container.setDepth(1000);

    /* ===== OVERLAY ===== */
    const overlay = scene.add.rectangle(0, 0, this.GW, this.GH, 0x000000, 0.5);
    overlay.setInteractive();

    /* ===== MODAL ===== */
    const modalW = this.GW * 0.4;
    const modalH = this.GH * 0.25;

    const x = -modalW / 2;
    const y = -modalH / 2;
    const radius = 20;

    const bg = scene.add.graphics();

    /* ===== Shadow ===== */
    bg.fillStyle(0xf0b13b, 0.35);
    bg.fillRoundedRect(x + 8, y + 8, modalW, modalH, radius);

    /* ===== Gradient (Top → Bottom) ===== */
    bg.fillGradientStyle(
      0xfef9c2, // top-left
      0xfef9c2, // top-right
      0xfefce8, // bottom-left
      0xfefce8, // bottom-right
      1, // alpha top
      1,
      1, // alpha bottom
      1,
    );

    bg.fillRoundedRect(x, y, modalW, modalH, radius);

    /* ===== Border ===== */
    bg.lineStyle(5, 0xfacc15, 0.8);
    bg.strokeRoundedRect(x, y, modalW, modalH, radius);

    // ✅ ADD OVERLAY + BG FIRST
    this.container.add([overlay, bg]);

    const btnSize = 40;
    const gap = 15;

    const bottomY = 30;
    const topY = bottomY - btnSize - 15;

    // vị trí 2 nút dưới
    const leftX = -(btnSize / 2 + gap / 2);
    const rightX = btnSize / 2 + gap / 2;

    /* ===== REPLAY BUTTON (BOTTOM, LEFT) ===== */
    const replayBtn = createRectButton({
      scene,
      x: leftX,
      y: bottomY,
      width: btnSize,
      height: btnSize,
      icon: "🔄",
      onClick: () => this.replayLevel(),
    });

    this.container.add(replayBtn);

    /* ===== LEVEL SCENE BUTTON (BOTTOM, RIGHT) ===== */
    const levelSceneBtn = createRectButton({
      scene,
      x: rightX,
      y: bottomY,
      width: btnSize,
      height: btnSize,
      icon: "📋",
      onClick: () => this.navigateToLevelScene(),
    });

    this.container.add(levelSceneBtn);

    /* ===== RESUME BUTTON (LEFT) ===== */
    const resumeBtn = createRectButton({
      scene,
      x: leftX,
      y: topY,
      width: btnSize,
      height: btnSize,
      icon: "▶",
      onClick: () => this.close(),
    });

    this.container.add(resumeBtn);

    /* ===== HOME BUTTON (RIGHT) ===== */
    const homeBtn = createRectButton({
      scene,
      x: rightX,
      y: topY,
      width: btnSize,
      height: btnSize,
      icon: "🏠",
      onClick: () => this.navigateToMenuScene(),
    });

    this.container.add(homeBtn);

    /* ===== ANIMATION ===== */
    this.container.setScale(0);
    scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 450,
      ease: "Back.Out",
    });
  }

  navigateToMenuScene() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.container,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: "Back.In",
      onComplete: () => {
        scene.scene.start("LoadingScene", {
          next: "MainMenuScene",
        });
      },
    });
  }

  navigateToLevelScene() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.container,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: "Back.In",
      onComplete: () => {
        scene.scene.start("LoadingScene", {
          next: "LevelScene",
        });
      },
    });
  }

  replayLevel() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.container,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: "Back.In",
      onComplete: () => {
        scene.scene.start("LoadingScene", {
          next: "GameScene",
          level: scene.currentLevel,
        });
      },
    });
  }

  close() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.container,
      scale: 0,
      duration: 300,
      ease: "Back.In",
      onComplete: () => {
        this.container.destroy();
        // scene.timer && (scene.timer.paused = false);
        scene.input.enabled = true;
      },
    });
  }
}
