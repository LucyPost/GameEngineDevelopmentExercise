export class Delegate {
    func;

    constructor() {
        this.object = null;
        this.func = null;
    }
    bind(object, func) {
        this.object = object;
        this.func = func;
    }
    invoke(parameters) {
        if (this.object == null || this.func == null) {
            return;
        }
        this.func.apply(this.object, parameters);
    }
}