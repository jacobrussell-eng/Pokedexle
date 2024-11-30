// python3 -m http.server 8000 in Pokedexle folder to host local http - thanks @benjaminbenben

// var init:
let nameArray = [];
let ran;
let currentMon; // turn string to iterable for individual letterboxes?
let monLength;
let currentRow = 0;
let currentCol = 0;
let guessMatrix = []

// HTML connectors:
const startOverlay = document.querySelector("#startScreen");
const gameSpace = document.querySelector("#gameSpace");
const endScreen = document.querySelector("#endScreen");

// Fetching names from the .txt:
const nameRequest = new Request('pokemon_names.txt');
async function fetchNames() {
    await fetch(nameRequest).then((response) => {
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

// make letterboxes:
function generateLetterBoxes() {
    monLength = currentMon.length;
    gameSpace.style.gridTemplate = `repeat(6, max(10vh,50px)) / repeat(${monLength}, max(10vh,50px))`;
    gameSpace.style.width = `max(${monLength*10}vh,${monLength*50}px)`;
    gameSpace.style.height = `max(60vh,300px)`;
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < monLength; c++) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('letterbox');
            newDiv.id = `letter-r${r}-c${c}`;
            newDiv.textContent = `r${r}-c${c}`;

            gameSpace.appendChild(newDiv);
        }
    }
    guessMatrix = Array.from({length:6},() => Array.from({length:monLength}, ()=>"")); // thx ben
}

// user input function:
const inputHandler = (event) => {
    if (event.key.match(/[a-zA-Z]/)) {
        letterInsert(event.key.toUpperCase());
    }
    else if (event.key == "Backspace") {
        letterDelete();
    }
}


function letterInsert(letter){
    guessMatrix[currentRow][currentCol] = letter;
    document.getElementById(`letter-r${currentRow}-c${currentCol}`).textContent = letter;
    console.log(guessMatrix);
    if (currentCol != (monLength-1)) {
        currentCol++;
    } else {
        let correctGuesses = checkRow();
        console.log("correctGuesses = " + correctGuesses)
        if (correctGuesses == monLength) {
            winGame();
        } else {
            currentRow++ , currentCol=0
        }
    }
}

function letterDelete(){}


function checkRow() {
    let perfectLetters = 0
    rowToCheck = guessMatrix[currentRow];
    answerArray = currentMon.toUpperCase().split('');
    console.log("row to check: " + rowToCheck)
    console.log("answerArray: " + answerArray)
    for (i=0;i<rowToCheck.length;i++) {
        if (rowToCheck[i] == answerArray[i]) {
            document.getElementById(`letter-r${currentRow}-c${i}`).style.backgroundColor = "green";
            perfectLetters++;
        } else if (answerArray.includes(rowToCheck[i]) && rowToCheck[i] != answerArray[i]) {
            document.getElementById(`letter-r${currentRow}-c${i}`).style.backgroundColor = "yellow";
        } 
        // else {
        //     allTrue = false;
        // }
    }
    return perfectLetters;
}

function winGame() {
    window.removeEventListener("keypress", inputHandler);
    // HTML win screen:
    endScreen.style.display = "flex";
    endScreen.textContent = `Congrats! You guessed ${currentMon} in ${currentRow+1} tries!`;

    // Restart Button:
    const restartButton = document.createElement('button');
    restartButton.textContent = "Play Again?";
    restartButton.addEventListener("click", startGame);
    endScreen.appendChild(restartButton);
}

function loseGame() {
    window.removeEventListener("keypress", inputHandler);
    // HTML win screen:
    endScreen.style.display = "flex";
    endScreen.textContent = `Ach! Unfortunately you didn't guess the Pokemon`;

    // Restart Button:
    const restartButton = document.createElement('button');
    restartButton.textContent = "Try Again?";
    restartButton.addEventListener("click", startGame);
    endScreen.appendChild(restartButton);
}

// start game:
async function startGame() {
    startOverlay.style.display = "none";
    endScreen.style.display = "none";
    gameSpace.style.display = "grid";
    await fetchNames();
    window.addEventListener("keypress", inputHandler);

    ran = Math.floor(Math.random()*809);
    console.log("random num 0-809: ", ran);
    currentMon = nameArray[ran];
    console.log("current mon: ", currentMon);
    generateLetterBoxes();

    // console.log()
}