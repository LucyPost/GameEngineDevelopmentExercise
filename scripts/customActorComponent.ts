import { Actor } from "../engine/actor";
import { ActorComponent } from "../engine/object";
import { vec2 } from "../engine/vector";
import { Ball } from "./customActor";
import { getGameWidth } from "../engine/engine";

export class BoundComponent extends ActorComponent {
    owner: Ball;
    constructor() {
        super();
    }
    update(timeStamp = 0, deltaTime = 0) {
        super.update(timeStamp, deltaTime);

        if(1) {
            if (this.owner.getTransform().getAbsolutePosition().x - this.owner.radius < 0) {
                this.owner.velocity.x = -this.owner.velocity.x
                this.owner.getTransform().setLocalPosition(new vec2(this.owner.radius, this.owner.getTransform().getAbsolutePosition().y));
            }
            else if (this.owner.getTransform().getAbsolutePosition().x + this.owner.radius > this.owner.gameWidth) {
                this.owner.velocity.x = -this.owner.velocity.x;
                this.owner.getTransform().setLocalPosition(new vec2(this.owner.gameWidth - this.owner.radius, this.owner.getTransform().getAbsolutePosition().y));
            }
            if (this.owner.getTransform().getAbsolutePosition().y < 0) {
                this.owner.velocity.y = -this.owner.velocity.y;
                this.owner.getTransform().setLocalPosition(new vec2(this.owner.getTransform().getAbsolutePosition().x, 0));
            }else if (this.owner.getTransform().getAbsolutePosition().y + this.owner.radius > this.owner.gameHeight) {
                this.owner.reset(this.owner.player.getTransform().getAbsolutePosition());
            }
        }
    }
    beginPlay() {
        super.beginPlay();
    }
}
export class MovingBrickComponent extends ActorComponent {
    owner: Actor;

    @UProperty
    velocity: vec2 = new vec2(0, 0);

    constructor() {
        super();
    }
    beginPlay() {
        super.beginPlay();
    }
    update(timeStamp = 0, deltaTime = 0) {
        super.update(timeStamp, deltaTime);
        if(this.owner.getTransform().position.x < this.owner.getAbsoluteSize().x * 0.5){
            this.owner.getTransform().position.x = this.owner.getAbsoluteSize().x * 0.5 + 1;
            this.velocity.x = -this.velocity.x;
        } else if(this.owner.getTransform().position.x > getGameWidth() - this.owner.getAbsoluteSize().x * 0.5){
            this.owner.getTransform().position.x = getGameWidth() - this.owner.getAbsoluteSize().x * 0.5 - 1;
            this.velocity.x = -this.velocity.x;
        }
        this.owner.getTransform().setLocalPosition(new vec2(this.owner.getTransform().getAbsolutePosition().x + this.velocity.multiply(deltaTime).x, this.owner.getTransform().getAbsolutePosition().y));
    }
}