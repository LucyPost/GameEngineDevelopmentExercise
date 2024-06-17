import { vec2, vec3 } from "./vector";
import { InputMappingContext } from "./input";
import { Actor } from "./actor";
import { ComponenetData } from "./DataType";

export class EObject {
    owner: Actor;
    constructor() {}
    parseFromData(data) {
        // for (let key in data) {
        //     if (this.hasOwnProperty(key)) {
        //         this[key] = data[key];
        //     }
        // }
        const propertyList = this.__proto__["__properties__"] || [];
        for (let propertyKey of propertyList) {
            const self = this as any;

            if (self[propertyKey] instanceof vec2) {
                self[propertyKey].x = data.properties[propertyKey].x;
                self[propertyKey].y = data.properties[propertyKey].y;
                continue;
            } else if (self[propertyKey] instanceof vec3) {
                self[propertyKey].x = data.properties[propertyKey].x;
                self[propertyKey].y = data.properties[propertyKey].y;
                self[propertyKey].z = data.properties[propertyKey].z;
                continue;
            }

            self[propertyKey] = data.properties[propertyKey];
        }
    }
    generateData(): ComponenetData {
        const data: ComponenetData = {
            type: this.constructor.name,
            properties: {}
        }
        const propertyList = this.__proto__["__properties__"] || [];
        for (let propertyKey of propertyList) {

            if (this[propertyKey] instanceof vec2) {
                data.properties[propertyKey] = {
                    x: this[propertyKey].x,
                    y: this[propertyKey].y
                }
                continue;
            } else if (this[propertyKey] instanceof vec3) {
                data.properties[propertyKey] = {
                    x: this[propertyKey].x,
                    y: this[propertyKey].y,
                    z: this[propertyKey].z
                }
                continue;
            }

            data.properties[propertyKey] = this[propertyKey];
        }
        return data;
    }
}
export class ActorComponent extends EObject {
    constructor() {
        super();
    }
    beginPlay() {}
    update(timeStamp = 0, deltaTime = 0) {}
}
export class AnimationComponent extends EObject{
    frame
    frameCount
    frameRate
    constructor(position = new vec2(0, 0), size = new vec2(0, 0), sprite = document.getElementById("ballImage"), frameCount = 1, frameRate = 1) {
        super();
        this.frame = 0;
        this.frameCount = frameCount;
        this.frameRate = frameRate;
    }
}
export class ImageComponent extends EObject{

    @UProperty
    sprite1: HTMLImageElement | String;
    
    sprite2;
    sprite3;
    sprite4;
    
    @UProperty
    size: vec2 = new vec2(0, 0);
    
    activeSprite;

    constructor(sprite1: HTMLImageElement = null, sprite2 = null, sprite3 = null, sprite4 = null) {
        super();

        this.sprite1 = sprite1;
        this.sprite2 = sprite2;
        this.sprite3 = sprite3;
        this.sprite4 = sprite4;
        this.activeSprite = 1;

    }
    draw(context) {
        const absoluteSize = this.owner.getTransform().getAbsoluteScale().multiply(this.size);
        context.translate(this.owner.getTransform().getAbsolutePosition().x, this.owner.getTransform().getAbsolutePosition().y);
        context.rotate(this.owner.getTransform().getAbsoluteRotation());
        switch (this.activeSprite) {
            case 1:
                context.drawImage(this.sprite1, - absoluteSize.x * 0.5, - absoluteSize.y * 0.5, absoluteSize.x, absoluteSize.y);
                break;
            case 2:
                context.drawImage(this.sprite2, - absoluteSize.x * 0.5, - absoluteSize.y * 0.5, absoluteSize.x, absoluteSize.y);
                break;
            case 3:
                context.drawImage(this.sprite3, - absoluteSize.x * 0.5, - absoluteSize.y * 0.5, absoluteSize.x, absoluteSize.y);
                break;
            case 4:
                context.drawImage(this.sprite4, - absoluteSize.x * 0.5, - absoluteSize.y * 0.5, absoluteSize.x, absoluteSize.y);
                break;
        }
        context.rotate(-this.owner.getTransform().getAbsoluteRotation());
        context.translate(-this.owner.getTransform().getAbsolutePosition().x, -this.owner.getTransform().getAbsolutePosition().y);
    }
    setActiveSprite(activeSprite = 1) {
        if (activeSprite < 1 || activeSprite > 4) {
            console.log("Warning: setActiveSprite() called with invalid parameter");
            return;
        }
        this.activeSprite = activeSprite;
    }
    getImageSize() {
        return new vec2(this.sprite1.width, this.sprite1.height);
    }
    getSize() {
        return this.size;
    }
    setSize(size:vec2) {
        this.size = new vec2(size.x, size.y);
    }
    parseFromData(data: any): void {
        super.parseFromData(data);

        if (typeof this.sprite1 == "string") {
            this.sprite1 = document.getElementById(this.sprite1) as HTMLImageElement;
            if (!this.size) {
                this.size = new vec2(this.sprite1.width, this.sprite1.height);
            }
        } else {
            console.log("Warning: sprite1 is not a path");
        }
    }
}
export class PlayerController extends EObject {
    inputMappingContext;

    constructor(inputMappingContext = new InputMappingContext()) {
        super();
        this.inputMappingContext = inputMappingContext;
    }
    bindInputContext(inputMappingContext = new InputMappingContext()) {
        this.inputMappingContext = inputMappingContext;
    }
    bindAction(action = "", func, target = null) {
        if (!this.inputMappingContext.actions.get(action)) {
            console.log("Warning: action not found");
            return;
        }
        if (target == null) {
            this.inputMappingContext.actions.get(action).onValueChange.bind(this.owner, func);
        } else {
            this.inputMappingContext.actions.get(action).onValueChange.bind(target, func);
        }
    }
}