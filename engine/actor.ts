import { vec2 } from "./vector";
import { Transform, Rectangle, Sphere, Empty } from "./basicGeometry";
import { EObject, ImageComponent, AnimationComponent, ActorComponent, PlayerController } from "./object";
import { Body } from "../physic/collision";
import { InputMappingContext } from "./input";

export class Actor {

    name:string;

    #parent;
    children;

    #transform;

    imageComponent: ImageComponent | null;
    animationComponent: AnimationComponent | null;

    Components: ActorComponent[];

    body;
    isHiddenInGame;

    constructor(position = new vec2(0, 0)) {
        this.#parent = null;
        this.children = [];

        this.#transform = new Transform(position, 0, new vec2(1, 1));

        this.imageComponent = null;
        this.animationComponent = null;

        this.Components = [];

        this.isHiddenInGame = false;
        this.body = null;
        
    }
    beginPlay() {}
    update(timeStamp = 0, deltaTime = 0) {
        for (var i = 0; i < this.Components.length; i++) {
            this.Components[i].update(timeStamp, deltaTime);
        }
        if (this.#transform.isDirty) {
            this.updateSelfAndChildren();
            this.#transform.isDirty = false;
        }
        if(this.body != null){
            this.body.shape.position = this.#transform.getAbsolutePosition();
        }
        if(this.#transform.rotation > 3600000000){
            this.#transform.rotation -= 3600000000;
        }
    }
    updateSelfAndChildren() {
        if (this.#parent != null) {
            this.#transform.computeModelMatrix(this.#parent.getTransform().getModelMatrix());
        }
        else {
            this.#transform.computeModelMatrix();
        }

        if (this.body != null && !(this.body.shape instanceof Empty)) {
            //var offset = this.body.shape.position.sub(this.#transform.getAbsolutePosition());
            this.body.shape.position = this.#transform.getAbsolutePosition();
        }

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].updateSelfAndChildren();
        }
    }
    draw(context) {
        if(this.isHiddenInGame || this.imageComponent == null){
            return;
        }
        this.imageComponent.draw(context);
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw(context);
        }
    }
    
    attachComponent(component: EObject) {
        if (component instanceof ImageComponent) {
            this.imageComponent = component;
            component.owner = this;
            return;
        } else if (component instanceof AnimationComponent) {
            this.animationComponent = component;
            component.owner = this;
            return;
        }
        this.Components.push(component);
        component.owner = this;
    }

    getComponentByClass(classType) {
        for (var i = 0; i < this.Components.length; i++) {
            if (this.Components[i] instanceof classType) {
                return this.Components[i];
            }
        }
        return null;
    }
    
    addChild(child = new Actor()) {
        child.#parent = this;
        child.updateSelfAndChildren();
        this.children.push(child);
    }
    removeChild(child = new Actor()) {
        var index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }
    
    addMovement(movement = new vec2(0, 0)) {
        if (movement.x == 0 && movement.y == 0) {
            return;
        }
        this.#transform.position = this.#transform.position.add(movement);
        this.#transform.isDirty = true;
    }
    addRotation(degree = 0) {
        if (degree == 0) {
            return;
        }
        this.#transform.rotation += degree;
        this.#transform.isDirty = true;
    }

    getAbsoluteSize() {
        if (this.imageComponent) {
            return this.imageComponent.getSize().multiply(this.#transform.getAbsoluteScale());
        }
    }
    getFrontVector() {
        return new vec2(Math.cos(this.#transform.getAbsoluteRotation()), Math.sin(this.#transform.getAbsoluteRotation()));
    }
    getRightVector() {
        return new vec2(Math.sin(this.#transform.getAbsoluteRotation()), -Math.cos(this.#transform.getAbsoluteRotation()));
    }
    getTransform() {
        return this.#transform;
    }
    getParent() {
        return this.#parent;
    }

    createBodyBox(size:vec2) {
        this.body = new Body(new Rectangle(this.#transform.getAbsolutePosition(), size));
        this.body.owner = this;
    }
    createBodyCircle(size:vec2) {
        this.body = new Body(new Sphere(this.#transform.getAbsolutePosition(), (size.x + size.y) / 4));
        this.body.owner = this;
    }
    // createBodyPolygon() {
    //     if (!this.polygon) {
    //         console.log("Warning: no polygon provided");
    //         return;
    //     }
    //     this.body = new Body(this.polygon, this.getAbsoluteSize());
    //     this.body.owner = this;
    // }
    setCollisionType(collisionType = Body.collisionPresets.NONE) {
        if (this.body != null) {
            this.body.setCollisionType(collisionType);
        }
    }
}
export class Pawn extends Actor {

    controller: PlayerController;

    @UProperty
    inputContext: InputMappingContext;

    constructor(position = new vec2(0, 0), size = new vec2(0, 0)) {
        super(position);
        this.controller = new PlayerController();
        this.controller.owner = this;
    }
}