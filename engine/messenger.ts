import { EngineEvent } from "./event";
import { Delegate } from "./delegate";

export class Messenger {
    eventTable;
    constructor() {
        this.eventTable = new Map();
        this.eventTable.set(EngineEvent.INNER_EVENT.COMPONENT_BEGIN_OVERLAP, []);
        this.eventTable.set(EngineEvent.INNER_EVENT.COMPONENT_END_OVERLAP, []);
        this.eventTable.set(EngineEvent.INNER_EVENT.BUTTON_PRESSED, []);
        this.eventTable.set(EngineEvent.INNER_EVENT.BUTTON_RELEASED, []);
        this.eventTable.set(EngineEvent.INNER_EVENT.SLIDE_VALUE_CHANGED, []);
    }
    addListener(event: string, delegate = new Delegate()) {
        if (!this.eventTable[event]) {
            this.eventTable[event] = [];
            this.eventTable[event].push(delegate);
            return;
        }
        this.eventTable[event].push(delegate);
    }
    removeListener(event: string, delegate = new Delegate()) {
        if (!this.eventTable[event]) {
            console.log("Error: Event " + event + " not found");
            return;
        }
        for (let i = 0; i < this.eventTable[event].length; ++i) {
            if (this.eventTable[event][i] == delegate) {
                this.eventTable[event].splice(i, 1);
                return;
            }
        }
    }
    broadcast(event: string, parameters) {
        if (!this.eventTable[event]) {
            return;
        }
        for (let i = 0; i < this.eventTable[event].length; ++i) {
            this.eventTable[event][i].invoke(parameters);
        }
    }
}