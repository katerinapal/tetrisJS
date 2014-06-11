define(["lodash"], function (_) {
    var self = {};
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

    self.setAttributes = function ( obj, attributes ) {
        if (!attributes) { return; }
        _.each(attributes,
                function (value, attr) {
                    self.setAttribute(obj, attr, value);
                }
        );
    };
    
    self.create = function(name, attributes) {
        var obj;
        if (name === "string") {
            obj = document.createTextNode(attributes);
        }
        else {
            obj = document.createElement(name);
            self.setAttributes(obj, attributes);
        }
        // all additional arguments are children
        for (var i=2; i<arguments.length; i++) {
            var child = arguments[i];
            if ( typeof child === "string" ) {
                child = self.create('string', child);
            }
            obj.appendChild(child);
        }
        return obj;
    };
    
    return self;
});
