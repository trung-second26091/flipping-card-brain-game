// ui/ButtonUtils.js
export function createRectButton({
  scene,
  x,
  y,
  width,
  height,
  icon,
  onClick,
  radius = 16,
  bgColor = 0xfacc15,
  borderColor = 0xffffff,
  borderWidth = 2,
  hoverScale = 1.1,
}) {
  const btn = scene.add.container(x, y);

  /* ===== BACKGROUND ===== */
  const bg = scene.add.graphics();
  bg.fillStyle(bgColor, 1);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  /* ===== BORDER ===== */
  const border = scene.add.graphics();
  border.lineStyle(borderWidth, borderColor, 0.9);
  border.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  /* ===== ICON ===== */
  const iconText = scene.add
    .text(0, 0, icon, {
      fontSize: `${Math.floor(height * 0.45)}px`,
      color: "#1f2937",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  /* ===== HIT AREA ===== */
  const hit = scene.add
    .rectangle(0, 0, width, height, 0x000000, 0)
    .setInteractive({ useHandCursor: true });

  /* ===== INTERACTION ===== */
  hit.on("pointerdown", () => {
    scene.tweens.add({
      targets: btn,
      scale: hoverScale + 0.1,
      yoyo: true,
      duration: 120,
    });
    onClick?.(btn);
  });

  hit.on("pointerover", () => btn.setScale(hoverScale));
  hit.on("pointerout", () => btn.setScale(1));

  btn.add([bg, border, iconText, hit]);

  return btn;
}
