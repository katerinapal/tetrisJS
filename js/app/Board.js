/*
 * The base class for the whole game
 */
define(["lodash", "dom", "app/Tetromino"], function ( _, dom, Tetromino ) {
	
	function Board ( args ) {
		this.shape = null;
		// set the default values
		args = _.extend({
					color   : "black",
					height  : 20,
					width   : 10,
					topPad  :  2, // extra lines on the top that aren't displayed
					squareSize : '10px',
				},
				args
		);

		// most arguments simply get copied onto the object.
		// grid is the excpetion, store it separately and delete from args.
		var inpatt = args.pattern;
		delete args.pattern;
		
		_.extend(this, args);

		// make the grid, either from by munging args.grid or making one from
		// the height, width and topPad.
		inpatt ? this._parsePattern(inpatt) : this._makeGrid();
	}

	var thisP = Board.prototype;

	var defaultCell = {
						dom     : null,
						color   : "none",
						canHold : true,
						hasItem : false
					};

	thisP._makeDefaultTD = function ( ) {
		var cell = dom.create("TD");
		cell.style.borderCollapse  = "collapse";
		cell.style.cellPadding     = 0;
		cell.style.cellSpacing     = 0;
		cell.style.border          = 0;
		cell.style.width           = this.squareSize;
		cell.style.height          = this.squareSize;	
		cell.style.backgroundColor = this.color;
		return cell;
	};

	/*
	 * This takes a grid that is just an array of arrays of strings
	 * " " - blank
	 * "-" - grid that isn't in the DOM table
	 * "+" - is a filled cell, use white
	 * anyother string, assume that it's a color and set that to the background
	 */
	thisP._parsePattern = function ( inpatt ) {

		var tbody   = dom.create("TBODY");
		this.table  = dom.create("TABLE", null, tbody);
		this.height = inpatt.length;
		this.width  = inpatt[0].length; //hopefully all lines are the same length.
		this.grid   = [];

		for (var r=0; r<inpatt.length; r++) {
			this.grid[r] = [];

			var trow = dom.create("TR");
			
			for (var c=0; c<inpatt[r].length; c++) {

				this.grid[r][c] = _.clone(defaultCell);
				
				// a "-" means that this cell can't get a cell frozen in it
				// these don't need a TD.
				if ( inpatt[r].charAt(c) === "-" ) {
					this.grid[r][c].canHold = false;
					this.topPad = r+1;
					continue;
				}

				var cell = this._makeDefaultTD();
				this.grid[r][c].dom = cell;
				trow.appendChild(cell);
				
				// a " " means that this is an empty cell
				if ( inpatt[r].charAt(c) === " " ) {
					continue;
				}

				// a "#" means that this is a filled cell
				// use white/black as the color (not the table BG)
				if ( inpatt[r].charAt(c) === "#" ) {
					this.grid[r][c].hasItem = true;
					cell.style.backgroundColor = this.color === "white" ? "black" : "white";					
					continue;
				}

				// if it's a single character and that is a valid Tetromino name.
				// place that shape at that coordinate.
				this.shape = new Tetromino({ name : inpatt[r].charAt(c), board:this, x:c, y:r });
			}

			// if there are cells in the row, add the row to the table.
			if ( trow.childNodes.length ) {
				tbody.appendChild(trow);
			}

		}

		// if there was a shape added, draw it.
		if ( this.shape ) {
			this.shape.draw();
		}
	};

	// make an empty grid.
	thisP._makeGrid = function ( ) {
		var tbody   = dom.create("tbody");
		this.table  = dom.create("TABLE", null, tbody);
		this.grid   = [];
		// first the hidden rows
		for (var r=0; r<this.topPad; r++) {
			var row = [];
			this.grid.push(row);
			for (var c=0; c<this.width; c++) {
				row[c] = _.clone(defaultCell);
				row[c].canHold = false;
			}
		}

		// then the main part of the board
		for (var r=0; r<this.height; r++) {
			var row = [];
			this.grid.push(row);
			var trow = dom.create("TR");
			tbody.appendChild(trow);
			for (var c=0; c<this.width; c++) {
				row[c] = _.clone(defaultCell);
				row[c].dom = this._makeDefaultTD();
				trow.appendChild(row[c].dom);
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
				str += this.grid[i][j] === null ? "-" : this.grid[i][j];
			}
			str += "\n";
		}		
		return str;
	};
	
	return Board;
});

