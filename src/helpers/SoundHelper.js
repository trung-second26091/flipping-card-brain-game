export function toggleSound(scene, btn) {
  scene.soundOn = !scene.soundOn;

  // Mute / unmute Phaser sound
  scene.sound.mute = !scene.soundOn;

  // Find the image in the container
  const imageChild = btn.list.find((child) => child.type === "Image");

  if (imageChild) {
    // Change image
    const newKey = scene.soundOn ? "sound-on-button" : "sound-off-button";
    imageChild.setTexture(newKey);

    // Optional: nice little feedback
    // scene.tweens.add({
    //   targets: imageChild,
    //   scale: 1.3,
    //   duration: 90,
    //   yoyo: true,
    //   ease: "Sine.easeOut",
    // });
  }
}
