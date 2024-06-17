import { PhysicEngine } from "../physic/physicEngine";
import { Messenger } from "./messenger";
import { Level } from "./abstractLevel";
import { Game } from "../scripts/game";
import { EObject, ImageComponent, AnimationComponent, PlayerController } from "./object";
import { BoundComponent, MovingBrickComponent } from "../scripts/customActorComponent";
import { Actor, Pawn } from "./actor";
import { vec2 } from "./vector";
import { Ball } from "../scripts/customActor";
import { Player } from "../scripts/player";
import { InputMappingContext, InputHandler } from "./input";
import { ActorFileData, ActorData, ComponenetData, InputMappingContextsFileData, InputMappingContextnData } from "./DataType";

export class GameEngine {
    
    canvas;
    context;
    currentLevelRunTime;
    background;

    game;
    width;
    height;

    timeStamp;
    lastFrameTime;
    currentFrame;

    physicEngine;

    messenger;
    inputHandler: InputHandler;

    onStart;
    onUpdate;

    sceneActors: Map<string, Actor> = new Map<string, Actor>();

    registeredComponents: Map<string, typeof EObject> = new Map<string, typeof EObject>();
    registeredActors: Map<string, typeof Actor> = new Map<string, typeof Actor>();

    inputContexts: Map<string, InputMappingContext> = new Map<string, InputMappingContext>();

    constructor(background) {
        this.canvas = document.getElementById("game"); 
        this.context = this.canvas.getContext("2d");
        this.background = background;

        this.timeStamp = 0;
        this.lastFrameTime = 0;
        this.currentFrame = 0;

        this.messenger = new Messenger();

        this.physicEngine = new PhysicEngine(this.messenger);

        this.registerActor(Actor);
        this.registerActor(Ball);
        this.registerActor(Player);

        this.registerComponent(ImageComponent);
        this.registerComponent(AnimationComponent);
        this.registerComponent(PlayerController);
        this.registerComponent(BoundComponent);
        this.registerComponent(MovingBrickComponent);

        //this.createInputMappingContextsFromData(InputMappingContextData);

        this.inputHandler = new InputHandler();
    }

    start(game = new Game()) {
        this.changeInputContextByName("default");

        this.game = game;

        //6行游戏性内容，有待迁移
        var player = this.sceneActors.get("player");
        var ball = this.sceneActors.get("ball");
        player.game = this.game;
        ball.player = player;
        this.game.currentLevel.player = player;
        this.game.currentLevel.balls.push(ball);
       
        for (let [name, actor] of this.sceneActors) {
            this.game.currentLevel.placeObject(actor);
        }
        
        this.game.messenger = this.messenger;
        this.width = (this.canvas.width = this.game.gameWidth);
        this.height = (this.canvas.height = this.game.gameHeight);
        
        this.onStart();
        
        this.game.beginPlay();

        this.physicEngine.start(this.game);

        this.loop();
    }
    loop = (timeStamp) => {
        if (timeStamp != undefined) {
            this.timeStamp = timeStamp;
        }
        const deltaTime = this.timeStamp - this.lastFrameTime;
        this.lastFrameTime = this.timeStamp;

        ++this.currentFrame;
        
        this.context.clearRect(0, 0, 800, 600);

        this.context.drawImage(this.background, 0, 0, 800, 600);

        this.onFrame(timeStamp, deltaTime);

        requestAnimationFrame(this.loop);
    }
    onFrame(timeStamp, deltaTime) {

        if (this.game.collidersChanged) {
            this.physicEngine.worldStaticBoundings.length = 0;
            this.physicEngine.worldDynamicBoundings.length = 0;
            this.physicEngine.playerBoundings.length = 0;
            
            this.physicEngine.meneryObjectTypes(this.game.currentLevel.defaultSceneRoot);
            this.game.collidersChanged = false;
        }

        this.physicEngine.update();

        this.game.currentUIContext.setCurrentMousePosition(this.inputHandler.getMousePosition());
        this.game.currentUIContext.setMouse(this.inputHandler.getMouse());

        this.onUpdate(timeStamp, deltaTime);
    }
    
