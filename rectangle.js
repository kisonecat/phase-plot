
function Point(x,y) {
    this.x = x;
    this.y = y;
};

Point.prototype = {
    add: function(other) {
	return new Point(this.x + other.x, this.y + other.y);
    },

    subtract: function(other) {
	return new Point(this.x - other.x, this.y - other.y);
    },
};

function Rectangle(left,top,right,bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
};

Rectangle.prototype = {
    x: function() {
	return this.left;
    },
    y: function() {
	return this.top;
    },
    width: function() {
	return this.right - this.left;
    },
    height: function() {
	return this.bottom - this.top;
    },

    center: function() {
	return new Point( this.left + 0.5 * this.width(),
			  this.top  + 0.5 * this.height() );
    },

    top_left_corner: function() {
	return new Point(this.left, this.top);
    },

    bottom_left_corner: function() {
	return new Point(this.left, this.bottom);
    },

    top_right_corner: function() {
	return new Point(this.right, this.top);
    },

    bottom_right_corner: function() {
	return new Point(this.right, this.bottom);
    },

    affine_transform: function(other) {
	var scale_x = other.width() / this.width();
	var scale_y = other.height() / this.height();
	var offset_x = other.x() - this.x() * scale_x;
	var offset_y = other.y() - this.y() * scale_y;

	return function(point) {
	    return new Point(point.x * scale_x + offset_x,
			     point.y * scale_y + offset_y);
	};
    },

    affine_transform_inplace: function(other) {
	var scale_x = other.width() / this.width();
	var scale_y = other.height() / this.height();
	var offset_x = other.x() - this.x() * scale_x;
	var offset_y = other.y() - this.y() * scale_y;

	return function(point, result) {
	    result.x = point.x * scale_x + offset_x;
	    result.y = point.y * scale_y + offset_y;
	};
    },

    // scale a rectangle from its center
    scale: function(factor) {
	var extra_width = this.width() * (factor - 1.0);
	var extra_height = this.height() * (factor - 1.0);

	return new Rectangle( this.left   - 0.5 * extra_width,
			      this.top    - 0.5 * extra_height,
			      this.right  + 0.5 * extra_width,
			      this.bottom + 0.5 * extra_height );
    },

    // translate a rectangle
    translate: function(point) {
	return new Rectangle( this.left + point.x,
			      this.top  + point.y,
			      this.right + point.x,
			      this.bottom + point.y );
    },
};

