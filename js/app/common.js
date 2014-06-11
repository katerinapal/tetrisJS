/**
 * 
 */

requirejs.config({
    baseUrl: 'js/utils',
    paths: {
        app: '../app'
    }
});

// just to type less...
function msg () {
	console.log(Array.prototype.join.call(arguments, ""));
}

// pause everything for a number of seconds
function wait ( secs ) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + secs);
}

// adding 
String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};
