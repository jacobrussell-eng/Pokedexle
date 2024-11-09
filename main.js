// var init:
let nameArray = [];

/*
let text = fetch("pokemon_names.txt").text();
nameArray = text.split('\n');
console.log(nameArray);
*/

// HTML connectors:
const startOverlay = document.querySelector("#startScreen");
const gameSpace = document.querySelector("#gameSpace");


// start game:
function startGame() {
    startOverlay.style.display = "none";
    gameSpace.style.display = "block";
}