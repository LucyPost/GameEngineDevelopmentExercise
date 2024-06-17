import { vec2, clamp, tripleProduct } from "../engine/vector";
import { Empty, Sphere, Rectangle, convexPolygon, Line } from "../engine/basicGeometry";
import { Delegate } from "../engine/delegate";
import { EngineEvent } from "../engine/event";
import { Messenger } from "../engine/messenger";

export class Collision {
    collided;

    collider1;
    collider2;

    collisionMap;

    diffrenceVector;

    constructor() {
        this.collided = false;
        this.collisionMap = new Map();
    }
}
export class Body {
    shape;

    collisionPresets;
    objectType;
    collision;

    radius;
    vertexes;

    owner;

    onComponetBeginOverlap;
    onComponetEndOverlap;

    static collisionPresets = {
        NONE: "none",
        OVERLAP_ALL: "overlapAll",
        BLOCK_DYNAMIC: "blockDynamic",
    }
    static objectTypes = {
        WORLD_STATIC: "worldStatic",
        WORLD_DYNAMIC: "worldDynamic",
        PAWN: "pawn"
    }
    constructor(shape = new Empty(), objectType = Body.objectTypes.WORLD_STATIC, collisionPreset = Body.collisionPresets.NONE) {

        this.shape = shape;

        this.radius = null;
        this.vertexes = null;
        
        this.objectType = objectType;
        this.collisionPresets = collisionPreset;

        this.collision = new Collision();

        this.onComponetBeginOverlap = new Delegate();
        this.onComponetEndOverlap = new Delegate();
    }
    setObjectType(objectType = Body.objectTypes.WORLD_STATIC) {
        this.objectType = objectType;
    }
    setCollisionPreset(collisionPreset = Body.collisionPresets.NONE) {

        this.collisionPresets = collisionPreset;

        if (collisionPreset == Body.collisionPresets.NONE) {
            console.log("Warning: Bounding set to none collision type");
        }
    }
}

export function doCollision(bounding1 = new Body(), otherBoundings = [], messenger = new Messenger()) {
    for (var i = 0; i < otherBoundings.length; i++) {
        if (bounding1.shape instanceof Rectangle && otherBoundings[i].shape instanceof Rectangle) {
            doCollisionAABB(bounding1, otherBoundings[i], messenger);
        } else if (bounding1.shape instanceof Sphere && otherBoundings[i].shape instanceof Sphere) {
            doCollisionCircle(bounding1, otherBoundings[i], messenger);
        } else if (bounding1.shape instanceof Sphere && otherBoundings[i].shape instanceof Rectangle) {
            doCollisionAABBCircle(bounding1, otherBoundings[i], messenger);
        } else if(bounding1.shape instanceof Rectangle && otherBoundings[i].shape instanceof Sphere) {
            doCollisionAABBCircle(otherBoundings[i], bounding1, messenger);
        } else if (bounding1.shape instanceof convexPolygon) {
            doCollisionPolygons(bounding1, otherBoundings[i], messenger);
        } else if(otherBoundings[i].shape instanceof convexPolygon) {
            doCollisionPolygons(otherBoundings[i], bounding1, messenger);
        }
    }
}

function checkCollisionAABB(bounding1 = new Body(), bounding2 = new Body()) {
    if (bounding1.shape.position.x < bounding2.shape.position.x + bounding2.shape.size.x &&
        bounding1.shape.position.x + bounding1.shape.size.x > bounding2.shape.position.x &&
        bounding1.shape.position.y < bounding2.shape.position.y + bounding2.shape.size.y &&
        bounding1.shape.position.y + bounding1.shape.size.y > bounding2.shape.position.y) {
        return true;
    }
    return false;
}
function doCollisionAABB(bounding1 = new Body(), bounding2 = new Body(), messenger = new Messenger()) {

    var center1 = bounding1.shape.position;
    var center2 = bounding2.shape.position;

    if (checkCollisionAABB(bounding1, bounding2)) {
        var collision = new Collision();

        collision.collided = true;
        collision.collider1 = bounding1;
        collision.collider2 = bounding2;

        var diffrenceVector = center1.sub(center2);

        collision.diffrenceVector = diffrenceVector;

        if(messenger) {
            var parameters = [];
            parameters.push(collision);
            messenger.broadcast(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, parameters);
        } else {
            console.log("Warning: no messenger provided");
        }
    }
}

function checkCollisionCircle(bounding1 = new Body(), bounding2 = new Body()) {
    var distance = bounding1.shape.position.sub(bounding2.shape.position).length();
    return distance < bounding1.shape.radius + bounding2.shape.radius;
}

function doCollisionCircle(bounding1 = new Body(), bounding2 = new Body(), messenger = new Messenger()) {

    if (checkCollisionCircle(bounding1, bounding2)) {
        var collision = new Collision();

        collision.collided = true;
        collision.collider1 = bounding1;
        collision.collider2 = bounding2;

        var diffrenceVector = bounding1.shape.position.sub(bounding2.shape.position);

        collision.diffrenceVector = diffrenceVector;

        if (messenger) {
            var parameters = [];
            parameters.push(collision);
            messenger.broadcast(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, parameters);
        }
    }
}

