import { vec2 } from "../engine/vector";
import { AbstractGame } from "../engine/abstractGame";
import { GameLevel } from "./customLevel";
import { UIContext } from "../engine/UIContext";
import { Rectangle } from "../engine/basicGeometry";

const gameState = {
    GAME_MENU: "gameMenu",
    GAME_ACTIVE: "gameActive",
    GAME_PAUSE: "gamePause",
    GAME_WIN: "gameWin"
}

export class Game extends AbstractGame{

    inputContext;
    lastKey;

    currentLevelId: number;

    UIContexts;

    player;

    state;
    score;
    
    timeStamp;
    timescale;

    collidersChanged;

    constructor(gameWidth = 800, gameHeight = 600) {
        super(gameWidth, gameHeight);

        this.currentLevel = new GameLevel();
        this.state = gameState.GAME_MENU;
        this.timescale = 1;

        this.buildUI();
    }
    Init() {
        this.currentLevel.Load("level1", this.gameWidth, this.gameHeight * 0.4);
    }
    beginPlay(): void {
        super.beginPlay();
    }
    update(timeStamp, deltaTime) {
        if (this.currentLevel.player.timescaleChanged) {
            this.timescale = 8;
            this.currentLevel.player.timesclaeChanged = false;
        } else if(this.timescale != 0){
            this.timescale = 1;
        }

        deltaTime *= this.timescale;

        this.currentUIContext.update();

        if (this.state == gameState.GAME_ACTIVE) {
            this.currentLevel.update(timeStamp, deltaTime);
            var totalScore = 0;
            for (let ball of this.currentLevel.balls) {
                totalScore += ball.scoreCounter;
            }
            this.score = totalScore;
            this.currentUIContext.getElement("scoreValue").setText(this.score);
        }
        //this.score = this.currentLevel.balls[0].scoreCounter;
        this.timeStamp = timeStamp;
    }
    buildUI() {
        //UI
        this.currentUIContext = new UIContext(this.messenger);
        this.UIContexts = new Map();

        this.score = 0;
        this.currentUIContext.createText("scoreText", "Score:", new vec2(10, 39), 32, "arial", "rgba(100%, 100%, 100%, 0.7)");
        this.currentUIContext.createText("scoreValue", this.score, new vec2(105, 39), 32, "arial", "rgba(100%, 100%, 100%, 0.7)");

        this.currentUIContext.createText("press e", "Press E", new vec2(this.gameWidth - 50, 55), 12, "arial", "rgba(100%, 100%, 100%, 0.7)");
        this.currentUIContext.createText("pause", "to pause", new vec2(this.gameWidth - 48, 70), 12, "arial", "rgba(100%, 100%, 100%, 0.7)");

        this.currentUIContext.createText("continue", "to continue", new vec2(this.gameWidth - 60, 70), 12, "arial", "rgba(100%, 100%, 100%, 0.7)");
        this.currentUIContext.getElement("continue").setIsActived(false);

        var vertexs0 = [];
        vertexs0.push(new vec2(this.gameWidth - 40, 10));
        vertexs0.push(new vec2(this.gameWidth - 30, 10));
        vertexs0.push(new vec2(this.gameWidth - 30, 40));
        vertexs0.push(new vec2(this.gameWidth - 40, 40));

        this.currentUIContext.createPolygon("pauseLeft", new vec2(0, 0), vertexs0, "rgba(100%, 100%, 100%, 0.7)");
        this.currentUIContext.createPolygon("pauseRight", new vec2(20, 0), vertexs0, "rgba(100%, 100%, 100%, 0.7)");

        var vertexs1 = [];
        vertexs1.push(new vec2(this.gameWidth - 36, 10));
        vertexs1.push(new vec2(this.gameWidth - 10, 25));
        vertexs1.push(new vec2(this.gameWidth - 36, 40));

        this.currentUIContext.createPolygon("continueIcon", new vec2(0, 0), vertexs1, "rgba(100%, 100%, 100%, 0.7)");
        this.currentUIContext.getElement("continueIcon").setIsActived(false);

        this.UIContexts.set("displayInGame", this.currentUIContext);

        this.currentUIContext = new UIContext(this.messenger);

        var buttonShape = new Rectangle(new vec2(this.gameWidth * 0.5, this.gameHeight * 0.5), new vec2(180, 70), "rgba(50%, 50%, 60%, 0.7)");
        this.currentUIContext.createButton("startButton", buttonShape, "Game Start", "arial", "rgba(100%, 100%, 100%, 0.7)", 32);
        var button = this.currentUIContext.getElement("startButton");
        button.setTextPosition(new vec2(this.gameWidth * 0.5 - 80, this.gameHeight * 0.5 + 10));
        button.onClick.bind(this, this.gameStart);

        this.UIContexts.set("displayInStatrMenu", this.currentUIContext);
    }
    gamePause() {
        if (this.state == gameState.GAME_ACTIVE) {
            this.state = gameState.GAME_PAUSE;

            this.timescale = 0;

            this.currentUIContext.getElement("pauseLeft").setIsActived(false);
            this.currentUIContext.getElement("pauseRight").setIsActived(false);
            this.currentUIContext.getElement("pause").setIsActived(false);
            this.currentUIContext.getElement("continue").setIsActived(true);
            this.currentUIContext.getElement("continueIcon").setIsActived(true);

            this.currentLevel.player.controller.bindAction("theWorld", this.gameActivate, this);
        }
    }
    gameActivate() {
        if (this.state == gameState.GAME_PAUSE) {
            this.state = gameState.GAME_ACTIVE;

            this.timescale = 1;
            
            this.currentUIContext.getElement("pauseLeft").setIsActived(true);
            this.currentUIContext.getElement("pauseRight").setIsActived(true);
            this.currentUIContext.getElement("pause").setIsActived(true);
            this.currentUIContext.getElement("continue").setIsActived(false);
            this.currentUIContext.getElement("continueIcon").setIsActived(false);

            this.currentLevel.player.controller.bindAction("theWorld", this.gamePause, this);
        }
    }
    gameWin() {
        this.state = gameState.GAME_WIN;
    }
    draw(context) {
        this.currentLevel.draw(context);
        this.currentUIContext.draw(context);
    }
    gameStart() {
        this.state = gameState.GAME_ACTIVE;
        this.currentUIContext = this.UIContexts.get("displayInGame");
    }
}