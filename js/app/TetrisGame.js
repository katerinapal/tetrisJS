import _ from "..\\utils\\lodash.js";
import { shapeTemplates_obj as shapeTemplates } from ".\\shapeTemplates.js";
import { events_obj as ev } from "..\\utils\\events.js";
import { self as dom } from "..\\utils\\dom.js";
import { Tetromino } from ".\\Tetromino.js";
import { Menu } from ".\\Menu.js";
import { Score } from ".\\Score.js";
import { Board } from ".\\Board.js";
import { rgb2str } from ".\\common.js";
var PAUSED;
var CLEARING;
var PLAYING;
var COUNTING;
var PREGAME;

var NUMPREVIEW = 3;
var MAXSHAPEH  = 4;
var MAXSHAPEW  = 4;
var COUNTFROM  = 1; //FIXME make bigger
// ms - the amount of time before a lock is committed
var LOCKDELAY  = 500;
var DROPSPEED  = 25;
var SPEEDLIMIT = 25;
var STARTSPEED = 250;

// game state lookup, make global so that everyone can see...
PREGAME  = 0x1;
COUNTING = 0x2;
PLAYING  = 0x3;
CLEARING = 0x4;
PAUSED   = 0x5;

/*
 * Constructor for the game.
 */
function TetrisGame( args ) {
    this.dom       = dom.create("div");

    this.state     = PREGAME;
    
    this.score     = new Score();
    this.playBoard = new Board( { game : this, height : 20 } ); // FIXME
    this.menu      = new Menu ( this );
        
    // need to keep track of the setInterval so that pause and end game can stop it.
    this.moveInterval = null;
    this.moveStep     = null;
    
    // various things need to know the currently moving object
    this.shape     = null;

    // the ghost is a shadow down of the shape showing where it would be.
    this.useGhost  = true;
    this.ghost     = null;
    
    // keep track of the next N shapes that will be dropped in.
    this.preview   = _.range(NUMPREVIEW).map(__prepPreview, this);

    // place holder for the keyboard handler.
    this.kbdDnHandler = null;

    this.dom.appendChild( this.makeHTML() );
    
    return;
}

// to cut down on the typing.
var thisP = TetrisGame.prototype;

// create a preview board.
// one for each preview.
// the first (exit of queue) will be grey.
function __prepPreview (idx) {
    var init = {
        game      : this,
        padTop    : 0,
        padBottom : 0,
        padLeft   : 0,
        padRight  : 0,
        height    : ( MAXSHAPEH + 2 ),
        width     : ( MAXSHAPEW + 2 ),
        cellSize  : "5px",
    };
    
    idx === 0 ? init.color = [128,128,128] : null;
    var brd = new Board(init);
    return { board : brd, shape : null };
}

// Creates the DOM objects to put in the browser.
thisP.makeHTML = function () {
    // Create a div to contain the 
    this.msgText = dom.create("string", "");
    var msgColor  = this.playBoard.color == [255,255,255] ? [0, 0, 0] : [255, 255, 255]; 
    var msgDiv    = dom.create("div",
            {style : "color : "+rgb2str(msgColor)+" ; background-color : "+rgb2str(this.playBoard.color)+" ; position : absolute ; top : 40% ; width : 100% ; text-align: center;"},
            this.msgText
    );

    var layout  = dom.create("div", null,
            dom.create("TBODY", null,
                dom.create("TR", null,
                        dom.create("TD", null, this.score.dom),
                        dom.create("TD")
                ),
                dom.create("TR", null,
                        dom.create("TD", null, 
                                dom.create("div", { style : "position : relative" },
                                        msgDiv,
                                        this.playBoard.dom)
                        ),
                        dom.create("TD",
                                {style : "padding-left : 10px; vertical-align:top ;" },
                                dom.create("string", "Preview"),
                                _.map(this.preview, function ( obj ) { return obj.board.dom; })
                        )
                )
            ),
            this.menu.dom
    );
    return layout;
};

/*
 * Start the game.
 * Reset the score, remove the shape, clear the board and the previews.
 * Fill up the preview queue.
 * Then count down before actually playing.
 */
thisP.start = function() {
    this.state = COUNTING;

    this.score.reset();
    
    if ( this.shape ) {
        this.shape.clear();
        this.shape = null;
    }
        
    this.playBoard.resetGrid();

    for (var i=0; i<NUMPREVIEW; i++) {
        if ( this.preview[i].shape ) {
            this.preview[i].shape.clear();
            this.preview[i].shape = null;
        }
    }

    // fill in the preview queue
    while ( ! this.preview[0].shape ) {
        this.addNewShape();
    }
    
    // count down this number of seconds before playing.
    var lclMsg = COUNTFROM;
    this.msgText.nodeValue = COUNTFROM;

    var startCnt = setInterval(function ( self ) {

        // if we've gotten to the end of the count down start actually playing.
        if ( lclMsg <= 0 ) {
                self.msgText.nodeValue = "";
                clearInterval(startCnt);
                self.state = PLAYING;
                self.startKbdHandler();
                self.addNewShape();
                self.calcMoveStep();
                self.moveShapeIter();
            }
            lclMsg--;
            self.msgText.nodeValue = lclMsg ? ( lclMsg < 0 ? "" : lclMsg ) : "Go";
        },
        1000,
        this
    );
    
};