    LoadLevel(level = new Level()) {
        this.currentLevelRunTime = this.game.currentLevel;
    }
    registerComponent(componentClass: typeof EObject) {
        this.registeredComponents.set(componentClass.name, componentClass);
    }
    registerActor(actorClass: typeof Actor) {
        this.registeredActors.set(actorClass.name, actorClass);
    }
    createInputMappingContextsFromData(data: InputMappingContextsFileData) {
        for (let i = 0; i < data.contexts.length; i++) {
            const contextData = data.contexts[i];
            this.createInputMappingContextFromData(contextData);
        }
    }
    createActorsFromData(data: ActorFileData) {
        for (let i = 0; i < data.actors.length; i++) {
            const actorData = data.actors[i];
            const actor = this.creatActorFromData(actorData, null);
            this.sceneActors.set(actorData.name, actor);
        }
    }
    creatActorFromData(data: ActorData, parent: Actor | null) {
        const actorClass = this.registeredActors.get(data.class);
        var actor = new actorClass(new vec2(data.transform.position.x, data.transform.position.y));
        actor.getTransform().setLocalRotation(data.transform.rotation);
        actor.getTransform().setLocalScale(new vec2(data.transform.scale.x, data.transform.scale.y));

        //设置属性，添加组件
        const propertyList = actorClass.prototype["__properties__"] || [];
        for (let propertyKey of propertyList) {            
            if (actor[propertyKey] instanceof vec2) {
                actor[propertyKey] = new vec2(data.properties[propertyKey].x, data.properties[propertyKey].y);
                continue;
            }
            actor[propertyKey] = data.properties[propertyKey];
        }

        for (var i = 0; i < data.components.length; i++) {
            const componentData = data.components[i];
            const component = this.createComponentFromData(componentData);
            if (component) {
                actor.attachComponent(component);
            }
        }

        //建立父子级
        if (parent != null) {
            parent.addChild(actor);
        }
        if (data.children) {
            for (let i = 0; i < data.children.length; i++) {
                const childData = data.children[i];
                this.creatActorFromData(childData, actor);
            }
        }

        //创建物理碰撞体
        if (actor.imageComponent != null && data.physicsBodyShape != null) {
            switch (data.physicsBodyShape) {
                case "Rectangle":
                    actor.createBodyBox(new vec2(actor.imageComponent.size.x, actor.imageComponent.size.y));
                    break;
                case "Circle":
                    actor.createBodyCircle(new vec2(actor.imageComponent.size.x, actor.imageComponent.size.y));
                    break;
                default:
                    console.log("physicsBodyShape not found");
                    break;
            }
            actor.body.objectType = data.physicsBodyType;
            actor.body.collisionPresets = data.physicsBodyCollisionPreset;
        }

        //bind input for pawn
        if (actor instanceof Pawn) {
            const inputContextName = data.properties.inputContext;
            this.changeInputContextByName(inputContextName);
            actor.controller.bindInputContext(this.inputContexts.get(inputContextName));
        }

        return actor;
    }
    createComponentFromData(data: ComponenetData) {
        const componentClass = this.registeredComponents.get(data.type);
        if(!componentClass) {
            console.log("component class not found");
            return null;
        }
        const component = new componentClass();
        component.parseFromData(data);
        return component;
    }
    createInputMappingContextFromData(data: InputMappingContextnData) {
        const context = new InputMappingContext(this.messenger);
        for (let i = 0; i < data.actions.length; i++) {
            const actionData = data.actions[i];
            context.createInputAction(actionData.name, actionData.mode);
            for (let j = 0; j < actionData.keys.length; j++) {
                const keyData = actionData.keys[j];
                if (!keyData.factor) {
                    keyData.factor = 1;
                }
                context.MapKey(actionData.name, keyData.key, keyData.factor);
            }
        }
        this.inputContexts.set(data.name, context);
    }
    changeInputContextByName(name: string) {
        const context = this.inputContexts.get(name);
        if (context) {
            this.inputHandler.bindContext(context);
        }
    }
    getActorByName(name: string) {
        return this.sceneActors.get(name);
    }
}
export function getGameWidth() {
    console.log("getGameWidth not implemented yet")
    return 800
}
export function getGameHeight() {
    console.log("getGameHeigh not implemented yet")
    return 600
}