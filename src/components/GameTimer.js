export default class GameTimer {
  constructor(scene, config) {
    this.scene = scene;
    this.onTimeUp = config.onTimeUp;
    this.onTick = config.onTick;

    this.timeLeft = 0;
    this.totalTimeUsed = 0;

    this.timerEvent = null;
  }

  start(seconds) {
    this.stop();

    this.timeLeft = seconds;

    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft--;
        this.totalTimeUsed++;

        this.onTick?.(this.timeLeft);

        if (this.timeLeft <= 0) {
          this.stop();
          this.onTimeUp?.();
        }
      },
    });
  }

  stop() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }

  addTime(seconds) {
    this.timeLeft += seconds;
  }

  getTotalTimeUsed() {
    return this.totalTimeUsed;
  }

  resetTotal() {
    this.totalTimeUsed = 0;
  }
}
