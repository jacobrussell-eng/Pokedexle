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
function generateLetterBoxes(currentMon) {
    monLength = currentMon.length();
    gameSpace.style.gridTemplate = "repeat(6, 1fr) / repeat(${monLength}, 1fr)";
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < monLength; c++) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('letterbox');
            newDiv.id = "letter-r${r}-c${c}";
            newDiv.textContent = "r${r}-c${c}";

            gameSpace.appendChild(newDiv);
        }
    }
}

// start game:
function startGame() {
    startOverlay.style.display = "none";
    gameSpace.style.display = "grid";
    fetchNames().then(() => {
        ran = Math.floor(Math.random()*809);
        console.log("random num 0-809: ", ran);
        currentMon = nameArray[ran];
        console.log("current mon: ", currentMon);
        generateLetterBoxes(currentMon);
    });

    // textSpace.textContent = currentMon;
    // console.log()
}