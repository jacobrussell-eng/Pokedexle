// var init:
let nameArray = [];
let ran;
let currentMon;
let monLength;

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
const textSpace = document.querySelector("#textSpace");

// make letterboxes:
function generateLetterBoxes() {
    monLength = currentMon.length();
    gameSpace.style.gridTemplate = "repeat(6, 1fr) / repeat(${monLength}, 1fr)";
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < monLength; c++) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('letterbox');
            newDiv.id = "letter-r${r+1}-c${c+1}";
            newDiv.textContent = "r${r+1}-c${c+1}";
        }
    }
}

// start game:
function startGame() {
    startOverlay.style.display = "none";
    gameSpace.style.display = "grid";
    fetchNames();
    ran = Math.floor(Math.random()*809);
    currentMon = nameArray[ran];
    generateLetterBoxes();
    // textSpace.textContent = currentMon;
    // console.log()
}