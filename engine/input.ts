import { vec2 } from "./vector";
import { Messenger } from "./messenger";
import { Delegate } from "./delegate";

export class InputMappingContext {
    messenger;
    mapping;
    actions;
    constructor(messenger = new Messenger()) {
        this.messenger = messenger;
        this.mapping = new Map();
        this.actions = new Map();
    }
    MapKey(name, key, factor = 1) {
        if (!this.actions.has(name)) {
            console.log("Error: Action " + name + " not found");
            return;
        }
        var action = this.actions.get(name);
        action.factorMap.set(key, factor);
        this.messenger.addListener(name, action.onValueChange);

        if(!this.mapping.has(action)) {
            this.mapping.set(action, []);
        }
        this.mapping.get(action).push(key);
    }
    createInputAction(name = "", mode = InputAction.MODE.WHILE_PRESSED) {
        var action = new InputAction();
        action.name = name;
        action.mode = mode;
        this.actions.set(name, action);
    }
}
export class InputAction {
    name;
    mode;
    value;
    factorMap;

    onValueChange;

    static MODE = {
        WHEN_PRESSED: "whenPressed",
        WHEN_RELEASED: "whenReleased",
        WHILE_PRESSED: "whilePressed"
    }
    constructor() {
        this.name = "";
        this.mode = InputAction.MODE.WHILE_PRESSED;
        this.value = 0;
        this.factorMap = new Map();
        this.onValueChange = new Delegate();
    }
}
export class InputHandler {
    #inputMappingContext;
    #mousePosition;
    #mouseDown;
    #mouseUp
    #keyMap;
    constructor() {}
    bindContext(InputMappingContext: InputMappingContext) {
        
        window.removeEventListener("keydown", () => { });
        window.removeEventListener("keyup", () => { });
        window.removeEventListener("mousemove", () => { });
        window.removeEventListener("mousedown", () => { });
        window.removeEventListener("mouseup", () => { });

        this.#inputMappingContext = InputMappingContext;
        this.#mouseDown = false;
        this.#keyMap = new Map();

        for (const [action, keys] of this.#inputMappingContext.mapping) {
            for (const key of keys) {
                this.#keyMap.set(key, false);
            }
        }
        window.addEventListener("keydown", (e) => {
            for (const [action, keys] of this.#inputMappingContext.mapping) {
                for (const key of keys) {
                    if (e.key == key) {
                        if (action.mode == InputAction.MODE.WHILE_PRESSED) {
                            action.value = 1;
                            var parameters = [];

                            parameters.push(action.value * action.factorMap.get(key));
                            this.#inputMappingContext.messenger.broadcast(action.name, parameters);
                            this.#keyMap.set(key, true);

                        } else if (action.mode == InputAction.MODE.WHEN_PRESSED) {
                            if (!this.#keyMap.get(key)) {

                                action.value = 1;
                                var parameters = [];

                                parameters.push(action.value * action.factorMap.get(key));

                                this.#inputMappingContext.messenger.broadcast(action.name, parameters);
                                this.#keyMap.set(key, true);
                            }
                        }
                    }
                }
            }
        })
        window.addEventListener("keyup", (e) => {
            for (const [action, keys] of this.#inputMappingContext.mapping) {
                for (const key of keys) {
                    if (e.key == key) {
                        if (action.mode == InputAction.MODE.WHILE_PRESSED) {
                            this.#keyMap.set(key, false);
                            action.value = 0;
                            var parameters = [];
                            parameters.push(action.value * action.factorMap.get(key));
                            this.#inputMappingContext.messenger.broadcast(action.name, parameters);
                        }
                        this.#keyMap.set(key, false);
                    }
                }
            }
        })
        window.addEventListener("mousemove", (e) => {
            this.#mousePosition = new vec2(e.clientX, e.clientY);
        })
        window.addEventListener("mousedown", (e) => {
            this.#mouseDown = true;
        })
        window.addEventListener("mouseup", (e) => {
            this.#mouseUp = true;
        })
    }
    getMousePosition() {
        return this.#mousePosition;
    }
    getMouse() {
        var mouseDown = this.#mouseDown;
        var mouseUp = this.#mouseUp;
        var out = {
            mouse1Down: mouseDown,
            mouse1Up: mouseUp
        }
        this.#mouseDown = false;
        this.#mouseUp = false;
        return out;
    }
}