import { Level } from "./abstractLevel";
import { UIContext } from "./UIContext";

export class AbstractGame {

    gameWidth;
    gameHeight;

    messenger;
    inputHandler; 

    currentLevel: Level;
    currentUIContext;

    constructor(gameWidth = 800, gameHeight = 600) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.currentLevel = new Level();
        this.currentUIContext = new UIContext();
        this.inputHandler = null;
    }
    beginPlay() {
        this.currentLevel.beginPlay();
    }
    update(timeStamp, deltaTime) {}
}