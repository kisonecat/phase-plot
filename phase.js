$(function() {

    $('div.complex_plot').each(function(i, obj) {
	var height = $(obj).height();
	var width =  $(obj).width();

	var canvas = $('<canvas width="' + width + '" height="' + height + '"/>')[0];

	var function_text = $(obj).text();

	$(obj).empty();	
	$(obj).append(canvas);

	console.log(canvas);

	obj.plot = canvas;

	canvas.f = calculator.parse(function_text);

	canvas.viewport_pixels = new Rectangle(0,0,
					       canvas.width, canvas.height);
	canvas.viewport_plane = new Rectangle(-10, -10, 10, 10);

	canvas.pixels_to_plane = canvas.viewport_pixels.affine_transform( canvas.viewport_plane );
	canvas.pixels_to_plane_inplace = canvas.viewport_pixels.affine_transform_inplace( canvas.viewport_plane );

	canvas.colorTable = phaseColorTable;

	canvas.update_viewport = function() {
	    canvas.pixels_to_plane = canvas.viewport_pixels.affine_transform( canvas.viewport_plane );
	    canvas.pixels_to_plane_inplace = canvas.viewport_pixels.affine_transform_inplace( canvas.viewport_plane );
	};

	canvas.mouse = new Point(0,0);
	
	var ctx = canvas.getContext("2d");
	canvas.imageData = ctx.getImageData(0,0,
					 canvas.width, canvas.height);
	canvas.update = function() {
	    var data = canvas.imageData.data;

	    var pixel_point = new Point(0.5, 0.5);
	    var plane_point = new Point(0, 0);
	    var value = new Point(0,0);
	    var offset = 0;
	    var width = canvas.width;

            for (var m = 0; m < canvas.height; m++) {
		for (var n = 0; n < width; n++) {
		    canvas.pixels_to_plane_inplace( pixel_point, plane_point );
                    canvas.f(plane_point, canvas.mouse, value);

		    color = canvas.colorTable.lookup( value );
		    data[offset++] = color[0];
		    data[offset++] = color[1];
		    data[offset++] = color[2];
		    data[offset++] = 255;

		    pixel_point.x++;
		}
		pixel_point.y++;
		pixel_point.x = 0.5;
            }
            ctx.putImageData(canvas.imageData, 0, 0);
	};

        canvas.update();
	
	canvas.mouse_pixels = new Point(0,0);

	canvas.depends_on_mouse = function() {
	    return (canvas.f.toString().match( 'w.x' ) || canvas.f.toString().match( 'w.y' ));
	};

	$(canvas).mousemove(function(event) {
	    event.preventDefault();

	    canvas.mouse_pixels.x = event.pageX - $(canvas).offset().left;
	    canvas.mouse_pixels.y = event.pageY - $(canvas).offset().top;

	    canvas.mouse = canvas.pixels_to_plane(canvas.mouse_pixels);

	    if (canvas.is_panning) {
		var old_mouse = canvas.viewport_pixels.affine_transform( canvas.old_viewport_plane )( canvas.mouse_pixels );
		canvas.viewport_plane = canvas.old_viewport_plane.translate( canvas.panning_start_position.subtract( old_mouse ) );
		canvas.update_viewport();
	    }

	    if (canvas.is_panning || canvas.depends_on_mouse())
		window.setTimeout(canvas.update,0);
	});
	
	$(canvas).mousedown(function(event) {
	    event.preventDefault();

	    var x = event.pageX - $(canvas).offset().left;
	    var y = event.pageY - $(canvas).offset().top;
	    
	    canvas.panning_start_position = canvas.pixels_to_plane(new Point(x,y));
	    canvas.old_viewport_plane = canvas.viewport_plane;
	    canvas.is_panning = true;
	});
	
	$(document).mouseup(function(event) {
	    canvas.is_panning = false;
	});
	
	$(canvas).mousewheel( function(event, delta, deltaX, deltaY) {
	    event.preventDefault();

	    canvas.viewport_plane = canvas.viewport_plane.scale( Math.pow(0.8,delta) );
	    canvas.update_viewport();
            window.setTimeout(canvas.update,0);
	});


    });

});
