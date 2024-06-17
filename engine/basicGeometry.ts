import { vec2 } from "./vector";
import { Mat3 } from "./mat";

export class Transform {
    position;
    rotation;
    scale;

    #modelMatrix;

    isDirty;

    constructor(position = new vec2(0, 0), rotation = 0, scale = new vec2(1, 1)) {
        this.position = new vec2(position.x, position.y);
        this.rotation = rotation;
        this.scale = new vec2(scale.x, scale.y);

        this.#modelMatrix = new Mat3(1.0);

        this.computeModelMatrix();

        this.isDirty = false;
    }
    getLocalMatrix() {
        var translateMartix = Mat3.translate(new Mat3(1.0), this.position);
        var rotateMartix = Mat3.rotate(new Mat3(1.0), this.rotation);
        var scaleMartix = Mat3.scale(new Mat3(1.0), this.scale);

        return translateMartix.multiply(rotateMartix).multiply(scaleMartix);
    }
    computeModelMatrix(parentModelMatrix = new Mat3(1.0)) {
        this.#modelMatrix = parentModelMatrix.multiply(this.getLocalMatrix());
        this.isDirty = false;
    }
    setLocalPosition(position = new vec2(0, 0)) {
        this.position = new vec2(position.x, position.y);
        this.isDirty = true;
    }
    setLocalRotation(rotation = 0) {
        this.rotation = rotation;
        this.isDirty = true;
    }
    setLocalScale(scale = new vec2(1, 1)) {
        console.log("warning: setLocalScale is not implemented");

        this.scale = new vec2(scale.x, scale.y);
        this.isDirty = true;
    }
    getAbsolutePosition() {
        return this.#modelMatrix.data[2].toVec2();
    }
    getAbsoluteRotation() {
        var radians = 0;
        if (this.#modelMatrix.data[0].x > 0) {
            radians = Math.asin(this.#modelMatrix.data[0].y);
        } else {
            radians = Math.PI - Math.asin(this.#modelMatrix.data[0].y);
        }
        return radians;
    }
    getAbsoluteScale() {
        return new vec2(this.#modelMatrix.data[0].length(), this.#modelMatrix.data[1].length());
    }
    getModelMatrix() {
        return this.#modelMatrix;
    }
}

export class Empty {
    constructor() {
        this.position = new vec2(0, 0);
    }
}

export class convexPolygon {
    position;
    vertices;

    constructor(position = new vec2(0, 0), vertexes = [], fillStyle = "white", strokeStyle = "white") {
        this.position = new vec2(position.x, position.y);
        this.vertices = vertexes;
        this.fillMode = "solid";
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
    }
    isPointInside(point = new vec2(0, 0)) {
        var count = 0;
        for (var i = 0; i < this.vertices.length; ++i) {
            var p1 = this.vertices[i].add(this.position);
            var p2 = this.vertices[(i + 1) % this.vertices.length].add(this.position);

            if (p1.y == p2.y) {
                continue;
            }
            if (point.y < Math.min(p1.y, p2.y)) {
                continue;
            }
            if (point.y >= Math.max(p1.y, p2.y)) {
                continue;
            }
            var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
            if (x > point.x) {
                count++;
            }
        }
        return count % 2 == 1;
    }
    draw(context) {
        if (this.fillMode == "solid") {
            this.drawSolid(context);
        } else if (this.fillMode == "wire") {
            this.drawWire(context);
        }
    }
    drawSolid(context) {
        context.fillStyle = this.fillStyle;
        context.beginPath();
        context.moveTo(this.position.x + this.vertices[0].x, this.position.y + this.vertices[0].y);
        for (var i = 1; i < this.vertices.length; ++i) {
            context.lineTo(this.position.x + this.vertices[i].x, this.position.y + this.vertices[i].y);
        }
        context.closePath();
        context.fill();
    }
    drawWire(context) {
        context.strokeStyle = this.strokeStyle;
        context.beginPath();
        context.moveTo(this.position.x + this.vertices[0].x, this.position.y + this.vertices[0].y);
        for (var i = 1; i < this.vertices.length; ++i) {
            context.lineTo(this.position.x + this.vertices[i].x, this.position.y + this.vertices[i].y);
        }
        context.closePath();
        context.stroke();
    }
}

export class Rectangle extends convexPolygon{
    constructor(position = new vec2(0, 0), size = new vec2(0, 0), fillStyle = "white", strokeStyle = "white") {

        var vertexes = [];
        vertexes.push(new vec2(-size.x * 0.5, -size.y * 0.5));
        vertexes.push(new vec2(size.x * 0.5, -size.y * 0.5));
        vertexes.push(new vec2(size.x * 0.5, size.y * 0.5));
        vertexes.push(new vec2(-size.x * 0.5, size.y * 0.5));

        super(position, vertexes, fillStyle, strokeStyle);

        this.position = new vec2(position.x, position.y);
        this.size = size;
        this.fillMode = "solid";
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
    }
    isPointInside(point = new vec2(0, 0)) {
        if (point.x >= this.position.x - this.size.x * 0.5 && point.x <= this.position.x + this.size.x * 0.5 &&
            point.y >= this.position.y - this.size.y * 0.5 && point.y <= this.position.y + this.size.y * 0.5) {
            return true;
        }
        return false;
    }
    draw(context) {
        if (this.fillMode == "solid") {
            this.drawSolid(context);
        } else if (this.fillMode == "wire") {
            this.drawWire(context);
        }
    }
    drawSolid(context) {
        context.fillStyle = this.fillStyle;
        context.fillRect(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5, this.size.x, this.size.y);
    }
    drawWire(context) {
        context.strokeStyle = this.strokeStyle;
        context.strokeRect(this.position.x - this.size.x * 0.5, this.position.y - this.size.y * 0.5, this.size.x, this.size.y);
    }
    
}
export class Sphere extends convexPolygon{
    constructor(position = new vec2(0, 0), radius = 0, fillStyle = "white", strokeStyle = "white") {
        super(position, null, fillStyle, strokeStyle);

        this.position = new vec2(position.x, position.y);
        this.radius = radius;
        this.fillMode = "solid";
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
    }
    isPointInside(point = new vec2(0, 0)) {
        var distance = point.subtract(this.position).length();
        return distance < this.radius;
    }
    draw(context) {
        if (this.fillMode == "solid") {
            this.drawSolid(context);
        } else if (this.fillMode == "wire") {
            this.drawWire(context);
        }
    }
    drawSolid(context) {
        context.fillStyle = this.fillStyle;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
    drawWire(context) {
        context.strokeStyle = this.strokeStyle;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.stroke();
    }
}
export class Line {
    a;
    b;
    c;
    constructor(pointA = new vec2(0, 0), pointB = new vec2(0, 0)) {
        this.a = pointB.y - pointA.y;
        this.b = pointA.x - pointB.x;
        this.c = pointB.x * pointA.y - pointA.x * pointB.y;
    }
    distanceToOrigin() {
        return Math.abs(this.c) / Math.sqrt(this.a * this.a + this.b * this.b);
    }
}