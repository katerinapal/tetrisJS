import ev from "..\\utils\\events.js";
import TetrisGame from ".\\TetrisGame.js";
import _ from "..\\utils\\lodash.js";
import $ from "..\\utils\\jquery.js";

function tetrisJS_game_func0(tetrisJS_game_func0_argument) {
    globalGame = tetrisJS_game_func0_argument;
}

export function getGlobalGame() {
    return globalGame;
}

export function setGlobalGame(globalgame) {
    globalGame = globalgame;
}

var globalGame;
;
var game = new TetrisGame();
tetrisJS_game_func0(game);;
document.body.appendChild( game.dom );
