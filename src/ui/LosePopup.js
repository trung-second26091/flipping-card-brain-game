export default class LosePopup {
  constructor(scene, data) {
    this.scene = scene;

    const { onReplay, onBack } = data;

    this.createOverlay();
    this.createBox(onReplay, onBack);
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
      .setDepth(1000);
  }

  createBox(onReplay, onBack) {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.box = this.scene.add.container(centerX, centerY).setDepth(1001);

    const bg = this.scene.add.rectangle(0, 0, 350, 220, 0xffffff, 1);
    bg.setStrokeStyle(4, 0xff4444);

    const title = this.scene.add
      .text(0, -50, "⏰ TIME UP!", {
        fontSize: "22px",
        color: "#ff0000",
      })
      .setOrigin(0.5);

    const replayBtn = this.createButton(0, 20, "Replay", onReplay);
    const backBtn = this.createButton(0, 70, "Back to Levels", onBack);

    this.box.add([bg, title, replayBtn, backBtn]);
  }

  createButton(x, y, label, callback) {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, 180, 40, 0xff6666);
    bg.setInteractive({ useHandCursor: true });

    const text = this.scene.add
      .text(0, 0, label, { fontSize: "16px", color: "#000" })
      .setOrigin(0.5);

    bg.on("pointerdown", callback);

    container.add([bg, text]);

    return container;
  }

  destroy() {
    this.overlay.destroy();
    this.box.destroy();
  }
}
