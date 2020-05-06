import $ from "..\\utils\\jquery.js";
import _ from "..\\utils\\lodash.js";
import { self as dom } from "..\\utils\\dom.js";
import { TetrisGame } from ".\\TetrisGame.js";
export var globalGame;
var game = new TetrisGame();
globalGame = game;
document.body.appendChild( game.dom );

export function setGlobalGame(value) {
    globalGame = value;
}
