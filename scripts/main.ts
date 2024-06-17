import { GameEngine } from "../engine/engine";
import { Game } from "./game";

import {InputMappingContextsFileData, ActorFileData} from "../engine/DataType"

import { parse } from 'yaml'

window.addEventListener('load',async function () {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    let width = 0;
    let height = 0;
    if (canvas != null) {
        width = (canvas.width = 800);
        height = (canvas.height = 600);    
    }

    var background = document.getElementById("backgroundImage");
    var engine: GameEngine;
    var game: Game;

    fetch("http://localhost:5173/yaml/inputContexts.yaml").then(response => {
        engine = new GameEngine(background);
        game = new Game(width, height);

        const promiseString: Promise<string> = response.text();

        promiseString.then(inputContextsDataStr => {
            var inputContextsData: InputMappingContextsFileData = parse(inputContextsDataStr);
            engine.createInputMappingContextsFromData(inputContextsData);
        })

    }).then(() => {
        fetch("http://localhost:5173/yaml/scene.yaml").then(response => {

            const promiseString: Promise<string> = response.text();

            promiseString.then(sceneDataStr => {
                var sceneData: ActorFileData = parse(sceneDataStr);
                engine.createActorsFromData(sceneData);

                engine.onStart = () => {
                    game.Init();
                    }
                    engine.onUpdate = (timeStamp, deltaTime) => {
                        game.update(timeStamp, deltaTime);
                        game.draw(engine.context);
                    }
        
                    engine.start(game);
            })
        })
    })
});
// async function populate(url: string) {
//     const requestURL = url;
//     const request = new Request(requestURL);
  
//     const response = await fetch(request);
//     const data = await response.json();

//     return data;
//   }