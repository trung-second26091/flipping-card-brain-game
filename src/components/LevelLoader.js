export default class LevelLoader {
  constructor(scene) {
    this.scene = scene;
    this.levels = scene.cache.json.get("levels").levels;
  }

  getLevel(levelNumber) {
    return this.levels.find((l) => l.id === levelNumber);
  }

  getTotalLevels() {
    return this.levels.length;
  }

  getTime() {
    return this.getLevel(this.scene.currentLevel).time;
  }
}
