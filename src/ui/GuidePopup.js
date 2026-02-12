export default class GuidePopup {
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

  preload() {
    this.load.image("guide-flip", "/assets/skills/search.png");
    this.load.image("guide-skill", "/assets/skills/search.png");
    this.load.image("guide-timer", "/assets/skills/search.png");
  }

  /* ================= CREATE ================= */

  create() {
    const scene = this.scene;

    scene.input.enabled = false;

    this.container = scene.add.container(this.GW / 2, this.GH / 2);
    this.container.setDepth(2000);

    /* ===== OVERLAY ===== */
    const overlay = scene.add.rectangle(0, 0, this.GW, this.GH, 0x000000, 0.55);
    overlay.setInteractive();

    /* ===== MODAL ===== */
    this.modal = scene.add.container(0, 0);

    const w = this.GW * 0.8;
    const h = this.GH * 0.6;

    const bg = scene.add.graphics();
    bg.fillStyle(0xfef3c7, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);

    this.content = scene.add.container(0, -20);

    this.createButtons(w, h);

    this.modal.add([bg, this.content, ...this.buttons]);
    this.container.add([overlay, this.modal]);

    this.showPage(0, false);

    /* OPEN animation */
    this.modal.setScale(0);
    scene.tweens.add({
      targets: this.modal,
      scale: 1,
      duration: 300,
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
  }

  /* ================= BUTTONS ================= */

  createButtons(w, h) {
    const scene = this.scene;

    this.buttons = [];

    this.btnBack = this.createIconButton(-w / 2 + 50, h / 2 - 40, "⬅️", () =>
      this.showPage(this.pageIndex - 1, true, -1),
    );

    this.btnNext = this.createIconButton(w / 2 - 50, h / 2 - 40, "➡️", () =>
      this.showPage(this.pageIndex + 1, true, 1),
    );

    this.btnExit = this.createIconButton(0, h / 2 - 40, "❌", () =>
      this.close(),
    );

    this.buttons.push(this.btnBack, this.btnNext, this.btnExit);
  }

  createIconButton(x, y, icon, callback) {
    const scene = this.scene;
    const btn = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0xfacc15, 1);
    bg.fillCircle(0, 0, 22);

    const border = scene.add.graphics();
    border.lineStyle(2, 0xffffff, 0.9);
    border.strokeCircle(0, 0, 22);

    const text = scene.add
      .text(0, 0, icon, {
        fontSize: "20px",
      })
      .setOrigin(0.5);

    const hit = scene.add.circle(0, 0, 22, 0x000000, 0);
    hit.setInteractive({ useHandCursor: true });

    hit.on("pointerdown", callback);
    hit.on("pointerover", () => btn.setScale(1.15));
    hit.on("pointerout", () => btn.setScale(1));

    btn.add([bg, border, text, hit]);
    return btn;
  }

  /* ================= CLOSE ================= */

  close() {
    const scene = this.scene;

    scene.tweens.add({
      targets: this.modal,
      scale: 0,
      duration: 250,
      ease: "Back.In",
      onComplete: () => {
        this.container.destroy();
        scene.input.enabled = true;
      },
    });
  }
}
