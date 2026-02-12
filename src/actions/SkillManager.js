export default class SkillManager {
  constructor(scene) {
    this.scene = scene; // giữ reference tới GameScene
  }

  canSpendGold(cost) {
    return this.scene.gold >= cost && !this.scene.lock;
  }

  spendGold(cost) {
    this.scene.gold -= cost;
    this.scene.goldText.setText(`💰 Gold: ${this.scene.gold}`);
  }

  /* ========= SKILLS ========= */

  useHint() {
    const COST = 50;
    if (!this.canSpendGold(COST)) return;

    this.spendGold(COST);

    const unflipped = this.scene.cards.filter((c) => !c.isFlipped);
    if (unflipped.length < 2) return;

    const map = {};
    unflipped.forEach((c) => {
      map[c.colorValue] ??= [];
      map[c.colorValue].push(c);
    });

    const pair = Object.values(map).find((arr) => arr.length >= 2);
    if (!pair) return;

    pair.forEach((c) => (c.fillColor = c.colorValue));

    this.scene.time.delayedCall(800, () => {
      pair.forEach((c) => {
        if (!c.isFlipped) c.fillColor = 0x444444;
      });
    });
  }

  addTime() {
    const COST = 50;
    if (!this.canSpendGold(COST)) return;

    this.spendGold(COST);

    this.scene.timeLeft += 5;
    this.scene.timeText.setText(`⏱ Time: ${this.scene.timeLeft}`);
  }

  openAllCards() {
    const COST = 100;
    if (!this.canSpendGold(COST)) return;

    this.spendGold(COST);
    this.scene.lock = true;

    this.scene.cards.forEach((c) => {
      if (!c.isFlipped) c.fillColor = c.colorValue;
    });

    this.scene.time.delayedCall(5000, () => {
      this.scene.cards.forEach((c) => {
        if (!c.isFlipped) c.fillColor = 0x444444;
      });
      this.scene.lock = false;
    });
  }
}
