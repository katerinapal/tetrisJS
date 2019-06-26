import { msg } from "..\\app\\common.js";
import _ from ".\\lodash.js";
;
var self = {};
export default self;
/*
 * method - setAttribute
 * lets the attribute be specified as the HTML attribute name instead of the JS property.
 */
self.setAttribute = function (obj, attr, value) {
    if ( attr === "class" ) {
        obj.className = value;
    }
    else if ( attr === "checked" ) {
        obj.defaultChecked = value;
    }
    else if ( attr === "for" ) {
        obj.htmlFor = value;
    }
    else if ( attr === "style" ) {
        obj.style.cssText = value;
    }
    else {
        obj.setAttribute(attr, value);
    }
};

// call setAttribute for an array of attributes.
self.setAttributes = function ( obj, attributes ) {
    if (!attributes) { return; }
    _.each(attributes,
            function (value, attr) {
                self.setAttribute(obj, attr, value);
            }
    );
};

/*
 * Create a DOM object of type
 * Then set the attributes.
 * Any additional arguments are assumed to be children of the created object.
 */
self.create = function( type, attributes ) {
    var obj;
    if (type === "string") {
        obj = document.createTextNode(attributes);
    }
    else {
        obj = document.createElement(type);
        self.setAttributes(obj, attributes);
        addKids(obj, _.filter(arguments, function (v, i) { return i >= 2; }));
    }

    return obj;
};

// wrapper to add the children.
function addKids ( parent ) {
    for (var i=1; i<arguments.length; i++) {
        var child = arguments[i];

        if ( _.isArray(child) ) {
            child.map(function ( subkid ) { addKids(parent, subkid); });
            continue;
        }

        if ( typeof child === "string" ) {
            child = self.create('string', child);
        }
        if ( child !== undefined && child !== null ) {
            parent.appendChild(child);
        }
        return;
        msg(">> "+child);
        
        if ( child !== undefined && child !== null ) {
            parent.appendChild(child);
        }
    }
}