// Handle key presses.
// Arrow keys don't register as keypress's so use key down.
thisP.startKbdHandler = function () {
    var self = this;
    this.kbdDnHandle = ev.addHandler(document, "keydown", function ( event ) {

        // can only move if there is a shape
        if ( !self.shape ) {
            return;
        }
        
        // If there is a lock queued up, cancel that.
        // it will be restarted, if appropriate, later.
        self.stopLock();
        
        // stop moving down while figuring out kbd pushes.
        self.stopMove();
        
        // turn off the kbdHandler while things are being processed.
        self.stopKbdHandler();
       
        // dropShape just changes the drop speed, check for lock in normal flow.
        // everything else should check for lock after the action.
        if ( event.keyCode == 40 ) { self.dropShape(); } // down
        else { 
            if      ( event.keyCode == 37 ) { self.shape.moveLeft();    } // left
            else if ( event.keyCode == 39 ) { self.shape.moveRight();   } // right
            else if ( event.keyCode == 38 ) { self.shape.rotateLeft();  } // up
            else if ( event.keyCode == 90 ) { self.shape.rotateLeft();  } // z
            else if ( event.keyCode == 88 ) { self.shape.rotateRight(); } // x
            // redraw the ghost, if approriate.
            self.drawGhost();
            // this starts either lock or move
            self.checkForLock();
        }
        
        // restart the keyboard handler
        self.startKbdHandler();
    });
};

// wrapper to stop the keyboard handler
thisP.stopKbdHandler = function () {
    if ( this.kbdDnHandle !== null ) {
        ev.removeHandler(this.kbdDnHandle);
    }
};

/*
 * calculate the number of ms it takes to drop one row.
 * not sure how this is supposed to be done...
 * do linear from (level, step) of (1,STARTSPEED) to (10,SPEEDLIMIT)
 * then cap at the SPEEDLIMT (25) and STARTSPEED(250)
 */
thisP.calcMoveStep = function () {
    this.moveStep = Math.floor(( SPEEDLIMIT - STARTSPEED )/(10 - 1) *
        ( this.score.level - 1 ) + STARTSPEED);
    if ( this.moveStep > STARTSPEED ) {
        this.moveStep = STARTSPEED;
    }
    if ( this.moveStep < SPEEDLIMIT ) {
        this.moveStep = SPEEDLIMIT;
    }
};

/*
 * This is what moves the shape down automatically.
 * Using a timeout here instead of interval for reasons that don't, in hindsight,
 * make sense. But it doesn't matter much... so keep it.
 * The next drop is started by the checkForLock call.
 */
thisP.moveShapeIter = function () {

    // if already moving, don't start a new chain.
    if ( this.moveInterval ) {
        return;
    }
    this.moveInterval = setTimeout(function ( self ) {
            self.moveInterval = null;
            self.shape.moveDown();
            self.checkForLock();
        },
        this.moveStep,
        this // pass this to timeout function as self   
    );
};

// clears the timeout that will, soon, move the shape down one.
thisP.stopMove = function () {
    if (this.moveInterval) {
        clearTimeout(this.moveInterval);
        this.moveInterval = null;
    }
};

/*
 * Looks to see if a lock should be started for this shape.
 * A lock is started as soon as the next row down has locked cells lining up.
 * The lock itself is delayed so that the player can keep moving.
 * Each move resets the lock delay.
 * If the moves make it so that the shape shouldn't be locked, start the move timer.
 */
thisP.checkForLock = function () {
    // can try for locks in multiple ways, so cancel any existing ones
    // before starting the next.
    this.stopLock();

    // this means that the shape can't move down one, so start the lock.
    if ( this.shape.conflictsWithBoard( {y:1} ) ) {
        this.lockTimeout = setTimeout(function ( self ) {
                self.lockTimeout = null;
                self.lockShape( this.lockTimeout );
            },
            LOCKDELAY,
            this
        );
        return true;
    }
    this.moveShapeIter();
    return false;
};

// clear the timeout that will soon lock the shape to the board.
thisP.stopLock = function () {
    if (this.lockTimeout) {
        clearTimeout(this.lockTimeout);
        this.lockTimeout = null;
    }
};

