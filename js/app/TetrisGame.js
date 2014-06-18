/**
 * The wrapper for the whole game
 */

define( [ "lodash", "dom", "events", "app/Board", "app/Score", "app/Menu",
          "app/Tetromino", "app/shapeTemplates" ], function(
        _, dom, ev, Board, Score, Menu, Tetromino, shapeTemplates ) {

    var NUMPREVIEW = 3;
    var MAXSHAPEH  = 4;
    var MAXSHAPEW  = 4;
    var COUNTFROM  = 1; //FIXME make bigger
    // ms - the amount of time before a lock is committed
    var LOCKDELAY  = 500;
    var DROPSPEED  = 25;
    var SPEEDLIMIT = 25;
    var STARTSPEED = 250;
    
    // state lookup, make global...
    PREGAME  = 0x1;
    COUNTING = 0x2;
    PLAYING  = 0x3;
    CLEARING = 0x4;
    PAUSED   = 0x5;
    
    function TetrisGame( args ) {
        this.dom       = dom.create("div");

        this.state     = PREGAME;
        
        this.score     = new Score();
        this.playBoard = new Board( { game : this, height : 20 } ); // FIXME
        this.menu      = new Menu ( this );
        
        // the gravity property controls how fast the shape drops.
        this.gravity   = 1;
        
        // need to keep track of the setInterval so that pause and end game can stop it.
        this.moveInterval = null;
        this.moveStep     = null;
        
        // various things need to know the currently moving object
        this.shape     = null;

        // the ghost is a shadow down of the shape showing where it would be.
        this.ghost     = null;
        
        // keep track of the next N shapes that will be dropped in.
        this.preview   = _.range(NUMPREVIEW).map(__prepPreview, this);

        this.kbdDnHandler = null;
        this.kbdUpHandler = null;
        this.dom.appendChild( this.makeHTML() );
        return;
    }

    var thisP = TetrisGame.prototype;

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
    
    thisP.startKbdHandler = function () {
        var self = this;
        this.kbdDnHandle = ev.addHandler(document, "keydown", function ( event ) {

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
                // this starts either lock or move
                self.checkForLock();
            }
            
            // restart the keyboard handler
            self.startKbdHandler();
        });
    };
    
    thisP.stopKbdHandler = function () {
        if ( this.kbdDnHandle !== null ) {
            ev.removeHandler(this.kbdDnHandle);
        }
    };

    // not sure what this is supposed to do...
    // do linear from (level, step) of (1,STARTSPEED) to (15,SPEEDLIMIT)
    // then cap at the SPEEDLIMT (25) and STARTSPEED(250)
    thisP.calcMoveStep = function () {
        this.moveStep = Math.floor(( SPEEDLIMIT - STARTSPEED )/(10 - 1) * ( this.score.level - 1 ) + STARTSPEED);
        msg("<< "+this.moveStep);
        if ( this.moveStep > STARTSPEED ) {
            this.moveStep = STARTSPEED;
        }
        if ( this.moveStep < SPEEDLIMIT ) {
            this.moveStep = SPEEDLIMIT;
        }
    };

    // use timeout instead of interval to make it easier for gravity to be adjusted.
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
    
    thisP.stopMove = function () {
        if (this.moveInterval) {
            clearTimeout(this.moveInterval);
            this.moveInterval = null;
        }
    };
    
    thisP.checkForLock = function () {
        // can try for locks in multiple ways, so cancel any existing ones
        // before starting the next.
        this.stopLock();

        // this means that the shape can't move down one, so start the lock.
        if ( this.shape.conflictsWithBoard( {y:1} ) ) {
            this.lockTimeout = setTimeout(function ( self ) {
                    this.lockTimeout = null;
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
    
    thisP.stopLock = function () {
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
            this.lockTimeout = null;
        }
    };
    
    thisP.lockShape = function ( par ) {
        var plc = this.shape.y + this.shape.minY;
        this.playBoard.lockShape(this.shape);
        this.shape = null;
        if ( plc < this.playBoard.padTop ) {
            this.msgText.nodeValue = "Game Over";
            this.menu.gameOver();
        }
        else {
            this.state = CLEARING;
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
    
    thisP.stop = function() {
        this.state = PREGAME;
        this.stopLock();
        this.stopMove();
        this.stopKbdHandler();
    };

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
    
    thisP.dropShape = function () {
        this.stopMove();
        this.moveStep = DROPSPEED;
        this.moveShapeIter();
    };

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

    return TetrisGame;
} );
