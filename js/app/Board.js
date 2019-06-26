import { CLEARING } from ".\\TetrisGame.js";
import { PLAYING } from ".\\TetrisGame.js";
import { rgb2str } from ".\\common.js";
import dom from "..\\utils\\dom.js";
import Tetromino from ".\\Tetromino.js";
import shapeTemplates from ".\\shapeTemplates.js";
import _ from "..\\utils\\lodash.js";
/*
 * This creates the board that the game is played on.
 * Boards are also used for the preview views (and later, maybe, the hold)
 * The padTop is an invisible area in which the shapes are spawned.
 * This is just like the main part of the board, except for the visibility.
 * padLeft, padRight, padBottom - these are invisible regions.
 *    Cells in these regions get their 'locked' property set.
 *    This makes it easier to detect if a move or rotate moved off of the board.
 *    Because it doesn't, instead it conflicts with the locked cell in the padding.
 * 
 */

;
// unique ID for each board created, just for debug.
var ID = 0;

/**
 * Constructor
 * pass in overrides for defaults in an object.
 * all properties of this object will be "extended" onto the Tetomino
 */

function Board( args ) {

    this.ID = ++ID;

    // set the default values
    args = _.extend( {
        game       : null,
        color      : [0, 0, 0], //black
        height     : 20,
        width      : 10,
        // extra lines on the top that aren't displayed
        padTop     : 2,
        padBottom  : 1,
        padLeft    : 1,
        padRight   : 1,
        cellSize   : '10px',
        // ms - the amount of time between finding full rows and removing them.
        shiftDelay :  50,
        gravity    : 1,
    }, args );

    // most arguments simply get copied onto the object.
    // grid is the excpetion, store it separately and delete from
    // args.
    var inpatt = args.pattern;
    delete args.pattern;

    _.extend( this, args );
    
    // make the grid, either from by munging args.grid or making one
    // from
    // the height, width and topPad.
    inpatt ? this.parsePattern( inpatt ) : this.makeGrid();

    this.dom.style.cssText = "border-collapse : separate ; border-spacing: 0; ";
}

var defaultCell = {
        dom      : null,
        color    : null,
        border   : null,
        canHold  : true,
        hasShape : false,
        locked   : false
    };

var thisP = Board.prototype;

thisP.makeDefaultTD = function() {
    var cell = dom.create( "TD" );
    cell.style.cellPadding     = 0;
    cell.style.cellSpacing     = 0;
    cell.style.width           = this.cellSize;
    cell.style.height          = this.cellSize;
    cell.style.backgroundColor = rgb2str(this.color);
    cell.style.border          = "1px solid "+rgb2str(this.color);
    return cell;
};

/*
 * This takes a grid that is just an array of arrays of strings " " -
 * blank "-" - grid that isn't in the DOM table "+" - is a filled
 * cell, use white anyother string, assume that it's a color and set
 * that to the background
 */
thisP.parsePattern = function( inpatt ) {
    alert("Doesn't work right now");
};

