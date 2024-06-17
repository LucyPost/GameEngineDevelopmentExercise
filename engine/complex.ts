export class Complex {
    real;
    imaginary;
    constructor(real = 0, imaginary = 0) {
        this.real = real;
        this.imaginary = imaginary;
    }
    add(other: Complex | number) {
        if(other instanceof Complex)
            return new Complex(this.real + other.real, this.imaginary + other.imaginary);
        else
            return new Complex(this.real + other, this.imaginary);
    }
    subtract(other = new Complex(0, 0)) {
        if(other instanceof Complex)
            return new Complex(this.real - other.real, this.imaginary - other.imaginary);
        else
            return new Complex(this.real - other, this.imaginary);
    }
    mutiply(other = new Complex(0, 0)) {
        if(other instanceof Complex)
            return new Complex(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
        else
            return new Complex(this.real * other, this.imaginary * other);
    }
}