import Phaser from "phaser";
import GameScene from "./sences/GameSence.js";
import MainMenuScene from "./sences/MainMenuSence.js";
import LoadingScene from "./sences/LoadingSence.js";

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = Math.floor(window.innerHeight * 0.66); // ✅ 2/3 màn hình

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-wrapper",
  backgroundColor: "#111",
  scene: [LoadingScene, MainMenuScene, GameScene],
};

new Phaser.Game(config);
