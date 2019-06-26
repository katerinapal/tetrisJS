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
export function msg() {
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
export function wait(secs) {
    var start = new Date().getTime();
    var limit = start + secs;
    while ( new Date().getTime() < limit )
        ;
}

// adding a way to repeat a string N times (I only want for chars..)
String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};

export function rgb2str(rgb, opacity) {
    //check for null and undefined
    opacity = ( opacity == null ) ? 1 : opacity;
    rgb     = ( rgb == null ) ? [0, 0, 0] : rgb;
    return "rgba("+rgb.concat(opacity).join(", ")+")";
}

// for debugging, I found myself doing this a lot in console.log...
function c2s (x,y) { return x+","+y; }
