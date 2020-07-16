import _ from "..\\utils\\lodash.js";
import { create as utilsdomjs_create } from "..\\utils\\dom.js";
function Score( game ) {
    this.numLines = 0;
    this.level = 1;
    this.score = 0;
    this.scoreStr = utilsdomjs_create("string", this.score);
    this.levelStr = utilsdomjs_create("string", this.level);
    this.dom   = utilsdomjs_create("div", { style : "overflow : auto;"},
            utilsdomjs_create("div", { style : "overflow : auto;" },
                    utilsdomjs_create("div", { style : "float : left;"}, "Level : "),
                    utilsdomjs_create("div", { style : "float : right; text-align : right"},
                            this.levelStr)
            ),
            utilsdomjs_create("div", { style : "overflow : auto;" },
                    utilsdomjs_create("div", { style : "float : left;"}, "Score : "),
                    utilsdomjs_create("div", { style : "float : right; text-align : right"},
                            this.scoreStr)
            )                        
    );
}

var thisP = Score.prototype;

thisP.reset = function () {
    this.score = 0;
    this.level = 1;
    this.scoreStr.nodeValue = this.score;
    this.levelStr.nodeValue = this.level;
};

thisP.update = function ( numRows ) {
    if ( numRows === 1 ) {
        this.score += 40 * (this.level + 1);
    }
    else if ( numRows === 2 ) {
        this.score += 100 * (this.level + 1);
    }
    else if ( numRows === 3 ) {
        this.score += 300 * (this.level + 1);
    }
    else if ( numRows === 4 ) {
        this.score += 1200 * (this.level + 1);
    }
    this.scoreStr.nodeValue = this.score;
    this.numLines += numRows;
    this.updateLevel();
};

// not really sure how levels are supposed to go up.
thisP.updateLevel = function () {
    if (this.numLines <= 0) {
        this.level = 1;
    }
    else if ( this.numLines >= 1 && this.numLines <= 90 )
    {
        this.level = 1 + Math.floor((this.numLines - 1) / 10);
    }
    else if ( this.numLines >= 91 )
    {
      this.level = 10;
    }
    this.levelStr.nodeValue = this.level;
};

var exported_Score = Score;
export { exported_Score as Score };