// Create the array and DOM table representing this board.
thisP.makeGrid = function() {
    
    // set the defaultCell's color to be that of the board.
    defaultCell.color  = _.cloneDeep(this.color);
    defaultCell.border = _.cloneDeep(this.color);
    
    var tbody = dom.create( "TBODY" );
    this.dom  = dom.create( "TABLE", null, tbody );
    this.grid = [];

    // the topPad is the part of the board that isn't visible.
    for ( var r = 0; r < this.padTop; r++ ) {
        var row  = [];
        this.grid.push(row);
        for ( var c = 0; c < this.padLeft; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
        for ( var c = 0; c < this.width; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : true, dom : td }));
        }
        for ( var c = 0; c < this.padRight; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
    }
    
    // then the main part of the board
    for ( var r = 0; r < this.height; r++ ) {
        var row = [];
        this.grid.push(row);
        var trow = dom.create("TR");
        tbody.appendChild(trow);
        for ( var c = 0; c < this.padLeft; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
        for ( var c = 0; c < this.width; c++ ) {
            var td = this.makeDefaultTD();
            trow.appendChild(td);
            row.push(_.extend(_.cloneDeep(defaultCell), { dom : td }));
        }
        for ( var c = 0; c < this.padRight; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
    }
    
    // generally this is th bottom of the board.
    // Faking locked things there to make locking simpler.
    for ( var r = 0; r < this.padBottom; r++ ) {
        var row = [];
        this.grid.push(row);
        for ( var c = 0; c < this.padLeft; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
        for ( var c = 0; c < this.width; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
        for ( var c = 0; c < this.padRight; c++ ) {
            row.push(_.extend(_.cloneDeep(defaultCell), { canHold : false, locked : true }));
        }
    }

};

// take the "numRows" rows after row "start" and remove color and border.
// only visible and padTop cells, ie "canHold" should be done.
thisP.clearRows = function ( start, numRows ) {
    for (var r=start; r<start+numRows; r++) {
        for (var c=0; c<this.grid[r].length; c++) {
            if ( !this.grid[r][c].canHold ) {
                continue;
            }
            _copyCell(
                    { color : this.color, border : this.color, locked : false },
                    this.grid[r][c]
                    );
        }
    }
};

// clears all rows.
thisP.resetGrid = function () {
    this.clearRows(0, this.grid.length);
};

/*
 * This locks a shape to the board.
 * This means board cells are colored and marked as having an item.
 * The locked property is then set, so that later shapes know about it.
 */
thisP.lockShape = function ( shape ) {
    var grid = shape.getGrid();
    for ( var r = 0; r < grid.length; r++ ) {
        var y = r + shape.y;
        for ( var c = 0; c < grid[r].length; c++ ) {
            var x = c + shape.x;

            if ( grid[r][c] ) {
                _copyCell(
                        { color : shape.color, border : shape.border, locked:true },
                        this.grid[y][x]
                        );
            }
        }
    }
};

/*
 * Look at all of the rows and remove any that are full.
 * return the number of rows.
 * First set game.state to CLEARING, the Game will wait for the state
 *   to go back to PLAYING before continuing.
 *   This is so that I could add a timeout so that I can color rows
 *   to be removed gold for 50ms before actually removing.
 *   The coloring was done in findFullRows.
 */
thisP.clearFullRows = function () {
    this.game.state = CLEARING;

    // create a list of all rows to be removed.
    // also color them gold.
    var fullRows = this.findFullRows();
    if ( !fullRows.length ) {
        this.game.state = PLAYING;
        return 0;
    }
    
    // wait a little before shifting down so that we can see the gold rows.
    // but need to make sure that the clear and the state change wait.
    var shiftTO = setTimeout(function ( self ) {
            self.shiftDown(fullRows);
            shiftTO = null;
        },
        50,
        this
    );
    
    // wait until the shiftTO is done before doing this.
    var clearInt = setInterval(function ( self, num ) {
            if ( !shiftTO ) {
                // the top N rows won't be shifted into, put default values in those.
                self.clearRows(0, num);
                clearInterval(clearInt);
                clearInt = null;
                this.game.state = PLAYING;
            }
        },
        1,
        this, fullRows.length
    );
    return fullRows.length;
    
};

/*
 * look at each row.
 * For each cell that "canHold" (ie not in padBottom)
 *   Check if the cell is locked.
 * If there are cells that canHold and no unlocked cells.
 *    Color all the cells gold
 * Return a list of the full rows.
 */
thisP.findFullRows = function () {
    
    var fullRows = [];
    for (var r=0; r<this.grid.length; r++) {
        var full = true;
        var can  = false;
        for (var c=0; c<this.grid[r].length; c++) {
            // a full row is one where all the cells that can hold something.
            // are locked.
            if ( this.grid[r][c].canHold ) {
                can = true;
                if ( !this.grid[r][c].locked ) {
                    full = false;
                    break;
                }
            }
        }

        // rows that can't hold anything can't be full.
        // this is the padBottom rows.
        if ( !can || !full ) {
            continue;
        }

        fullRows.push(r);
        for ( var c=0; c<this.grid[r].length; c++ ) {
            if ( this.grid[r][c].canHold && this.grid[r][c].dom ) {
                // don't bother setting the color, will just remove soon
                this.grid[r][c].dom.style.backgroundColor = rgb2str([255, 215, 0]); // gold
            }
        }
    }
    
    return fullRows;
};

/*
 * Shift the board to account for removed rows.
 * First calculate how much each row should shift down.
 * Then starting at the bottom shift each row.
 * The _copyCell call sets the border and background, if approriate.
 */
thisP.shiftDown = function ( fullRows ) {

    // first figure out how much each row should be shifted down
    var shiftBy = this.calcShiftBy( fullRows );
    
    for (var r=this.grid.length-1; r>=0; r-- ) {
        // don't do anything if this row is shifted down by 0.
        if ( shiftBy[r] === 0 ) {
            continue;
        }

        // clear the 'to' row.
        this.clearRows(r+shiftBy[r], 1);
        for ( var c=0; c<this.grid[r].length; c++) {
            var from = this.grid[r][c];
            var to   = this.grid[r+shiftBy[r]][c];
            if ( to.canHold ) {
                _copyCell(from, to);
            }
        }
    }
    return;
};

// figure out by how much each row needs to shift down.
// this is simply the number of rows below this one that were removed.
thisP.calcShiftBy = function ( fullRows ) {
    var shiftBy = new Array(this.grid.length);
    for ( var r=0; r<this.grid.length; r++ ) {
        shiftBy[r] = 0;
    }
    _.each(fullRows.reverse(), function ( row ) {
        for ( var r=0; r<row; r++ ) {
            shiftBy[r]++;
        }
        shiftBy[row] = 0;
    });
    return shiftBy;
};

/*
 * Copy cell contents from one to the next.
 * if the to cell has a dom, set the color.
 */
function _copyCell ( from, to ) {
    if ( _.has(from, 'locked') ) {
        to.locked  = from.locked;
    }
    
    if ( _.has(from, 'color' ) ) {
        to.color   = _.cloneDeep(from.color);
        to.dom && (to.dom.style.backgroundColor = rgb2str(to.color));
    }

    if ( _.has(from, 'border' ) ) {
        to.border   = _.cloneDeep(from.border);
        to.dom && (to.dom.style.borderColor = rgb2str(to.border));
    }
}

/*
 * toString simply shows the grid.
 */
thisP.toString = function( args ) {
    args = _.extend( {
        indent : ''
    }, args );
    var str = '';
    for ( var i = 0; i < this.grid.length; i++ ) {
        str += args.indent;
        for ( var j = 0; j < this.grid[i].length; j++ ) {
            str += this.grid[i][j] === null ? "-" : this.grid[i][j];
        }
        str += "\n";
    }
    return str;
};

var bindingVariable = Board;
export default bindingVariable;
