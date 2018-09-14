$(function() {
    var canvas = document.getElementById("canvas");
    var ctx; // = canvas.getContext("2d");
    //The following functions convert pixel Xs and Ys to real and imaginary
    //parts of a complex    number, and back again
    var pixToReal = function(n) {
        return n / 15.0 - 10.0
    };
    var pixToImag = function(n) {
        return -n / 15.0 + 10
    }
    var realToPix = function(x) {
        return Math.round((x + 10.0) * 15)
    }
    var imagToPix = function(y) {
        return Math.round((-y + 10.0) * 15)
    }

    function slowComplexToRGB(z) {
        var theta = z.argument() % (2 * Math.PI);
        var Hp = (theta / (2 * Math.PI)) * 6
        var X = Math.abs(Math.round((1 - Math.abs(Hp % 2 - 1)) * 255))
        var C = [0, 0, 0];
        if (Hp >= 0 && Hp < 1) {
            C[0] = 255;
            C[1] = X;
        } else if (1 <= Hp && Hp < 2) {
            C[0] = X;
            C[1] = 255;
        } else if (2 <= Hp && Hp < 3) {
            C[1] = 255;
            C[2] = X;
        } else if (3 <= Hp && Hp < 4) {
            C[1] = X;
            C[2] = 255;
        } else if (4 <= Hp && Hp < 5) {
            C[0] = X;
            C[2] = 255;
        } else if (5 <= Hp && Hp < 6) {
            C[0] = 255;
            C[2] = X;
        }
        return C
    }


    var complexToRGBTable = new Array();
    var redTable = new Array();
    var greenTable = new Array();
    var blueTable = new Array();
    var fineness = 1000;
    for( i=0; i<fineness; i++ ) {
	var theta = (2 * Math.PI * i) / fineness;
	complexToRGBTable[i] = slowComplexToRGB( new ComplexNumber(Math.cos(theta), Math.sin(theta)) );
	redTable[i] = complexToRGBTable[i][0]
	greenTable[i] = complexToRGBTable[i][1]
	blueTable[i] = complexToRGBTable[i][2]
    }

    //Takes a complex number and returns the RGB value of the corresponding
    //point on the color wheel.
    function complexToRGB(z) {
        var theta = z.argument();
        var Hp = (theta / (2 * Math.PI)) * fineness;
	return complexToRGBTable[Math.floor(Hp) % fineness];
    }

    //a complex number
    var v = new ComplexNumber(0,4);

    //the function f(z) = z*(z+5)*(z+v)
    var f = function(z) {
	return ((z.add((new ComplexNumber(5,5)))).add(z.mult(z))).mult( z.add(v) )
    }

    //makes v the opposite complex number your mouse is pointing at,
    //i.e. your mouse points at a root of f

    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, 300, 300);

    makeFrame = function() {
	var offset = 0;
	var data = imageData.data;
        for (var m = 0; m < 300; m++) {
            for (var n = 0; n < 300; n++) {
                var x = pixToReal(n);
                var y = pixToImag(m);
                var z = new ComplexNumber(x,y);
                var w = f(z);

		var theta = w.argument() + 2 * Math.PI;
		var Hp = (theta / (2 * Math.PI)) * fineness;
		var i = Math.floor(Hp) % fineness;

                data[offset++] = redTable[i];
                data[offset++] = greenTable[i];
                data[offset++] = blueTable[i];
                data[offset++] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    var canvasOffsetLeft = $(canvas).offset().left;
    var canvasOffsetTop= $(canvas).offset().top;

    function onMouseMove(evt) {
        v = new ComplexNumber(-pixToReal(evt.pageX - canvasOffsetLeft),
			      -pixToImag(evt.clientY - canvasOffsetTop));
	window.setTimeout(makeFrame,0);
    }

    $(canvas).mousemove(onMouseMove);

});