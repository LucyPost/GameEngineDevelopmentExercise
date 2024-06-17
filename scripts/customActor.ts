import { vec2 } from "../engine/vector";
import { Player } from "./player";
import { Sphere } from "../engine/basicGeometry";
import { Collision, Body } from "../physic/collision";
import { Empty, Rectangle, convexPolygon } from "../engine/basicGeometry";
import { Actor } from "../engine/actor";
import { ImageComponent } from "../engine/object";
import { BoundComponent } from "./customActorComponent";
import { getGameWidth, getGameHeight } from "../engine/engine";
import { debug } from "console";

const DIRECTION = new Array("UP", "RIGHT", "DOWN", "LEFT");

export class Ball extends Actor{

    @UProperty
    initialVelocity;
    
    velocity;
    initialSpeed;

    @UProperty
    radius: number;

    gameWidth;
    gameHeight;
    scoreCounter;
    timeStmp;

    @UProperty
    player;

    playerWidth;
    playerHeight;

    spacePressed;

    coverCircle;

    shouldDestroy;
    penetrating;
    element;

    constructor(position = new vec2(0, 0), velocity = new vec2(0.0, -0.15), radius = 0.0, player = new Player()) {
        super(position);

        this.initialVelocity = new vec2(velocity.x, velocity.y);
        this.velocity = new vec2(velocity.x, velocity.y);
        
        //this.radius = radius;

        this.gameWidth = getGameWidth();
        this.gameHeight = getGameHeight();
        this.scoreCounter = 0;

        this.spacePressed = false;

        this.player = player;
        this.playerWidth = player.getAbsoluteSize().x;
        this.playerHeight = player.getAbsoluteSize().y;

        this.timeStmp = 0;

        this.shouldDestroy = false;
        this.penetrating = false;
        this.element = "";

        this.coverCircle = new Sphere(this.getTransform().getAbsolutePosition(), this.radius);

        //首次释放将垂直移动
        this.velocity.x = 0;
        
        var IC = new ImageComponent(document.getElementById("ballImage"));
        IC.setSize(new vec2(radius * 2, radius * 2));
        this.attachComponent(IC);
        this.attachComponent(new BoundComponent());       
    }
    beginPlay() {
        super.beginPlay();

        this.coverCircle.radius = this.radius;

        this.velocity = new vec2(this.initialVelocity.x, this.initialVelocity.y);
        this.initialSpeed = this.initialVelocity.length();

        this.createBodyCircle(new vec2(this.radius * 2, this.radius * 2));
        this.body.setObjectType(Body.objectTypes.WORLD_DYNAMIC);
        this.body.setCollisionPreset(Body.collisionPresets.OVERLAP_ALL);

        this.body.onComponetBeginOverlap.bind(this, this.onBallBeginOverlap); 
    }
    update(timeStamp = 0, deltaTime = 0) {
        super.update();

        this.addRotation(0.5 * deltaTime);
        this.timeStmp = timeStamp;

        if (!this.player.isBallStuck) {
            this.addMovement(this.velocity.multiply(deltaTime));
        }
        else {                                                      //使球回到挡板上
            this.getTransform().setLocalPosition(new vec2(this.player.getTransform().getAbsolutePosition().x, this.player.getTransform().getAbsolutePosition().y - this.radius * 2));
        }
    }
    draw(context) {
        super.draw(context);
        
        this.coverCircle.position = this.getTransform().getAbsolutePosition();
        //根据元素改变球的颜色
        if (this.element == "fire") {
            this.coverCircle.fillStyle = "rgba(100%, 20%, 10%, 0.5)";
            this.coverCircle.draw(context);
        } else if (this.element == "ice") {
            this.coverCircle.fillStyle = "rgba(10%, 20%, 100%, 0.5)";
            this.coverCircle.draw(context);
        }
    }
    reset(position = new vec2(this.gameWidth + 1000, this.gameHeight + 1000)) {
        this.player.isBallStuck = true;
        this.getTransform().setLocalPosition(position);
        this.velocity = new vec2(this.initialVelocity.x, this.initialVelocity.y);
        this.body.shape.position = this.getTransform().getAbsolutePosition();
    }
    onBallBeginOverlap(collision = new Collision()) {
        if (collision.collided) {
            var other = collision.collider1.owner == this ? collision.collider2.owner : collision.collider1.owner;
            if (other instanceof Brick) {
                var brick = other;
                if (!brick.isSolid) {
                    brick.destroyed = true;
                    this.scoreCounter += brick.score;
                } else {
                    //改变球的元素属性
                    if (brick.element == "fire") {
                        if (this.element == "ice") {
                            this.element = "";
                        } else if (this.element == "") {
                            this.element = "fire";
                            this.velocity = this.velocity.multiply(1.2);
                        } else {
                            this.element = "fire";
                        }
                    } else if (brick.element == "ice") {
                        if (this.element == "fire") {
                            this.element = "";
                        } else {
                            this.element = "ice";
                        }
                    }
                }
            } else if (other instanceof Player) {
                var player = other;
                if (!this.player.isBallStuck && this.getTransform().getAbsolutePosition().y < player.getTransform().getAbsolutePosition().y) {
                    //计算碰撞点与板中心的距离
                    var distance = this.getTransform().getAbsolutePosition().x - player.getTransform().getAbsolutePosition().x;
                    var percentage = distance / (player.getAbsoluteSize().x * 0.6);
                    
                    //上述距离对球横向速度的影响强度
                    var strenth = 0.27;
                
                    this.velocity.x = this.initialVelocity.x + percentage * strenth;
                    this.velocity.y = -1 * (Math.abs(this.velocity.y));
    
                    this.velocity.normalize();
    
                    this.velocity = this.velocity.multiply(this.initialSpeed);
                    this.element = "";
    
                    this.penetrating = false;
                }
                return
            }
            var diffVector = collision.diffrenceVector;
            var direction = DIRECTION[this.VectorDrection(diffVector)];

            if (direction == "LEFT" || direction == "RIGHT") {
                this.velocity.x = -this.velocity.x;
                if (!diffVector.x) {
                    diffVector.x = 6;
                }
                //重定位小球
                var penetration = this.radius - Math.abs(diffVector.x) + 2;
                if (direction == "LEFT") {
                    this.addMovement(new vec2(penetration, 0));
                } else {
                    this.addMovement(new vec2(-penetration, 0));
                }
            } else {
                this.velocity.y = -this.velocity.y;
                if (!diffVector.y) {
                    diffVector.y = 6;
                }
                var penetration = this.radius - Math.abs(diffVector.y) + 2;
                if (direction == "UP") {
                    this.addMovement(new vec2(0, -penetration));
                } else {
                    this.addMovement(new vec2(0, penetration));
                }
            }
        }
    }
    VectorDrection(target) {
        var innerTarget = new vec2(target.x, target.y);
        var compass = [];
        compass.push(new vec2(0, 1));
        compass.push(new vec2(1, 0));
        compass.push(new vec2(0, -1));
        compass.push(new vec2(-1, 0));

        var max = 0;
        var bestMatch = -1;
        innerTarget.normalize();
        for (var i = 0; i < 4; ++i){
            var dotProduct = target.dot(compass[i]);
            if (dotProduct > max) {
                max = dotProduct;
                bestMatch = i;
            }
        }
        return bestMatch;
    }
}

