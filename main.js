// var init:
let nameArray = [];

const nameRequest = new Request('pokemon_names.txt');
function fetchNames() {
    fetch(nameRequest).then((response) => {
        console.log(response.ok);
        if (!response.ok) {
            console.log("Response error");
        }
        return response.text();
    }).then((text) => {
        nameArray = text.split('\n');
        console.log(nameArray);
    }).catch((/*error*/) => {
        console.log("Fetch failed")
    })
}


// HTML connectors:
const startOverlay = document.querySelector("#startScreen");
const gameSpace = document.querySelector("#gameSpace");


// start game:
function startGame() {
    startOverlay.style.display = "none";
    gameSpace.style.display = "block";
    fetchNames();
}