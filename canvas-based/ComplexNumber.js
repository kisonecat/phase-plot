/** ComplexNumber class
 * 
 * The complex number class allows us to do complex math. It accepts a real and imaginary part
 *
 * This code has been modified somewhat by Jim Fowler <fowler@math.osu.edu>
 * 
 * @author Jan Hartigan
 * @inspiration http://www.java2s.com/Code/JavaScript/Language-Basics/Complexclasstorepresentcomplexnumbers.htm
 * @version 1.0.0 (2011-03-08)
 */

/**
 * @param Number	real
 * @param Number	imaginary
 */
function ComplexNumber(real,imaginary) {
	this.real = real;
	this.imaginary = imaginary;
}

//Then we make the prototype object for the class so we can perform actions on complex numbers (like multiplication, addition, etc.)
ComplexNumber.prototype = {
	/* The real part of the complex number
	 * 
	 * @type Number
	 */
	real: 0,
	
	/* The imaginary part of the complex number
	 * 
	 * @type Number
	 */
	imaginary: 0,
	
	/**
	 * The add operation which sums the real and complex parts separately
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two arguments, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	add: function() {
	    if(arguments.length == 1)
	        return new ComplexNumber(this.real + arguments[0].real, this.imaginary + arguments[0].imaginary);
	    else
	        return new ComplexNumber(this.real + arguments[0], this.imaginary + arguments[1]);
	},
	
	/**
	 * The subtract operation which subtracts the real and complex parts from one another separately
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two arguments, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	sub: function() {
	    if(arguments.length == 1)
	        return new ComplexNumber(this.real - arguments[0].real, this.imaginary - arguments[0].imaginary);
	    else
	        return new ComplexNumber(this.real - arguments[0], this.imaginary - arguments[1]);
	},
	
	/**
	 * The multiplication operation which multiplies two complex numbers
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	mult: function() {
	    var multiplier = arguments[0];
		
	    if(arguments.length != 1)
	        multiplier = new ComplexNumber(arguments[0], arguments[1]);
		 
	    return new ComplexNumber(this.real * multiplier.real - this.imaginary * multiplier.imaginary, 
								this.real * multiplier.imaginary + this.imaginary * multiplier.real);
	},
	
	/**
	 * The modulus of a complex number
	 * 
	 * @return number
	 */
	mod: function() {
	    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
	},

	/* The argument of a complex number, between 0 and 2*Math.pi
	 * 
	 * @return number
	 */
        argument: function() {
	    return Math.atan2( this.imaginary, this.real ) + Math.PI;
	},
	
	/**
	 * The string representation of a complex number (e.g. 4 + 3i)
	 * 
	 * @return String
	 */
	toString: function() {
	    return this.real + " + " + this.imaginary + "i";
	}
};