import _ from "..\\utils\\lodash.js";
import { shapeTemplates_obj as shapeTemplates } from ".\\shapeTemplates.js";
import { self as dom } from "..\\utils\\dom.js";
import { rgb2str } from ".\\common.js";
var ID = 0;

/**
 * Tetromino constructor Inputs : args - dictionary containing property
 * name/value pairs for this object Outputs : none (well the object...)
 */
function Tetromino ( args ) {
    this.ID = ++ID;
    // set the default values
    this.board    = null;
    this.x        = 0;
    this.y        = 0;
    this.color    = [255, 255, 255];
    this.name     = "?";
    this.isGhost  = false;
    this.versions = [[]];
    this.version  = 0;
    this.locker   = null;
    this.width    = 0;
    this.minX     = 0;
    this.maxX     = 0;
    this.minY     = 0;
    this.maxY     = 0;
    
    // If there is a name, but no color or pattern given, use the standard.
    if ( args.name in shapeTemplates ) {
        args = _.extend(_.cloneDeep(shapeTemplates[args.name]), args);
    }

    // convert the input pattern to a an array of arrays of booleans for
    // each
    // possible rotation.
    // don't want to store the pattern so delete it.
    if ( args.pattern ) {
        this.versions = _patt2Versions(args.pattern);
        delete args.pattern;
    }

    this.width = this.versions[this.version][0].length;
    
    // just copy everything else from the input into the object as a
    // property.
    _.extend(this, args);
    this.calcBounds();
}

/*
 * local function _patt2Versions take a pattern (array of strings) and makes
 * the possible versions (rotations). These are stored in the versions
 * array. They are arrays of arrays of booleans. Shapes need to be squares
 * for the auto creation of versions.
 * 
 * inputs : ipatt - an array of strings showing what the initial version of
 * the shape is outputs : an array of all versions of the shape.
 */
function _patt2Versions  ( ipatt ) {
    var arr = [_patt2grid( ipatt )];
    for (var i=1; i<4; i++) {
        arr[i] = _makeRotatedGrid(arr[i-1]);
    }
    return arr;		
}

/*
 * take a pattern (array of strings) and convert to a grid. a grid is an
 * array of arrays of booleans. spaces create an empty cell, anything is a
 * filled cell.
 */
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

/*
 * makes a new pattern that is rotated counter clockwise This assumes that
 * it's a square...
 */
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

// // This is how I was rotating on the fly
// var L = this.grid.length;
// var l = L-1;
// for (var r=0; r<Math.floor(L/2); r++) {
// for (var c=r; c<l-r; c++) {
// // the rotate is a bunch of circular swaps between 4 cells.
// // do a circle flat o reduce the amount of stuff that needs to be held.
// var keep = this.grid[ r][ c];
// this.grid[ r][ c] = this.grid[ c][l-r];
// this.grid[ c][l-r] = this.grid[l-r][l-c];
// this.grid[l-r][l-c] = this.grid[l-c][ r];
// this.grid[l-c][ r] = keep;
// }
// }

// for less typing...
var thisP = Tetromino.prototype;

// return the current grid of the current version.
thisP.getGrid = function ( inVersion ) {
    return this.versions[inVersion == null ? this.version : inVersion];
};

// returns the current board and coordinates of this shape
thisP.getPlacement = function () {
    return { version : this.version, x : this.x, y : this.y };
};

/*
 * take the grid and rotate counter clockwise (left from the top POV..) This
 * assumes that all shapes are based on a square.
 */
thisP.rotateLeft = function () {
    var ovr = {
            x : 0,
            y : 0,
            version : ( this.version === this.versions.length - 1 ) ? 0 : this.version + 1
    };
   
    // can maybe need to "kick" the shape as much as the number of empty spaces on the left.
    // if that doesn't work, try kicking down one, then up one as well.
    // if none of those work, don't rotate.
    var xkicks = _.range(this.minX+1);
    xkicks = _.uniq(xkicks.concat(_.range(this.width-this.maxX).map(
            function (v) { return -1 * v; }
    ))).sort(function (a,b) { return Math.abs(a) - Math.abs(b); });
    var ykicks = [0,1,-1];
    for (var xi=0; xi<xkicks.length; xi++) {
        ovr.x = xkicks[xi];
        for (var yi=0; yi<ykicks.length; yi++) {
            ovr.y = ykicks[yi];
            if ( !this.conflictsWithBoard(ovr) ) {
                this.clear();
                this.version = ovr.version;
                this.x += ovr.x;
                this.y += ovr.y;
                this.draw();
                this.calcBounds();
                return;
            }
        }
    }
};

/*
 * take the grid and rotate counter clockwise (left from the top POV..) This
 * assumes that all shapes are based on a square.
 */
