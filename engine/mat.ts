import { vec2, vec3 } from "./vector";
import { Complex } from "./complex";

export class Mat3 {
    data;
    constructor(param?: number | Mat3) {
        this.data = [];

        if (param == 1 || param == null) {
            this.data.push(new vec3(1, 0, 0));
            this.data.push(new vec3(0, 1, 0));
            this.data.push(new vec3(0, 0, 1));
        } else if (param instanceof Mat3) {
            this.data.push(new vec3(param.data[0].x, param.data[0].y, param.data[0].z));
            this.data.push(new vec3(param.data[1].x, param.data[1].y, param.data[1].z));
            this.data.push(new vec3(param.data[2].x, param.data[2].y, param.data[2].z));
        } else {
            console.log("Mat3 constructor illegal parameter");
        }
    }
    identity() {
        this.data[0].x = 1;
        this.data[0].y = 0;
        this.data[0].z = 0;

        this.data[1].x = 0;
        this.data[1].y = 1;
        this.data[1].z = 0;

        this.data[2].x = 0;
        this.data[2].y = 0;
        this.data[2].z = 1;
    }
    multiply(other = new Mat3()) {
        var result = new Mat3();

        result.data[0] = this.data[0].multiply(other.data[0].x).add(this.data[1].multiply(other.data[0].y)).add(this.data[2].multiply(other.data[0].z));
        result.data[1] = this.data[0].multiply(other.data[1].x).add(this.data[1].multiply(other.data[1].y)).add(this.data[2].multiply(other.data[1].z));
        result.data[2] = this.data[0].multiply(other.data[2].x).add(this.data[1].multiply(other.data[2].y)).add(this.data[2].multiply(other.data[2].z));

        return result;
    }

    static translate(m = new Mat3(), v = new vec2(0, 0)) {
        var result = new Mat3(m);
        result.data[2]= m.data[0].multiply(v.x).add(m.data[1].multiply(v.y)).add(m.data[2]);
        return result;
    }
    static scale(m = new Mat3(), v = new vec2(0, 0)) {
        var result = new Mat3();
        result.data[0] = m.data[0].multiply(v.x);
        result.data[1] = m.data[1].multiply(v.y);
        result.data[2] = m.data[2];
        return result;
    }
    //copilot's code
    static rotate(m = new Mat3(), angle = 0) {
        var result = new Mat3(1.0);

        angle = radians(angle);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        result.data[0] = m.data[0].multiply(c).add(m.data[1].multiply(s));
        result.data[1] = m.data[0].multiply(-s).add(m.data[1].multiply(c));
        result.data[2] = m.data[2];
        
        return result;
    }
    static transpose(m = new Mat3()) {
        var result = new Mat3();
        result.data[0] = new vec3(m.data[0].x, m.data[1].x, m.data[2].x);
        result.data[1] = new vec3(m.data[0].y, m.data[1].y, m.data[2].y);
        result.data[2] = new vec3(m.data[0].z, m.data[1].z, m.data[2].z);
        return result;
    }
    getEigenvalue(){
        var result = new vec3();
        var a = this.data[0].x;
        var b = this.data[0].y;
        var c = this.data[0].z;
        var d = this.data[1].x;
        var e = this.data[1].y;
        var f = this.data[1].z;
        var g = this.data[2].x;
        var h = this.data[2].y;
        var i = this.data[2].z;
        
        //trace = a + e + i;
        //det = m.determinant();

        var solution = solveSecondOrderDifferentialEquation(1, - a - e, a * e - b * d);

        result.z = i;
        result.y = solution[1];
        result.x = solution[0];

        return result;
    }
}
export function radians(angle = 0) {
    return angle * Math.PI / 180;
}
export function angle(radians = 0) {
    return radians * 180 / Math.PI;
}
export function solveSecondOrderDifferentialEquation(a = 0, b = 0, c = 0) {
    var result = [];
    var delta = b * b - 4 * a * c;
    if (delta > 0) {
        var x1 = (-b + Math.sqrt(delta)) / (2 * a);
        var x2 = (-b - Math.sqrt(delta)) / (2 * a);
        result.push(x1);
        result.push(x2);
    } else if (delta == 0) {
        var x = -b / (2 * a);
        result.push(x);
        result.push(x);
    } else {
        result.push(new Complex(-b / (2 * a), Math.sqrt(-delta) / (2 * a)));
        result.push(new Complex(-b / (2 * a), -Math.sqrt(-delta) / (2 * a)));
    }
    return result;
}