function checkCollisionAABBCircle(bounding1 = new Body(), bounding2 = new Body()) {
    
    var circleCenter = bounding1.shape.position;

    var aabbHalfExtents = new vec2(bounding2.shape.size.x * 0.5, bounding2.shape.size.y * 0.5);
    var aabbCenter = bounding2.shape.position;

    var difference = new vec2(circleCenter.x - aabbCenter.x, circleCenter.y - aabbCenter.y);    
    var clampedX = clamp(difference.x, -aabbHalfExtents.x, aabbHalfExtents.x);
    var clampedY = clamp(difference.y, -aabbHalfExtents.y, aabbHalfExtents.y);
    var clamped = new vec2(clampedX, clampedY);

    var closest = aabbCenter.add(clamped);
    var diffVector = closest.sub(circleCenter);

    if (diffVector.length() < bounding1.shape.radius) {
        return diffVector;
    }
    return null;
}
function doCollisionAABBCircle(bounding1 = new Body(), bounding2 = new Body(), messenger = new Messenger()) {

    var diffrenceVector = checkCollisionAABBCircle(bounding1, bounding2);

    if (diffrenceVector != null) {
        var collision = new Collision();

        collision.collided = true;
        collision.collider1 = bounding1;
        collision.collider2 = bounding2;

        collision.diffrenceVector = diffrenceVector;

        if (messenger) {
            var parameters = [];
            parameters.push(collision);
            messenger.broadcast(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, parameters);
        }
    }
}
function doCollisionPolygons(bounding1 = new Body(), bounding2 = new Body(), messenger = new Messenger()) {
    if (bounding1.shape instanceof Sphere || bounding2.shape instanceof Sphere) {
        return;
    }
    if (GJK(bounding1.shape, bounding2.shape)) {
        var collision = new Collision();

        console.log("collision");

        collision.collided = true;
        collision.collider1 = bounding1;
        collision.collider2 = bounding2;

        collision.diffrenceVector = bounding1.shape.position.sub(bounding2.shape.position);

        if (messenger) {
            var parameters = [];
            parameters.push(collision);
            messenger.broadcast(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, parameters);
        }
        return;
    }
    console.log("no collision");
}

var direction = new vec2(0, 0);

function GJK(shapeA, shapeB) {
    var simplex = [];
    var verticeStep = 0;
    direction = new vec2(shapeA.position.x - shapeB.position.x, shapeA.position.y - shapeB.position.y);
    var a0 = support(shapeA, shapeB);
    simplex.push(a0);
    direction = direction.negate();
    while (true) {
        var a = support(shapeA, shapeB);
        ++verticeStep;

        if (a.dot(direction) < 0 || verticeStep > 30) {
            //break;
            return false;
        }
        simplex.push(a);
        if (doSimplex(simplex)) {
            //break;
            return true;
        }
    }
}
function support(shapeA, shapeB) {
    if (direction.length() != 0) {
        direction.normalize();
    }
    var a = getFarthestPointInDirection(shapeA, new vec2(direction.x, direction.y));
    var b = getFarthestPointInDirection(shapeB, new vec2(-direction.x, -direction.y));
    
    return a.sub(b);
}
function getFarthestPointInDirection(shape, d) {
    var vertices = shape.vertices;
    var maxDistance = -100000;
    var maxIndex = 0;
    for(var i = 0; i < vertices.length; i++)
    {
        var distance = d.dot(shape.position.add(vertices[i]));
        if(distance > maxDistance)
        {
            maxDistance = distance;
            maxIndex = i;
        }
    }
    return shape.position.add(vertices[maxIndex]);
}
function doSimplex(simplex = []) {
    var a: vec2 = simplex[simplex.length - 1];
    var ao = a.negate();
    if (isOringinInSimplex(simplex)) {
        return true;
    }
    if (simplex.length == 3) {
        var b = simplex[1];
        var c = simplex[0];
        var ab = b.sub(a);

        var l1 = new Line(a, b);
        var l2 = new Line(a, c);
        
        var closerPoint = l1.distanceToOrigin() < l2.distanceToOrigin() ? b : c;
        var shouleRemove = l1.distanceToOrigin() < l2.distanceToOrigin() ? 0 : 1;
        var ad = closerPoint.sub(a);

        if (closerPoint.dot(ao) < 0) {
            simplex.splice(shouleRemove, 1);
            direction = new vec2(ao.x, ao.y);
        } else {
            simplex.splice(shouleRemove, 1);
            var adPerp = tripleProduct(ad, ab, ad);
            if (adPerp.dot(ao) < 0) {
                adPerp.x = -adPerp.x;
                adPerp.y = -adPerp.y;
            }
            direction = new vec2(adPerp.x, adPerp.y);
        }
    } else {
        var b = simplex[0];

        if (a.x - b.x < 0.0001 && a.y - b.y < 0.0001) {
            console.log("unexpected")
        }

        var ab = b.sub(a);
        if (ab.dot(ao) > 0) {
            var abPerp = tripleProduct(ab, ao, ab);
            if(abPerp.dot(ao) < 0) {
                abPerp.x = -abPerp.x;
                abPerp.y = -abPerp.y;
            }
            direction = new vec2(abPerp.x, abPerp.y);
        } else {
            direction = new vec2(ao.x, ao.y);
        }
    }
    return false;
}
function isOringinInSimplex(simplex = []) {
    if(simplex.length == 2) {
        var a = simplex[0];
        var b = simplex[1];
        var ab = b.sub(a);
        var ao = a.negate();
        var abPerp = tripleProduct(ab, ao, ab);
        return abPerp.length() == 0;
    } else {
        var a = simplex[2];
        var b = simplex[1];
        var c = simplex[0];

        var sABC = 0.5 * Math.abs(a.x * b.y + b.x * c.y + c.x * a.y - b.x * a.y - c.x * b.y - a.x * c.y);
        var sOAB = 0.5 * Math.abs(a.x * b.y - b.x * a.y);
        var sOAC = 0.5 * Math.abs(a.x * c.y - c.x * a.y);
        var sOBC = 0.5 * Math.abs(b.x * c.y - c.x * b.y);

        var difference = sOAB + sOAC + sOBC - sABC;

        return Math.abs(difference) < 0.0001;
    }
}