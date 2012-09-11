$(function() {
    // the current mouse position, unfortunately as a global
    mouse = new Point(0,0);

    var canvas = document.getElementById("canvas");

    var viewport_width = $(canvas).width();
    var viewport_height = $(canvas).height();

    var viewport_pixels = new Rectangle(0,0,viewport_width,viewport_height);
    var viewport_plane = new Rectangle(-10, -10, 10, 10);

    var pixels_to_plane = viewport_pixels.affine_transform( viewport_plane );
    var pixels_to_plane_inplace = viewport_pixels.affine_transform_inplace( viewport_plane );

    var colorTable = phaseColorTable; //new MultipliedColorTable(phaseColorTable,gridColorTable);

    ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0,0,viewport_width, viewport_height);

    var f;

    makeFrame = function() {
	var data = imageData.data;
	var pixel_point = new Point(0.5, 0.5);
	var plane_point = new Point(0, 0);
	var value = new Point(0,0);
	var offset = 0;
	var index;

	var fineness = 1000;
	var redTable = phaseColorTable.redTable;
	var greenTable = phaseColorTable.greenTable;
	var blueTable = phaseColorTable.blueTable;

        for (var m = 0; m < viewport_height; m++) {
            for (var n = 0; n < viewport_width; n++) {
		pixels_to_plane_inplace( pixel_point, plane_point );
                f(plane_point, value);

		/*
		color = colorTable.assign(value, data, offset);
		offset += 4;
		*/

		index = Math.floor((Math.atan2(value.y,value.x) + Math.PI) * fineness / 2 / Math.PI);
		data[offset++] = redTable[index];
		data[offset++] = greenTable[index];
		data[offset++] = blueTable[index];
		data[offset++] = 255;

		pixel_point.x++;
            }
	    pixel_point.y++;
	    pixel_point.x = 0.5;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    mouseDown = new Point(0,0);
    mouseDragging = false;
    var old_viewport_plane = viewport_plane;
    
    var canvasOffsetX = $(canvas).offset().left;
    var canvasOffsetY = $(canvas).offset().top;

    var mouse_point = new Point(0,0);

    $(canvas).mousemove(function(evt) {
	mouse_point.x = evt.pageX - canvasOffsetX;
	mouse_point.y = evt.pageY - canvasOffsetY;

	pixels_to_plane_inplace(mouse_point, mouse);

	if (mouseDragging) {
	    var old_mouse = viewport_pixels.affine_transform( old_viewport_plane )( mouse_point );
	    viewport_plane = old_viewport_plane.translate( mouseDown.subtract( old_mouse ) );
	    pixels_to_plane = viewport_pixels.affine_transform( viewport_plane );
	    pixels_to_plane_inplace = viewport_pixels.affine_transform_inplace( viewport_plane );
	}
	
        window.setTimeout(makeFrame,0);
    });

    $(canvas).mousedown(function(evt) {
	var x = evt.pageX - canvasOffsetX;
	var y = evt.pageY - canvasOffsetY;

	mouseDown = pixels_to_plane(new Point(x,y));
	old_viewport_plane = viewport_plane;

	mouseDragging = true;
    });

    $(document).mouseup(function(evt) {
	mouseDragging = false;
    });
    
    $(canvas).mousewheel( function(event, delta, deltaX, deltaY) {
	viewport_plane = viewport_plane.scale( Math.pow(0.8,delta) );
	pixels_to_plane = viewport_pixels.affine_transform( viewport_plane );
	pixels_to_plane_inplace = viewport_pixels.affine_transform_inplace( viewport_plane );
        window.setTimeout(makeFrame,0);
	return false;
    });

    $('.function_form').submit(function() {
	f = calculator.parse($('.function').val());
        window.setTimeout(makeFrame,0);
	return false;
    });

    f = calculator.parse($('.function').val());
    window.setTimeout(makeFrame,0);

});
