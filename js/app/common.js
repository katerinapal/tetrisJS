/**
 * 
 */

requirejs.config( {
    baseUrl : 'js/utils',
    paths : {
        app : '../app'
    }
} );

// just to type less...
function msg() {
    console.log( Array.prototype.join.call( arguments, "" ) );
}
function err() {
    console.error( Array.prototype.join.call( arguments, "" ) );
}
function warn() {
    console.warn( Array.prototype.join.call( arguments, "" ) );
}
function info() {
    console.info( Array.prototype.join.call( arguments, "" ) );
}

// pause everything for a number of milliseconds
function wait( secs ) {
    var start = new Date().getTime();
    var limit = start + secs;
    while ( new Date().getTime() < limit )
        ;
}

// adding
String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};

function rgb2str ( rgb, opacity ) {
    //check for null and undefined
    opacity = ( opacity == null ) ? 1 : opacity;
    rgb     = ( rgb == null ) ? [0, 0, 0] : rgb;
    return "rgba("+rgb.concat(opacity).join(", ")+")";
}

function c2s (x,y) { return x+","+y; }

/*    function moveShapeHandler( shape, event ) {
if ( event.keyCode == "38" ) {
    shape.clear();
    shape.rotateLeft();
    shape.draw();
}
else if ( event.keyCode == "37" ) {
    shape.clear();
    shape.x--;
    var lerr = shape.offTheLeft();
    if ( lerr > 0 ) {
        shape.x += lerr;
    }
    shape.draw();
}
else if ( event.keyCode == "39" ) {
    shape.clear();
    shape.x++;
    var lerr = shape.offTheRight();
    if ( lerr > 0 ) {
        shape.x -= lerr;
    }
    shape.draw();
}
}
*/