thisP.rotateRight = function () {
    var ovr = {
            x : 0,
            y : 0,
            version : ( this.version === 0 ) ? 3 : this.version - 1
    };
   
    // can maybe need to "kick" the shape as much as the number of empty spaces on the left.
    // if that doesn't work, try kicking down one, then up one as well.
    // if none of those work, don't rotate.
    var xkicks = _.range(this.minX+1);
    xkicks = _.uniq(xkicks.concat(_.range(this.width-this.maxX).map(
            function (v) { return -1 * v; }
    ))).sort(function (a,b) { return Math.abs(a) - Math.abs(b); });
    var ykicks = [0,1,-1];
    for (var xi=0; xi<xkicks.length; xi++) {
        ovr.x = xkicks[xi];
        for (var yi=0; yi<ykicks.length; yi++) {
            ovr.y = ykicks[yi];
            if ( !this.conflictsWithBoard(ovr) ) {
                this.clear();
                this.version = ovr.version;
                this.x += ovr.x;
                this.y += ovr.y;
                this.draw();
                this.calcBounds();
                return;
            }
        }
    }
};

thisP.moveDown = function () {
    if ( this.conflictsWithBoard( { y:1 }) ) {
        return;
    }

    this.clear();
    this.y++;
    this.draw();
};

thisP.moveLeft = function () {
    if ( this.conflictsWithBoard( { x:-1 }) ) {
        return;
    }
    this.clear();
    this.x--;
    this.draw();
};

thisP.moveRight = function () {
    if ( this.conflictsWithBoard( { x:1 }) ) {
        return;
    }
    this.clear();
    this.x++;
    this.draw();
};

// calculates and stores the local X of the left most and right most
// occupied cell.
thisP.calcBounds = function () {
    var grid = this.getGrid();
    this.minX = grid[0].length;
    this.maxX = 0;
    this.minY = grid.length;
    this.maxY = 0;
    for (var r=0; r<grid.length; r++) {
        for (var c=0; c<grid[r].length; c++) {
            if ( grid[r][c] ) {
                if ( c < this.minX ) { this.minX = c; }
                if ( c > this.maxX ) { this.maxX = c; }
                if ( r < this.minY ) { this.minY = r; }
                if ( r > this.maxY ) { this.maxY = r; }
            }
        }
    }
};

/*
 * Check that none of the occupied cells in the shape intersect with an
 * occupied cell in the board.
 * The optional override lets you check what would happen on a move/rotate
 */
thisP.conflictsWithBoard = function ( ovr ) {

    ovr       = _.extend({ x:0, y:0 }, ovr);
    var grid  = this.getGrid( ovr.version );
    var cells = [];
    for (var r=0; r<grid.length; r++) {
        var y = r + this.y + ovr.y;
        for (var c=0; c<grid[r].length; c++) {
            var x = c + this.x + ovr.x;
            if ( x>=0 && grid[r][c] && this.board.grid[y][x].locked ) {
                return true;
            }
        }
    }
    return false;
};

/*
 * If moving down one causes a conflict with the board initiate a lock.
 * The board has a lockDelay property.
 * The player has this amount of time to make another move before the lock happens.
 * The new move resets the lock.
 */
thisP.startLock = function () {

    if ( !this.conflictsWithBoard( {y:1}) ) {
        return false;
    }
    
    this.locker = setTimeout(
            function () {
                this.board.lockShape();
            },
            this.board.lockDelay
    );
};

/*
 * sets the background color of all board cells corresponding to this shapes
 * placement. set to the shapes color if the cell is occupied otherwise use
 * the boards color (clear)
 */
thisP.draw = function ( color, border ) {

    // don't do anything if this is not placed
    if ( !this.board ) {
        return
    }

    // use the inputted color, or the shapes color.
    // if this is a ghost the color is that of the board, but keep the border.
    color  = color  || this.isGhost ? this.board.color : this.color;
    border = border || this.border;

    // instead of having this.versions[this.version] everywhere...
    var grid = this.getGrid();
    for (var r=0; r<grid.length; r++) {

        // the row wrt to the board
        var y = r+this.y;
        
        for (var c=0; c<grid[r].length; c++) {

            // the column wrt to the board
            var x = c+this.x;
            /*
             * shapes can be placed so that parts are outside the board.
             * this is because the shape doesn't necessarily go to the edge
             * of it's bounding box. don't need to do anything with
             */ 
            if ( x >= 0 && x < this.board.grid[0].length
                    && y >= 0 && y < this.board.grid.length
                    && this.board.grid[y][x].dom
                    && !this.board.grid[y][x].locked
            ) {
                
                if ( grid[r][c] ) {
                    this.board.grid[y][x].dom.style.backgroundColor = rgb2str(color);
                    this.board.grid[y][x].dom.style.borderColor     = rgb2str(border);
                }
            }
        }
    }
};

thisP.clear = function () {
    this.draw(this.board.color, this.board.color);
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

var exported_Tetromino = Tetromino;
export { exported_Tetromino as Tetromino };

