import { createRectButton } from "../utils/Button";

export default class WinPopup {
  constructor(scene, data) {
    this.scene = scene;
    this.GW = scene.GAME_WIDTH;
    this.GH = scene.GAME_HEIGHT;

    const {
      level,
      movesUsed,
      bestMoves,
      isNewRecord,
      onReplay,
      onNext,
      onBack,
    } = data;

    this.createOverlay();
    this.createBox(
      level,
      movesUsed,
      bestMoves,
      isNewRecord,
      onReplay,
      onNext,
      onBack,
    );
  }

  createOverlay() {
    this.overlay = this.scene.add
      .rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        this.scene.scale.width,
        this.scene.scale.height,
        0x000000,
        0.6,
      )
      .setDepth(1000)
      .setInteractive();
  }

  createBox(
    level,
    movesUsed,
    bestMoves,
    isNewRecord,
    onReplay,
    onNext,
    onBack,
  ) {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.box = this.scene.add
      .container(centerX, centerY)
      .setDepth(1001)
      .setScale(0);

    const bg = this.scene.add.rectangle(
      0,
      0,
      this.GW * 0.8,
      this.GH * 0.44,
      0xffffff,
    );
    bg.setStrokeStyle(4, 0xfacc15);

    const title = this.scene.add
      .text(0, -(this.GH * 0.179), `🎉 LEVEL ${level} COMPLETE`, {
        fontSize: "22px",
        color: "#000",
      })
      .setOrigin(0.5);

    const moveText = this.scene.add
      .text(0, -(this.GH * 0.0976), `Move: ${movesUsed} moves`, {
        fontSize: "18px",
        color: "#333",
      })
      .setOrigin(0.5);

    const bestText = this.scene.add
      .text(0, -(this.GH * 0.04878), `Best: ${bestMoves} moves`, {
        fontSize: "16px",
        color: "#555",
      })
      .setOrigin(0.5);

    const recordText = isNewRecord
      ? this.scene.add
          .text(0, 0, "🔥 NEW RECORD!", {
            fontSize: "16px",
            color: "#ff6600",
          })
          .setOrigin(0.5)
      : null;

    const btnSize = 40;
    const gap = 15;
    const axisY = 60;

    const replayBtn = createRectButton({
      scene: this.scene,
      x: 0,
      y: axisY,
      width: btnSize,
      height: btnSize,
      icon: "🔁",
      onClick: onReplay,
    });

    const nextBtn = createRectButton({
      scene: this.scene,
      x: btnSize + gap,
      y: axisY,
      width: btnSize,
      height: btnSize,
      icon: "➡️",
      onClick: onNext,
    });

    const backBtn = createRectButton({
      scene: this.scene,
      x: -(btnSize + gap),
      y: axisY,
      width: btnSize,
      height: btnSize,
      icon: "⬅️",
      onClick: onBack,
    });

    const elements = [
      bg,
      title,
      moveText,
      bestText,
      replayBtn,
      nextBtn,
      backBtn,
    ];
    if (recordText) elements.push(recordText);

    this.box.add(elements);

    /* ===== POPUP ANIMATION ===== */
    this.scene.tweens.add({
      targets: this.box,
      scale: 1,
      duration: 300,
      ease: "Back.Out",
    });
  }

  destroy() {
    this.overlay.destroy();
    this.box.destroy();
  }
}
