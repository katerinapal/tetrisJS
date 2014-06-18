/**
 * This is largely taken from Eloquent javascript.
 * Will look for a package later...
 */

define(function () {
	// large
	// handle IE vs everyone else difference in event listeners.
	function registerHandler ( dom, event, handler ) {
		if (typeof dom.addEventListener == "function") {
			dom.addEventListener(event, handler, false);
		}
		else {
			dom.attachEvent("on" + event, handler);
		}
	}
	
	function unregisterHandler ( dom, event, handler ) {
		if (typeof dom.removeEventListener == "function") {
			dom.removeEventListener(event, handler, false);
		}
		else {
			dom.detachEvent("on" + event, handler);
		}
	}

	function handleBrowserDiffs ( event ) {
		// Handle IE difference in stopping events from bubbling up.
		if (!event.stopPropagation) {
			event.stopPropagation = function() { this.cancelBubble = true;  };
			event.preventDefault  = function() { this.returnValue  = false; };
		}

		if (!event.stop) {
			event.stop = function() {
				this.stopPropagation();
				this.preventDefault();
			};
		}
		
		// handle differences in mouse movement between DOM objects is reported.
		if (event.srcElement && !event.target) {
			event.target = event.srcElement;
		}
		if ((event.toElement || event.fromElement) && !event.relatedTarget) {
			event.relatedTarget = event.toElement || event.fromElement;
		}

		// handle differences in how browsers report location of clicks.
		if (event.clientX != undefined && event.pageX == undefined) {
			event.pageX = event.clientX + document.body.scrollLeft;
			event.pageY = event.clientY + document.body.scrollTop;
		}
		
		// some browsers store the unicode in charCode, others in keyCode...
		if (event.type === "keypress" ) {
			if (event.charCode === 0 || event.charCode == undefined) {
				event.character = String.fromCharCode(event.keyCode);
			}
			else {
				event.character = String.fromCharCode(event.charCode);
			}
		}
		
		return event;
	}
	
	return {
		addHandler : function (dom, type, handler) {
			function wrapHandler(event) {
				handler(handleBrowserDiffs(event || window.event));
			}
			registerHandler(dom, type, wrapHandler);
			return {dom: dom, type: type, handler: wrapHandler};
		},
		removeHandler : function (object) {
		    if ( object != null ) {
		        unregisterHandler(object.dom, object.type, object.handler);
		    }
		}
	};
});