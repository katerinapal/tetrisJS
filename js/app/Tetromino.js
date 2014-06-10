/**
 * Base class for the Tetromino (official(?) name for the shapes.
 * properties:
 *   table - the table in which this shape is placed.
 *   x     - the x coordinate at which the shape is placed (upper right)
 *   y     - the y coordinate at which the shape is placed (upper right)
 *   color - the color of this shape
 *   ghost - boolean defining whether or not this is a ghost shape
 *   grid  - a square holding the pattern of the shape
 * methods:
 *   rotateLeft  - rotate counter clockwise
 *   rotateRight - rotate clockwise
 *   
 * ghost shapes show where the piece would fall, these are displayed specially.
 */

define(["lodash", "dom"], function (_, dom) {
	function Tetromino ( args ) {
		// set the default values
		this.table = null;
		this.x     = 0;
		this.y     = 0;
		this.color = "white";
		this.name  = "?";
		this.ghost = false;
		this.grid  = [];
		
		// then set some values based on the name (assuming it's a standard name).
		// but first convert the pattern to a 
		var def = _defByName(args.name);
		_.extend(this, def);
		
		// finally use whatever is passed in;
		_.extend(this, args);
	}

	/*
	 * Takes the default name (single character) and picks the color and grid.
	 */
	function _defByName ( name ) {
		if ( name == "I" ) {
			return {
				color : 'cyan',
				grid  : [
				         [' ', ' ', ' ', ' '],
				         ['#', '#', '#', '#'],
				         [' ', ' ', ' ', ' '],
				         [' ', ' ', ' ', ' '],
				         ]
			};
		}
		if ( name == "O" ) {
			return {
				color : 'yellow',
				grid  : [
				         [ '#', '#'],
				         [ '#', '#'],
				         ]
			};
		}
		if ( name == "T" ) {
			return {
				color : 'purple',
				grid  : [
				         [' ', '#', ' '],
				         ['#', '#', '#'],
				         [' ', ' ', ' '],
				         ]
			};
		}
		if ( name == "S" ) {
			return {
				color : 'green',
				grid  : [
				         [' ', '#', '#'],
				         ['#', '#', ' '],
				         [' ', ' ', ' '],
				         ]
			};
		}
		if ( name == "Z" ) {
			return {
				color : 'red',
				grid  : [
				         ['#', '#', ' '],
				         [' ', '#', '#'],
				         [' ', ' ', ' '],
				         ]
			};
		}
		if ( name == "J" ) {
			return {
				color : 'blue',
				grid  : [
				        ['#', ' ', ' '],
				        ['#', '#', '#'],
				        [' ', ' ', ' '],
				        ]
			};
		}
		if ( name == "L" ) {
			return {
				color : 'orange',
				grid  : [
				         ['#', ' ', ' '],
				         ['#', '#', '#'],
				         [' ', ' ', ' '],
				        ]
			};
		}
		return {};
	}
	
	// for less typing...
	var thisP = Tetromino.prototype;

	/*
	 * take the grid and rotate counter clockwise (left from the top POV..)
	 * This assumes that all shapes are based on a square.
	 */
	thisP.rotateLeft = function () {
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
	};

	/*
	 * take the grid and rotate clockwise (right from the top POV..)
	 * This assumes that all shapes are based on a square.
	 */
	thisP.rotateRight = function() {
		var L = this.grid.length;
		var l = L-1;
		for (var r=0; r<Math.floor(L/2); r++) {
			for (var c=r; c<l-r; c++) {
				// the rotate is a bunch of circular swaps between 4 cells.
				// do a circle flat o reduce the amount of stuff that needs to be held.
				var keep            = this.grid[  r][  c];
			    this.grid[  r][  c] = this.grid[l-c][  r];
			    this.grid[l-c][  r] = this.grid[l-r][l-c];
			    this.grid[l-r][l-c] = this.grid[  c][l-r];
			    this.grid[  c][l-r] = keep;
			}
		}
	};
	
	/*
	 * toString simply shows the grid.
	 */
	thisP.toString = function ( args ) {
		args = _.extend({ indent : '' }, args);
		var str = '';
		for (var i=0; i<this.grid.length; i++ ) {
			str += args.indent;
			for (var j=0; j<this.grid[i].length; j++) {
				str += this.grid[i][j] == " " ? "." : this.grid[i][j];
			}
			str += "\n";
		}		
		return str;
	};

	return Tetromino;
});

