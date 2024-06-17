import { vec2 } from "./vector";
import { Empty, convexPolygon } from "./basicGeometry";
import { Messenger } from "./messenger";
import { Delegate } from "./delegate";
import { EngineEvent } from "./event";

export class UIContext {
    #elements;
    #messenger;
    #currentMousePosition;
    #mouse;
    #canvasOffset;
    constructor(messenger = new Messenger()) {
        this.#messenger = messenger;
        this.#elements = new Map();

        const canvas = document.getElementById("game");
        var vertex = canvas.getBoundingClientRect();
        this.#canvasOffset = new vec2(vertex.x, vertex.y);
    }
    update() {
        if (this.#mouse || this.#currentMousePosition) {
            for (const [name, element] of this.#elements) {
                if (element.isPointInside(this.#currentMousePosition.sub(this.#canvasOffset)) && this.#mouse.mouse1Down) {
                    this.#messenger.broadcast(EngineEvent.INNER_EVENT.BUTTON_PRESSED, [name]);
                }
                if(this.#mouse.mouse1Up) {
                    this.#messenger.broadcast(EngineEvent.INNER_EVENT.BUTTON_RELEASED, [name]);
                }
            }

        }
        for (const [name, element] of this.#elements) {
            element.update();
        }
    }
    draw(context) {
        for (const [name, element] of this.#elements) {
            element.draw(context);
        }
    }
    createText(name = "", text = "", position = new vec2(0, 0), size = 12, font = "arial", color = "black", alignment = "left", lineHeight = 1, lineWidth = 0, textBaseline = "alphabetic", textAlign = "start") {
        var innerText = new Text(text, font, color, position, size, alignment, lineHeight, lineWidth, textBaseline, textAlign);
        this.#elements.set(name, innerText);
    }
    createButton(name = "", shape = new Empty(), text = "", font = "arial", color = "", fontSize = 12, alignment = "left", lineHeight = 1, lineWidth = 0, textBaseline = "alphabetic", textAlign = "start") {
        var button = new Buttoon(shape, text, font, color, fontSize, alignment, lineHeight, lineWidth, textBaseline, textAlign);
        this.#messenger.addListener(EngineEvent.INNER_EVENT.BUTTON_PRESSED, button.onClick);
        this.#messenger.addListener(EngineEvent.INNER_EVENT.BUTTON_RELEASED, button.onRelease);
        this.#elements.set(name, button);
    }
    createPolygon(name = "", position = new vec2(0, 0), points = [], color = "black", lineWidth = 1, lineColor = "black") {
        var polygon = new convexPolygon(position, points, color);
        var element = new shapeElement(polygon);
        this.#elements.set(name, element);
    }
    setCurrentMousePosition(position = new vec2(0, 0)) {
        this.#currentMousePosition = position;
    }
    setMouse(mouse = false) {
        this.#mouse = mouse;
    }
    getElement(name = "") {
        return this.#elements.get(name);
    }
}
export class UIElenment {
    constructor() {
        this.isActived = true;
    }
    update() { }
    
    draw(context) { }
    
    setIsActived(isActived = true) {
        this.isActived = isActived;
    }
    isPointInside(point = new vec2(0, 0)) {}
}
export class Text extends UIElenment{
    constructor(text = "", font = "arial", color = "black", position = new vec2(0, 0), size = 12, alignment = "left", lineHeight = 1, lineWidth = 0, textBaseline = "alphabetic", textAlign = "start") {
        super();
        this.text = text;
        this.font = font;
        this.color = color;
        this.position = position;
        this.size = size;
        this.textBaseline = textBaseline;
        this.textAlign = textAlign;
    }
    setText(text = "") {
        this.text = text;
    }
    draw(context) {
        if (!this.isActived) {
            return;
        }
        context.font = this.size + "px " + this.font;
        context.fillStyle = this.color;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;
        context.fillText(this.text, this.position.x, this.position.y);
    }
}
export class Buttoon extends UIElenment{
    #text;
    #shape;
    #image;
    #imageSize;
    #isHold;
    constructor(shape = new Empty(), text = "", font = "Arial", color = "black", size = 12, alignment = "left", lineHeight = 1, lineWidth = 0, textBaseline = "alphabetic", textAlign = "start") {
        super();
        this.#text = new Text(text, font, color, shape.position, size, alignment, lineHeight, lineWidth, textBaseline, textAlign);
        this.#shape = shape;
        this.#image = null;

        this.onClick = new Delegate();
        this.onRelease = new Delegate();
    }
    setTextPosition(position = new vec2(0, 0)) {
        this.#text.position = position;
    }
    setImage(image, size) {
        this.#image = image;
        this.#imageSize = size;
    }
    setIsHold(isHold = false) {
        this.#isHold = isHold;
    }
    isPointInside(point = new vec2(0, 0)) {
        return this.#shape.isPointInside(point);
    }
    update() {
    }
    draw(context) {
        if(!this.isActived){
            return;
        }
        if (!(this.#shape instanceof Empty)) {
            this.#shape.draw(context);
        }
        this.#text.draw(context);
        if(this.#image != null){
            context.drawImage(this.#image, this.#shape.position.x, this.#shape.position.y, this.#imageSize.x, this.#imageSize.y);
        }
    }
}
export class shapeElement extends UIElenment{
    #shape;
    constructor(shape = new Empty()) {
        super();
        this.#shape = shape;
    }
    isPointInside(point = new vec2(0, 0)) {
        return this.#shape.isPointInside(point);
    }
    draw(context) {
        if(!this.isActived){
            return;
        }
        this.#shape.draw(context);
    }
}