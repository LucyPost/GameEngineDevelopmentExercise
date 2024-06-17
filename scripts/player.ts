import { vec2 } from "../engine/vector";
import { Pawn } from "../engine/actor";
import { ImageComponent } from "../engine/object";
import { Body } from "../physic/collision";
import { Ball } from "./customActor";
import { Collision } from "../physic/collision";
import { getGameWidth, getGameHeight } from "../engine/engine";

export class Player extends Pawn {
    @UProperty
    speed;

    gameWidth;
    gameHeight;

    game;

    movement;

    lastWHitted;
    WHitted;
    WKeyCD;
    timeStamp;
    lastTimeScaled;

    timescaleChanged;
    isBallInRange;
    CMoonLast;
    isBallStuck: boolean = true;

    constructor(position = new vec2(0, 0), speed = 0) {
        super(position);

        this.name = "player";

        if (document.getElementById("playerImage") != null && document.getElementById("ringImage") != null) {
            var IC = new ImageComponent(document.getElementById("playerImage"), document.getElementById("ringImage"));
            IC.setSize(new vec2(76.8, 19.2));
            this.attachComponent(IC);
        } else {
            console.log("playerImage or ringImage not found");
        }

        this.speed = speed;
        this.movement = new vec2(0, 0);

        this.gameWidth = getGameWidth();
        this.gameHeight = getGameHeight();

        this.lastWHitted = 0;
        this.lastTimeScaled = 0;
        this.WHitted = false;
        this.WKeyCD = 1000;
        this.timeStamp = 0;

        this.timescaleChanged = false;
        this.isBallInRange = false;
        this.CMoonLast = 100;
        this.isBallStuck = true;

        this.createBodyBox(new vec2(76.8, 19.2));
        this.body.setCollisionPreset(Body.collisionPresets.OVERLAP_ALL);
        this.body.setObjectType(Body.objectTypes.PAWN);

    }
    beginPlay(): void {
        this.controller.bindAction("moveRight", this.moveRight);
        this.controller.bindAction("theWorld", this.gamePause, this);
        this.controller.bindAction("releaseBall", this.releaseBall, this);
        //this.controller.bindAction("testAction", this.testAction, this);
    }
    // testAction() {
    //     console.log("testAction");
    // }
    update(timeStamp = 0, deltaTime = 0) { 
        super.update();

        this.timeStamp = timeStamp;

        if (this.WHitted && this.isBallInRange) {
            if(timeStamp - this.lastWHitted > this.WKeyCD){
                this.lastWHitted = timeStamp;
                this.lastTimeScaled = timeStamp;
                this.timescaleChanged = true;
            }
        }
        if (timeStamp - this.lastTimeScaled > this.CMoonLast) {
            this.timescaleChanged = false;
        }

        this.addMovement(this.movement.multiply(deltaTime));

        if(this.getTransform().position.x < this.getAbsoluteSize().x * 0.5){
            this.getTransform().position.x = this.getAbsoluteSize().x * 0.5;
        } else if(this.getTransform().position.x > this.gameWidth - this.getAbsoluteSize().x * 0.5){
            this.getTransform().position.x = this.gameWidth - this.getAbsoluteSize().x * 0.5;
        }
        this.WHitted = false;
        this.isBallInRange = false;
    }
    Draw(context, isShaking = false) {
        super.draw(context);

        //圆弧抖动幅度
        var shakeX = 0; 
        var shakeY = 0;
        var dis = 0;
        if (isShaking) {
            shakeX = Math.random() * 2 - 2;
            shakeY = Math.random() * 1 - 1.5;
            dis = Math.random() * 50;
        }
    }
    IsBallInRange(collision = new Collision()) {
        var other = collision.collider1.owner == this ? collision.collider2.owner : collision.collider1.owner;
        if(other instanceof Ball && this.WHitted){
            console.log("ball in range");
        }
    }
    moveRight(value = 0) {
        this.movement = new vec2(this.speed * value, 0);
    }
    Reset(position = new vec2(0, 0)) {
        this.getTransform().setLocalPosition(position);
        this.body.shape.position = this.getTransform().getAbsolutePosition();
    }
    releaseBall() {
        this.isBallStuck = false;
    }
    gamePause() {
        this.game.gamePause();
    }
}