import { createRectButton } from "../utils/Button";

export default class GuidePopup {
  static preload(scene) {
    scene.load.image("guide-flip", "/assets/skills/search.png");
    scene.load.image("guide-skill", "/assets/skills/search.png");
    scene.load.image("guide-timer", "/assets/skills/search.png");
  }
  constructor(scene) {
    this.scene = scene;
    this.GW = scene.scale.width;
    this.GH = scene.scale.height;

    this.pageIndex = 0;

    this.pages = [
      {
        title: "Flip Cards",
        imageKey: "guide-flip",
        text: "Tap cards to flip them.\nFind matching pairs.",
      },
      {
        title: "Use Skills",
        imageKey: "guide-skill",
        text: "Use skills to help you\nwhen you are stuck.",
      },
      {
        title: "Beat the Timer",
        imageKey: "guide-timer",
        text: "Match all cards\nbefore time runs out!",
      },
    ];

    this.create();
  }

  /* ================= CREATE ================= */

  create() {
    const scene = this.scene;

    const radius = 20;

    this.container = scene.add.container(this.GW / 2, this.GH / 2);
    this.container.setDepth(2000);

    /* ===== OVERLAY ===== */
    const overlay = scene.add.rectangle(0, 0, this.GW, this.GH, 0x000000, 0.55);
    overlay.setInteractive();

    /* ===== MODAL ===== */
    this.modal = scene.add.container(0, 0);

    let w = this.GW * 0.8;
    let h = this.GH * 0.72;
    if (this.GH < 500) {
      h = this.GH * 0.9;
    }

    const bg = scene.add.graphics();
    bg.fillStyle(0xfef3c7, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);

    bg.lineStyle(5, 0xfacc15, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);

    this.content = scene.add.container(0, -20);

    this.createButtons(w, h);

    this.modal.add([bg, this.content, ...this.buttons]);
    this.container.add([overlay, this.modal]);

    this.showPage(0, false);
    this.updateButtonVisibility();

    /* OPEN animation */
    this.modal.setScale(0);
    scene.tweens.add({
      targets: this.modal,
      scale: 1,
      duration: 450,
      ease: "Back.Out",
    });
  }

  /* ================= CONTENT ================= */

  showPage(index, animate = true, direction = 1) {
    if (index < 0 || index >= this.pages.length) return;

    const scene = this.scene;
    const page = this.pages[index];
    this.pageIndex = index;

    const newContent = scene.add.container(0, 0);

    const title = scene.add
      .text(0, -160, page.title, {
        fontSize: "26px",
        fontStyle: "bold",
        color: "#1f2937",
      })
      .setOrigin(0.5);

    const image = scene.add
      .image(0, -40, page.imageKey)
      .setScale(0.6)
      .setOrigin(0.5);

    const text = scene.add
      .text(0, 100, page.text, {
        fontSize: "18px",
        color: "#374151",
        align: "center",
      })
      .setOrigin(0.5);

    newContent.add([title, image, text]);

    if (!animate) {
      this.content.removeAll(true);
      this.content.add(newContent);
      return;
    }

    /* PAGE TURN animation */
    newContent.x = direction * this.GW;
    this.content.add(newContent);

    scene.tweens.add({
      targets: newContent,
      x: 0,
      duration: 300,
      ease: "Cubic.Out",
    });

    scene.tweens.add({
      targets: this.content.list[0],
      x: -direction * this.GW,
      duration: 300,
      ease: "Cubic.In",
      onComplete: () => {
        this.content.remove(this.content.list[0], true);
      },
    });

    this.updateButtonVisibility();
  }

  /* ================= BUTTONS ================= */

  createButtons(w, h) {
    const scene = this.scene;
    const size = w < h ? w / 2 - 110 : h / 2 - 110;

    this.buttons = [];

    this.btnBack = createRectButton({
      scene,
      x: -w / 2 + 50,
      y: h / 2 - 40,
      width: size,
      height: size,
      icon: "⬅️",
      onClick: () => this.showPage(this.pageIndex - 1, true, -1),
    });

    this.btnNext = createRectButton({
      scene,
      x: w / 2 - 50,
      y: h / 2 - 40,
      width: size,
      height: size,
      icon: "➡️",
      onClick: () => this.showPage(this.pageIndex + 1, true, 1),
    });

    this.btnPlay = createRectButton({
      scene,
      x: w / 2 - 50,
      y: h / 2 - 40,
      width: size,
      height: size,
      text: "PLAY",
      onClick: () => {
        this.close();
        this.scene.scene.start("GameScene");
      },
    });

    this.btnExit = createRectButton({
      scene,
      x: 0,
      y: h / 2 - 40,
      width: size,
      height: size,
      icon: "❌",
      onClick: () => this.close(),
    });

    this.buttons.push(this.btnBack, this.btnNext, this.btnExit, this.btnPlay);
  }

  updateButtonVisibility() {
    const lastIndex = this.pages.length - 1;

    const isFirst = this.pageIndex === 0;
    const isLast = this.pageIndex === lastIndex;

    // BACK
    this.btnBack.setVisible(!isFirst);

    // NEXT
    this.btnNext.setVisible(!isLast);

    // PLAY
    this.btnPlay.setVisible(isLast);
  }

  /* ================= CLOSE ================= */

  close() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.modal,
      scale: 0,
      duration: 350,
      ease: "Back.In",
      onComplete: () => {
        this.container.destroy();

        // emit event về Scene
        scene.events.emit("guideClosed");
      },
    });
  }
}
