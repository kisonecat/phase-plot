$(function() {
    // the current mouse position, unfortunately as a global
    mouse = [0,4];

    var canvas = document.getElementById("canvas");

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

    var colorTable = bestColorTable;

    ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0,0,300, 300);

    makeFrame = function() {
        var data = imageData.data;
        var offset = 0;
        for (var m = 0; m < 300; m++) {
            for (var n = 0; n < 300; n++) {
                var x = pixToReal(n + 0.5)
                var y = pixToImag(m + 0.5)
                var w = f(x,y)
		color = colorTable.lookup(w[0], w[1]);

                data[offset++] = color[0]
		data[offset++] = color[1]
		data[offset++] = color[2]
                data[offset++] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    var canvasOffsetX = $(canvas).offset().left;
    var canvasOffsetY = $(canvas).offset().top;
    function onMouseMove(evt) {
        mouse = [pixToReal(evt.pageX - canvasOffsetX), pixToImag(evt.pageY - canvasOffsetY)];
        window.setTimeout(makeFrame,0);
    }

    $(document).mousemove(onMouseMove);

    $('.function').bind("keyup input paste", function() {
	f = calculator.parse($('.function').val());
        window.setTimeout(makeFrame,0);
    });

    f = calculator.parse($('.function').val());
    window.setTimeout(makeFrame,0);

});
