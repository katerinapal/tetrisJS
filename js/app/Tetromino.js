/**
 * Base class for the Tetromino (official(?) name for the shapes.
 * properties:
 *   board - the board in which this shape is placed.
 *   x     - the x coordinate at which the shape is placed (upper right)
 *   y     - the y coordinate at which the shape is placed (upper right)
 *   color - the color of this shape
 *   ghost - boolean defining whether or not this is a ghost shape
 *   versions - array of all the possible rotations of this shape
 *   version  - index pointing to one rotation
 * methods:
 *   rotateLeft  - rotate counter clockwise
 *   rotateRight - rotate clockwise
 *   getGrid     - return the current grid
 *   clear       - clear all of the board cell at the coordinate
 *   draw        - set the BG color of the board cell for set shape cells
 * ghost shapes show where the piece would fall, these are displayed specially.
 */

define(["lodash", "dom"], function (_, dom) {
	
	function Tetromino ( args ) {
		// set the default values
		this.board = null;
		this.x     = 0;
		this.y     = 0;
		this.color = "white";
		this.name  = "?";
		this.ghost = false;
		this.versions = [[]];
		this.version  = 0;
		
		// then set some values based on the name (assuming it's a standard name).
		args = _.extend( args.name in standardShapes ? standardShapes[args.name] : {}, args);

		// finally use the shape that is passed in.
		// create 4 versions of that...
		if ( args.pattern ) {
			this.versions = _patt2Versions(args.pattern);
			delete args.pattern;
		}

		_.extend(this, args);
		this._calcMinMaxX();
	}
	
	// take a pattern and make an array of the 4 different rotated versions.
	function _patt2Versions  ( ipatt ) {
		var arr = [_patt2grid( ipatt )];
		for (var i=1; i<4; i++) {
			arr[i] = _makeRotatedGrid(arr[i-1]);
		}
		return arr;		
	}

	// take a pattern (array of strings) and convert to a grid.
	// a grid is an array of arrays of booleans
	function _patt2grid ( ipatt ) {
		var grid = [];
		for (var r=0; r<ipatt.length; r++) {
			grid[r] = [];
			for (var c=0; c<ipatt[r].length; c++) {
				grid[r][c] = ipatt[r].charAt(c) === " " ? false : true;
			}
		}
		return grid;
	}

	// makes a new pattern that is rotated counter clockwise
	// This assumes that it's a square...
	function _makeRotatedGrid ( igrid ) {
		var L     = igrid.length;
		var ogrid = [];
		for (var r=0; r<L; r++) {
			ogrid[r] = [];
			for (var c=0; c<igrid[r].length; c++) {
				ogrid[r][c] = igrid[c][L-r-1];
			}
		}
		return ogrid;
	}

	/* This is how I was rotating on the fly
		var L = this.grid.length;
		var l = L-1;
		for (var r=0; r<Math.floor(L/2); r++) {
			for (var c=r; c<l-r; c++) {
				// the rotate is a bunch of circular swaps between 4 cells.
				// do a circle flat o reduce the amount of stuff that needs to be held.
				var keep            = this.grid[  r][  c];
			    this.grid[  r][  c] = this.grid[  c][l-r];
			    this.grid[  c][l-r] = this.grid[l-r][l-c];
			    this.grid[l-r][l-c] = this.grid[l-c][  r];
			    this.grid[l-c][  r] = keep;
			}
		}
		*/

	// for less typing...
	var thisP = Tetromino.prototype;

	// Defining the color and shape for the standard Tetrominos
	var standardShapes = {
			I : {
					color     : 'cyan',
					pattern   : [
					             "    ",
					             "####",
					             "    ",
					             "    "
					             ]
			},
			O : {
					color     : 'yellow',
					pattern   : [
					             "##",
					             "##"
					             ]
			},
			T : {
					color     : 'fuchsia',
					pattern   : [
					             " # ",
					             "###",
					             "   "
					             ]
			},
			S : {
					color     : 'chartreuse',
					pattern   : [
					             " ##",
					             "## ",
					             "   "
					             ]
			},
			Z : {
					color     : 'red',
					pattern   : [
					             "## ",
					             " ##",
					             "   "
					             ]
			},
			J : {
					color     : 'blue',
					pattern   : [
					             "#  ",
					             "###",
					             "   "
					             ]
			},
			L : {
					color : 'orange',
					pattern   : [
					             "  #",
					             "###",
					             "   "
					             ]
			},
	};
	thisP.standardShapeNames = _.keys(standardShapes);
	thisP.hasStandardShape = function ( name ) {
		return ( name in standardShapes );
	};
	thisP.getStandardShape = function ( name ) {
		if ( name in standardShapes ) {
			return standardShapes[name];
		}
		return {};
	};
	
	// return the current grid
	thisP.getGrid = function () {
		return this.versions[this.version];
	};

	/*
	 * take the grid and rotate counter clockwise (left from the top POV..)
	 * This assumes that all shapes are based on a square.
	 */
	thisP.rotateLeft = function () {
		this.clear();
		this.version = ( this.version === this.versions.length - 1 ) ? 0 : this.version + 1;
		this.draw();
		this._calcMinMaxX();
	};

	/*
	 * take the grid and rotate clockwise (right from the top POV..)
	 * This assumes that all shapes are based on a square.
	 */
	thisP.rotateRight = function() {
		this.version = ( this.version === 0 ) ? 3 : this.version - 1;
		this._calcMinMaxX();
	};

	// keep track of the left most and right most columns with an occupied cell
	// local version of the coordinates.
	thisP._calcMinMaxX = function () {
		var grid = this.getGrid();
		this.minX = grid.length;
		this.maxX = 0;
		for (var r=0; r<grid.length; r++) {
			for (var c=0; c<grid[r].length; c++) {
				if ( grid[r][c] ) {
					if ( c < this.minX ) { this.minX = c; }
					if ( c > this.maxX ) { this.maxX = c; }
				}
			}
		}
	};

	thisP._setColor = function ( color ) {
		if ( !this.board ) {
			return
		}
		var grid = this.getGrid();
		for (var r=0; r<grid.length; r++) {
			var y = r+this.y;
			for (var c=0; c<grid[r].length; c++) {
				if ( !grid[r][c] ) {
					continue;
				}
				var x = c+this.x;
				if ( x >= 0 && x < this.board.width && y >= 0 && y < this.board.height && this.board.grid[y][x].dom ) {
					this.board.grid[y][x].dom.style.backgroundColor = color;
				}
			}
		}
	};
	
	thisP.clear = function () { return this._setColor(this.board.color); };
	thisP.draw  = function () { return this._setColor(this.color); };

	// see if we've gone off to the left.
	thisP.offTheLeft = function () {
		var err = -1*(this.x + this.minX);
		if ( err > 0 ) {
			return err;
		}
		return 0;
	};

	// see if we've gone off to the right.
	thisP.offTheRight = function () {
		var err = this.x + this.maxX - (this.board.width - 1);
		if ( err > 0 ) {
			return err;
		}
		return 0;
	};

	/*
	 * Check that none of the occupied cells in the shape intersect with an occupied cell in the board.
	 */
	thisP.checkOverlap = function () {
		var grid = this.getGrid();
		for (var r=0; r<grid.length; r++) {
			var y = r + this.y;
			for (var c=0; c<grid[r].length; c++) {
				var x = c + this.x;
				if ( grid[r][c] && this.board.grid[y][x] ) {
					return true;
				}
			}
		}
		return false;
	};

	/*
	 * toString simply shows the grid.
	 */
	thisP.toString = function ( args ) {
		args = _.extend({ indent : '' }, args);
		var grid = this.getGrid();
		var str  = "\n";
		for (var r=0; r<grid.length; r++ ) {
			str += args.indent;
			for (var c=0; c<grid[r].length; c++) {
				str += grid[r][c] ? "#" : ".";
			}
			str += "\n";
		}		
		return str;
	};

	return Tetromino;
});

