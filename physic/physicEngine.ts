import { EngineEvent } from "../engine/event";
import { Actor } from "../engine/actor";
import { Body, doCollision } from "./collision";
import { Messenger } from "../engine/messenger";

export class PhysicEngine {
    worldStaticBoundings: Body[];
    worldDynamicBoundings: Body[];
    playerBoundings: Body[];

    messenger: Messenger;
    constructor(messenger = null) {
        this.worldStaticBoundings = [];
        this.worldDynamicBoundings = [];
        this.playerBoundings = [];

        this.messenger = messenger;
    }
    update() {
        this.doCollision();
    }
    start(game = null) {
        if(game == null){
            console.log("Warning: Game is null");
            return;
        }
        this.meneryObjectTypes(game.currentLevel.defaultSceneRoot);
    }
    doCollision() {
        this.worldDynamicBoundings.forEach(object => {
            doCollision(object, this.worldStaticBoundings, this.messenger);
        });
        this.playerBoundings.forEach(object => {
            //doCollision(object, this.worldStaticBoundings);
            doCollision(object, this.worldDynamicBoundings, this.messenger);
        });
    }
    meneryObjectTypes(node = new Actor()) {
        if (node == null) {
            return;
        }
        if (node.body != null && node.body.collisionPresets != Body.collisionPresets.NONE) {

            this.messenger.addListener(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, node.body.onComponetBeginOverlap);
            this.messenger.addListener(EngineEvent.INNER_EVENT.COMPONENT_END_OVERLAP, node.body.onComponetEndOverlap);

            if (node.body.objectType == Body.objectTypes.WORLD_STATIC) {
                this.worldStaticBoundings.push(node.body);
            } else if(node.body.objectType == Body.objectTypes.WORLD_DYNAMIC) {
                this.worldDynamicBoundings.push(node.body);
            } else if(node.body.objectType == Body.objectTypes.PAWN) {
                this.playerBoundings.push(node.body);
            }
        }
        for (let i = 0; i < node.children.length; i++) {
            this.meneryObjectTypes(node.children[i]);
        }
    }
}