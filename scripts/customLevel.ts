import { vec2 } from "../engine/vector";
import { Level } from "../engine/abstractLevel";
import { Brick } from "./customActor";

export class GameLevel extends Level{

    tileData;
    bricks;
    balls;
    player;

    constructor() {
        super();
        this.tileData = [];
        this.bricks = [];
        this.balls = [];

    }
    update(timeStamp, deltaTime) {
        super.update(timeStamp, deltaTime);
    }
    draw(context) {
        super.draw(context);
    }
    Load(level = "", levelWidth, levelHeight) {
        //clear data
        this.tileData.length = 0;
        this.bricks.length = 0;

        //load level data
        var levelE = document.getElementById(level);
        var levelContent = levelE.textContent;
        var levelLines = levelContent.split("\n");

        for (var i = 0; i < levelLines.length; ++i){
            var levelLineContent = [];
            var levelLine = levelLines[i].split(" ");
            for (var j = 0; j < levelLine.length; ++j){
                if (levelLine[j]!="") {
                    levelLineContent.push(Number(levelLine[j]));
                }
            }
            if (levelLineContent.length) {
                this.tileData.push(levelLineContent);       
            }
        }

        //init game objects in this level
        var height = this.tileData.length;
        var width = this.tileData[0].length;
        var unitWIdth = levelWidth / width;
        var unitHeight = levelHeight / height;
           
        for (var y = 0; y < height; ++y)
        {
            for (var x = 0; x < width; ++x)
            {
                if (this.tileData[y][x] == 0) {
                    continue;
                }
                var position = new vec2(unitWIdth * (x + 0.5), unitHeight * (y + 0.5));
                var size = new vec2(unitWIdth, unitHeight);
                var brick = new Brick(position, size);

                // check block type from level data (2D level array)
                if (this.tileData[y][x] == 1) // solid
                {
                    brick.isSolid = true;

                    if (Math.random() - 0.5 > 0) {
                        brick.color = "rgba(100%, 20%, 10%, 0.5)";
                        brick.element = "fire";
                    } else {
                        brick.color = "rgba(10%, 20%, 100%, 0.5)";
                        brick.element = "ice";
                    }
                }
                else if (this.tileData[y][x] > 1)	// non-solid; now determine its color based on level data
                {   
                    var color = "rgba(100%, 100%, 100%, 1)";
                    if (this.tileData[y][x] == 2) {
                        color = "rgba(20%, 60%, 100%, 0.4)";
                    } else if (this.tileData[y][x] == 3) {
                        color = "rgba(0%, 70%, 100%, 0.4)";
                    }
                    else if (this.tileData[y][x] == 4) {
                        color = "rgba(80%, 80%, 40%, 0.4)";
                    }
                    else if (this.tileData[y][x] == 5) {
                        color = "rgba(100%, 50%, 0%, 0.4)";
                    }
                    brick.color = color;
                    brick.score = this.tileData[y][x] - 1;
                }
                this.bricks.push(brick);
                this.placeObject(brick);
            }
        }
    }
    //检查是否所有砖块都被摧毁
    IsComplete() {
        var result = true;
        this.bricks.forEach(brick => {
            if (!brick.isSolid && !brick.destroyed) {
                result = false;
            }
        });
        return result;
    }
}