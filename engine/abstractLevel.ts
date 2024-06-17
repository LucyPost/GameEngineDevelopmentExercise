import { Actor } from "./actor";

export class Level {
    defaultSceneRoot;
    constructor() {
        this.defaultSceneRoot = new Actor();
    }
    beginPlay() {
        for(var i = 0; i < this.defaultSceneRoot.children.length; i++) {
            this.defaultSceneRoot.children[i].beginPlay();
        }
    }
    update(timeStampe = 0, deltaTime = 0) {
        this.defaultSceneRoot.update(timeStampe, deltaTime);

        for(var i = 0; i < this.defaultSceneRoot.children.length; i++) {
            this.defaultSceneRoot.children[i].update(timeStampe, deltaTime);
        }
    }
    draw(context) {
        for(var i = 0; i < this.defaultSceneRoot.children.length; i++) {
            this.defaultSceneRoot.children[i].draw(context);
        }
    }
    placeObject(object = new Actor()) {
        this.defaultSceneRoot.addChild(object);
    }
    removeObject(object = new Actor()) {
        this.defaultSceneRoot.removeChild(object);
        for(var i = 0; i < this.defaultSceneRoot.children.length; i++) {
            this.defaultSceneRoot.children[i].removeChild(object);
        }
    }
}