export class Brick extends Actor{
     
    color;

    isSolid;
    destroyed;
    element;
    score;

    coveringBox;
    
    constructor(position = new vec2(0, 0), size = new vec2(0, 0), color = "rgba(100%, 100%, 100%, 1)", isSolid = false) {
        super(position);

        this.color = color;

        this.isSolid = isSolid;
        this.destroyed = false;
        this.element = "";
        this.score = 0;

        this.coveringBox = new Rectangle(position, size);

        var IC = new ImageComponent(document.getElementById("brickImage"), document.getElementById("solidBrickImage"));
        IC.setSize(size);
        this.attachComponent(IC);

        this.createBodyBox(size);
        
        this.body.setObjectType(Body.objectTypes.WORLD_STATIC);
        this.body.setCollisionPreset(Body.collisionPresets.BLOCK_DYNAMIC);
    }
    update(timeStamp = 0, deltaTime = 0) {
        if (this.destroyed) {
            this.body.shape = new Empty();
        }
        super.update();
    }
    draw(context) {
        if (!this.destroyed) {
            if (this.isSolid) {
                this.imageComponent.setActiveSprite(2);
            } else {
                this.imageComponent.setActiveSprite(1);
            }
            super.draw(context);
            //根据元素改变砖块的颜色
            this.coveringBox.position = this.getTransform().getAbsolutePosition();
            this.coveringBox.fillStyle = this.color;
            this.coveringBox.drawSolid(context);
        }
    }
}
export class TestPolygon extends Actor {

    polygon;

    velocity;

    stuck;
    spacePressed;

    player;

    constructor(position = new vec2(0, 0), size = new vec2(0, 0), points = [], player = new Player()) {
        super(position);

        this.polygon = new convexPolygon(position, points);
        this.polygon.fillMode = "solid";

        this.velocity = new vec2(0, -0.03);

        this.stuck = true;
        this.spacePressed = false;

        this.player = player;

        //this.createBodyPolygon();
        
        this.body.setObjectType(Body.objectTypes.WORLD_STATIC);
        this.body.setCollisionPreset(Body.collisionPresets.BLOCK_DYNAMIC);
    }
    update(timeStamp = 0, deltaTime = 0) {
        super.update();

        //this.addRotation(0.5 * deltaTime);

        if (this.player == null) {
            return;
        }

        if (this.spacePressed) {
            this.stuck = false;
        }
        if (!this.stuck) {   
            this.addMovement(this.velocity.multiply(deltaTime));
        } else {
            this.getTransform().setLocalPosition(new vec2(this.player.getTransform().getAbsolutePosition().x - 20, this.player.getTransform().getAbsolutePosition().y - 24));
        }
    }
    draw(context) {
        this.polygon.position = this.getTransform().getAbsolutePosition();
        this.polygon.draw(context);
    }
    realse() {
        this.stuck = false;
    }
}