function ColorTable(f) {
    this.lookup = f;
};

function PhaseColorTable(f) {
    this.lookup = f;
    this.cache();
};

PhaseColorTable.prototype = {
    cache: function() {
	console.log('caching phase color table...');

	var fineness = 1000;
	var redTable = new Array(fineness);
	var greenTable = new Array(fineness);
	var blueTable = new Array(fineness);

	this.redTable = redTable;
	this.greenTable = greenTable;
	this.blueTable = blueTable;

	for( var i=0; i<fineness; i++ ) {
	    var theta = i * 2 * Math.PI / fineness;
	    var color = this.lookup( new Point(Math.cos(theta), Math.sin(theta)) );
	    redTable[i] = Math.floor(color[0]);
	    greenTable[i] = Math.floor(color[1]);
	    blueTable[i] = Math.floor(color[2]);
	}

	this.lookup = function(z) {
	    var index = Math.floor((Math.atan2(z.y,z.x) + Math.PI) * fineness / 2 / Math.PI);
	    return [redTable[index], greenTable[index], blueTable[index]];
	};

	this.assign = function(z, data, offset) {
	    var index = Math.floor((Math.atan2(z.y,z.x) + Math.PI) * fineness / 2 / Math.PI);
	    data[offset]   = redTable[index];
	    data[offset+1] = greenTable[index];
	    data[offset+2] = blueTable[index];
	    data[offset+3] = 255;
	};
    },
};

phaseColorTable = new PhaseColorTable(function(z) {
    var theta = (Math.atan2(z.y,z.x) + Math.PI) % (2 * Math.PI);
    var Hp = (theta / (2 * Math.PI)) * 6;
    var X = Math.abs(Math.round((1 - Math.abs(Hp % 2 - 1)) * 255));
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
});


function ModulusColorTable(f) {
    this.lookup = f;
    //this.cache();
};

ModulusColorTable.prototype = {
    cache: function() {
	console.log('caching modulus color table...');

	var fineness = 100000;
	var redTable = new Array(fineness);
	var greenTable = new Array(fineness);
	var blueTable = new Array(fineness);

	for( var i=0; i<fineness; i++ ) {
	    var modulus = Math.tan((i * Math.PI)/fineness - (Math.PI/2));
	    var color = this.lookup(modulus,0);
	    redTable[i] = Math.floor(color[0]);
	    greenTable[i] = Math.floor(color[1]);
	    blueTable[i] = Math.floor(color[2]);
	}

	this.lookup = function(z) {
	    var scaled = 0.5 + Math.atan(Math.sqrt( z.x*z.x + z.y*z.y )) / (Math.PI);
	    var index = Math.floor(scaled * fineness);
	    return [redTable[index], greenTable[index], blueTable[index]];
	};
    },
};

modulusColorTable = new ModulusColorTable(function(z) {
    var line_spacing = 25.0;
    var modulus = Math.sqrt(  z.x*z.x + z.y*z.y );
    // triangle wave
    var brightness = (2/line_spacing)*Math.abs(((modulus + line_spacing/2.0) % line_spacing) - line_spacing/2.0);
    brightness = 1.0 - brightness * brightness * brightness * brightness;

    brightness = brightness * Math.exp(-modulus/1000.0);

    brightness = Math.floor(brightness * 255);
    return [brightness, brightness, brightness];
});

infinityColorTable = new ColorTable(function(z) {
    var modulus = Math.sqrt(  z.x*z.x + z.y*z.y );
    brightness = 1.0 - Math.exp(-modulus/1000.0);
    brightness = Math.floor(brightness * 255);
    return [brightness, brightness, brightness];
});

gridColorTable = new ColorTable(function(z) {
    var scale = 0.1;
    var real = z.x;
    var imag = z.y;
    real *= scale;
    imag *= scale;
    real = real - Math.floor(real);
    imag = imag - Math.floor(imag);
    var cutoff = 0.05;
    if ((real < cutoff) || (real > (1.0 - cutoff)) || (imag < cutoff) || (imag > (1.0 - cutoff)))
	return [0,0,0];
    else
	return [255,255,255];
});

function MultipliedColorTable(table1,table2) {
    this.lookup = function(z) {
	var color1 = table1.lookup(z);
	var color2 = table2.lookup(z);
	return [color1[0] * color2[0] / 255, 
		color1[1] * color2[1] / 255, 
		color1[2] * color2[2] / 255];
    };
};

function AddedColorTable(table1,table2) {
    this.lookup = function(z) {
	var color1 = table1.lookup(z);
	var color2 = table2.lookup(z);
	return [color1[0] + color2[0], 
		color1[1] + color2[1], 
		color1[2] + color2[2]];
    };
};

bestColorTable = new AddedColorTable(
//    new MultipliedColorTable(modulusColorTable,phaseColorTable),
    phaseColorTable,
    infinityColorTable);

