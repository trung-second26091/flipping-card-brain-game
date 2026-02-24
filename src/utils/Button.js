import { STYLES } from "../styles";

// ui/ButtonUtils.js
export function createRectButton({
  scene,
  x,
  y,
  width,
  height,

  icon = null, // emoji / short text
  text = null, // label text
  imageKey = null, // image texture key

  onClick,
  radius = 16,
  bgColor = 0xfacc15,
  opacity = 1,
  borderColor = 0xffffff,
  borderWidth = 2,
  hoverScale = 1.1,
}) {
  const btn = scene.add.container(x, y);

  /* ===== BACKGROUND ===== */
  const bg = scene.add.graphics();
  bg.fillStyle(bgColor, opacity);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  /* ===== BORDER ===== */
  const border = scene.add.graphics();
  border.lineStyle(borderWidth, borderColor, 0.9);
  border.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  btn.add([bg, border]);

  /* ===== CONTENT ===== */
  let content;

  // 🔥 PRIORITY: image > icon > text
  if (imageKey) {
    content = scene.add
      .image(imageKey && text ? width * 0.1 - 50 : 0, 0, imageKey)
      .setDisplaySize(height * 0.5, height * 0.5)
      .setOrigin(0.5);

    btn.add(content);

    // nếu có thêm text -> đặt dưới image
    if (text) {
      const label = scene.add
        .text(width * 0.1, 0, text, {
          fontSize: `${Math.floor(height * 0.3)}px`,
          color: "#1f2937",
          fontStyle: "bold",
          ...STYLES.TextButton,
        })
        .setOrigin(0.5);

      btn.add(label);
    }
  } else if (icon) {
    content = scene.add
      .text(0, 0, icon, {
        fontSize: `${Math.floor(height * 0.45)}px`,
        color: "#1f2937",
        fontStyle: "bold",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    btn.add(content);
  } else if (text) {
    content = scene.add
      .text(0, 0, text, {
        fontSize: `${Math.floor(height * 0.35)}px`,
        color: "#1f2937",
        fontStyle: "bold",
        ...STYLES.TextButton,
      })
      .setOrigin(0.5);

    btn.add(content);
  }

  /* ===== HIT AREA ===== */
  const hit = scene.add
    .rectangle(0, 0, width, height, 0x000000, 0)
    .setInteractive({ useHandCursor: true });

  hit.on("pointerdown", () => {
    scene.tweens.add({
      targets: btn,
      scale: hoverScale + 0.1,
      yoyo: true,
      duration: 10,
    });
    onClick?.(btn);
  });

  hit.on("pointerover", () => btn.setScale(hoverScale));
  hit.on("pointerout", () => btn.setScale(1));

  btn.add(hit);

  return btn;
}
