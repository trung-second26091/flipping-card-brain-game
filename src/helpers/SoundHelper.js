export function toggleSound(scene, btn) {
  scene.soundOn = !scene.soundOn;

  // mute / unmute Phaser sound
  scene.sound.mute = !scene.soundOn;

  // đổi icon
  const iconText = btn.list.find((c) => c.type === "Text");
  iconText.setText(scene.soundOn ? "🔊" : "🔇");

  // click animation
  scene.tweens.add({
    targets: btn,
    scale: 1.25,
    yoyo: true,
    duration: 120,
  });
}
