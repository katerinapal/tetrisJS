/**
 * The wrapper for the whole game
 */

define( [ "lodash", "dom", "events", "app/Board", "app/Score", "app/Menu",
          "app/Tetromino", "app/shapeTemplates" ], function(
        _, dom, ev, Board, Score, Menu, Tetromino, shapeTemplates ) {

    var numPreview = 3;
    var maxShapeH  = 4;
    var maxShapeW  = 4;
    var countFrom  = 1; //FIXME make bigger

    function TetrisGame( args ) {
        this.dom       = dom.create("div");

        //        , { style : "display: inline-block;" } );
        
        this.score     = new Score();
        this.playBoard = new Board( { game : this } );
        this.preBoard  = new Board( {
                game : this,
                topPad : 0,
                height : ( numPreview * ( maxShapeH + 1) + 1 ),
                width  : ( maxShapeW + 2 ),
                cellSize : "5px",
        });
        this.menu      = new Menu ( this );
        
        // the gravity property controls how fast the shape drops.
        this.gravity   = 1;
        
        // need to keep track of the setInterval so that pause and end game can stop it.
        this.moveInterval = null;
        
        // various things need to know the currently moving object
        this.shape     = null;

        // keep track of the next N shapes that will be dropped in.
        this.preview   = _.range(numPreview).map(function (idx) {

            var init = {
                game     : this,
                topPad   : 0,
                height   : ( maxShapeH + 2 ),
                width    : ( maxShapeW + 2 ),
                cellSize : "5px",
            };
            
            idx == 0 ? init.color = "grey" : null;
            return { board : new Board(init), shape : null };

        });

        // Create a div to contain the 
        this.countText = dom.create("string", "");
        var cntColor  = this.playBoard.color === "white" ? "black" : "white"; 
        var cntDiv    = dom.create("div",
                {style : "color : "+cntColor+" ; position : absolute ; top : 40% ; width : 100% ; text-align: center;"},
                this.countText
        );

        var layout  = dom.create("TBODY", null,
                dom.create("TR", null,
                        dom.create("TD", null, this.score.dom),
                        dom.create("TD", {style : "padding-left : 10px" }, "Preview")
                ),
                dom.create("TR", null,
                        dom.create("TD", null, 
                                dom.create("div", { style : "position : relative" },
                                        cntDiv,
                                        this.playBoard.dom)
                        ),
                        dom.create("TD",
                                {style : "padding-left : 10px; vertical-align:top ;" },
                                _.map(this.preview, function ( obj ) { return obj.board.dom; })
                        )
                ),
                dom.create("TR", null,
                        dom.create("TD", null, this.menu.dom)
                )
        );
        
        this.dom.appendChild(layout);
        return;
    }

    var thisP = TetrisGame.prototype;

    thisP.updateScore = function ( val ) {
        this.score.set(val);
    };
    
    thisP.start = function() {
        this.score.set(0);
        if ( this.shape ) {
            this.shape.clear();
        }
        while ( ! this.shape ) {
            this.addNewShape();
        }
        
        msg("----------------------");
        
        var lclCnt = countFrom;
        this.countText.nodeValue = countFrom;

        var startCnt = setInterval(function ( self ) {
                if ( lclCnt <= 0 ) {
                    self.countText.nodeValue = "";
                    clearInterval(startCnt);
                    self.moveShape();
                }
                lclCnt--;
                self.countText.nodeValue = lclCnt ? ( lclCnt < 0 ? "" : lclCnt ) : "Go";
            },
            1000,
            this
        );
        
    };
    
    function calcMoveStep ( gravity ) {
        return 300;
    }
    
    thisP.moveShape = function () {

        // use timeout instead of interval to make it easier for gravity to be adjusted.
        this.moveInterval = setTimeout(function ( self ) {
            self.shape.moveDown();
                self.moveShape();
            },
            calcMoveStep (),
            this
        );
    };
    
    thisP.stop = function() {
        if ( this.keyEventHandler !== null ) {
            ev.removeHandler( this.keyEventHandler );
        }
    };
    
    var shapeNames = _.keys(shapeTemplates);

    /*
     * Takes the top of the preview and adds it to the board.
     * Creates a new shape and adds to the end of the preview list.
     */
    thisP.addNewShape = function () {

        // clear all the existing previews.
        for (var i=0; i<numPreview; i++) {
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
            this.shape.x     = Math.floor( (this.playBoard.width - this.shape.width ) /2 );
            this.shape.y     = 0;
            this.shape.draw();
        }

        // shift the shapes up one.
        for (var i=0; i<numPreview-1; i++) {
            
            this.preview[i].shape = this.preview[i+1].shape;
            if ( this.preview[i].shape ) {
                this.preview[i].shape.board = this.preview[i].board;
            }
            
            if ( this.preview[i].shape ) {
                this.preview[i].shape.draw();
            }
        }
        //shapeNames[Math.floor( Math.random()*shapeNames.length )],
        // add a new shape to the end.
        var j = numPreview-1;
        this.preview[j].shape =  new Tetromino( {
            name  : "I",
            board : this.preview[j].board,
            x     : 1,
            y     : 2,
        });
        this.preview[numPreview-1].shape.draw();
    };

    return TetrisGame;
} );
