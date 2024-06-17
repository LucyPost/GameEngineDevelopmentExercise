export class vec2 {
    x
    y
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(other = new vec2(0, 0)) {
        return new vec2(this.x + other.x, this.y + other.y);
    }
    sub(other = new vec2(0, 0)) {
        return new vec2(this.x - other.x, this.y - other.y);
    }
    dot(other = new vec2(0, 0)) {
        return this.x * other.x + this.y * other.y;
    }
    multiply(value) {
        if(typeof(value) == "number")
            return new vec2(this.x * value, this.y * value);
        else
            return new vec2(this.x * value.x, this.y * value.y);
    }
    normalize() {
        var lenth = this.length();
        this.x /= lenth;
        this.y /= lenth;
    }
    rotate(angle) {
        var x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        var y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
        return new vec2(x, y);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    negate() {
        return new vec2(-this.x, -this.y);
    }
    equals(other = new vec2(0, 0)) {
        return this.x == other.x && this.y == other.y;
    }
}
export class vec3 {
    x
    y
    z
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;    
    }
    toVec2() {
        return new vec2(this.x, this.y);
    }
    add(other = new vec3(0, 0, 0)) {
        return new vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    sub(other = new vec3(0, 0, 0)) {
        return new vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    dot(other = new vec3(0, 0, 0)) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
    multiply(value) {
        if (typeof (value) == "number")
            return new vec3(this.x * value, this.y * value, this.z * value);
        else
            return new vec3(this.x * value.x, this.y * value.y, this.z * value.z);
    }
    normalize() {
        var lenth = this.length();
        this.x /= lenth;
        this.y /= lenth;
        this.z /= lenth;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

export function clamp(value = 0, min = 0, max = 0) {
    return Math.max(min, Math.min(max, value));
}

export function tripleProduct(a = new vec2(0, 0), b = new vec2(0, 0), c = new vec2(0, 0)) {
    var r = b.multiply(a.dot(c)).sub(a.multiply(b.dot(c)));
    return r;
}