/*
 * Tell the board to lock the shape down.
 * Board does the real work here.
 * If any of the locked cells are in the padTop then the game is over.
 * Otherwise, remove an filled rows.
 */
thisP.lockShape = function ( par ) {
    var plc = this.shape.y + this.shape.minY;
    this.playBoard.lockShape(this.shape);
    this.shape = null;
    if ( plc < this.playBoard.padTop ) {
        this.msgText.nodeValue = "Game Over";
        this.menu.gameOver();
    }
    else {
        var numrows = this.playBoard.clearFullRows();
        this.score.update(numrows);
        var wait4clear = setInterval( function (self) {
                if ( self.state === PLAYING ) {
                    clearInterval(wait4clear);
                    self.addNewShape();
                    self.calcMoveStep();
                    self.moveShapeIter();
                }
            },
            1,
            this
        );
    }
};

// end the game.
// this is only used for debugging from the console.
thisP.stop = function() {
    this.state = PREGAME;
    this.stopLock();
    this.stopMove();
    this.stopKbdHandler();
};

/*
 * Pause/Unpause the game.
 * If pausing, stop the move, lock iterators and the kbd handler.
 * If unpausing, start those up again...
 */
thisP.togglePause = function () {
    if ( this.state === PAUSED ) {
        this.state = PLAYING;
        this.checkForLock();
        this.startKbdHandler();
    }
    else if ( this.state === PLAYING ) {
        this.state = PAUSED;
        this.stopKbdHandler();
        this.stopLock();
        this.stopMove();
    }
};

/*
 * This is a 'hard drop'.
 * Increase the speed of the drop to the maximum
 */
thisP.dropShape = function () {
    this.stopMove();
    this.moveStep = DROPSPEED;
    this.moveShapeIter();
};

/*
 * The ghost is a shadow of the shape, showing where it will go if dropped.
 * The ghost is the same as the shape, but it's color is that of the board.
 * Just the border is visible.
 */
thisP.drawGhost = function () {

    // if there is no ghost don't draw.
    // if the shape is trying to lock, don't draw.
    if ( !this.shape || !this.ghost || this.lockTimeout ) {
        return;
    }

    this.ghost.clear();
    this.ghost.x = this.shape.x;
    this.ghost.y = this.shape.y;
    this.ghost.version = this.shape.version;
    
    while ( !this.ghost.conflictsWithBoard( {y:1} ) ) {
        this.ghost.y++;
    }
    
    //FIXME - maybe don't draw the ghost if it overlaps with the shape
    //FIXME - maybe don't draw the ghost if it overlaps with the shape
    // simple work around is to draw the shape again...
    this.ghost.draw();
    this.shape.draw();
};

// Need a list of potential shape names.
var shapeNames = _.keys(shapeTemplates);

/*
 * Takes the top of the preview and adds it to the board.
 * Creates a new shape and adds to the end of the preview list.
 */
thisP.addNewShape = function () {
    // clear all the existing previews.
    for (var i=0; i<NUMPREVIEW; i++) {
        if ( this.preview[i].shape ) {
            this.preview[i].shape.clear();
        }
    }

    // shouldn't be necassiry under normal operation, but helps in debug mode.
    if ( this.shape ) {
        this.shape.clear();
    }

    // move the the next shape to the play board.
    this.shape = this.preview[0].shape;

    if ( this.shape ) {            
        this.shape.board = this.playBoard;
        this.shape.x     = this.playBoard.padLeft + Math.ceil( (this.playBoard.width - this.shape.width ) /2 );
        this.shape.y     = 0;

        this.shape.draw();

        if ( this.useGhost ) {
            this.ghost =  new Tetromino( {
                name  : this.shape.name,
                board : this.shape.board,
                x     : this.shape.x,
                y     : this.shape.y,
                isGhost : true
            });
            this.drawGhost();
        }
    }

    // shift the shapes up one.
    for (var i=0; i<NUMPREVIEW-1; i++) {
        
        this.preview[i].shape = this.preview[i+1].shape;
        if ( this.preview[i].shape ) {
            this.preview[i].shape.board = this.preview[i].board;
        }
        
        if ( this.preview[i].shape ) {
            this.preview[i].shape.draw();
        }
    }

    // add a new shape to the end.
    var j = NUMPREVIEW-1;
    this.preview[j].shape =  new Tetromino( {
        name  : shapeNames[Math.floor( Math.random()*shapeNames.length )],
        board : this.preview[j].board,
        x     : 1,
        y     : 2,
    });
    this.preview[NUMPREVIEW-1].shape.draw();
};

var exported_TetrisGame = TetrisGame;
export { exported_TetrisGame as TetrisGame };
export { PLAYING };
export { PAUSED };
export { CLEARING };
