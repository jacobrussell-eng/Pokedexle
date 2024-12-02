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

// Make letterboxes:
function generateLetterBoxes() {
    monLength = currentMon.length;
    gameSpace.style.gridTemplate = `repeat(6, max(8vh,50px)) / repeat(${monLength}, max(8vh,50px))`;
    gameSpace.style.width = `max(${monLength*8}vh,${monLength*50}px)`;
    gameSpace.style.height = `max(48vh,300px)`;
    for (var r = 0; r < 6; r++) {
        for (var c = 0; c < monLength; c++) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('letterbox');
            newDiv.id = `letter-r${r}-c${c}`;
            // newDiv.textContent = `r${r}-c${c}`;
            newDiv.textContent = " ";

            gameSpace.appendChild(newDiv);
        }
    }
    guessMatrix = Array.from({length:6},() => Array.from({length:monLength}, ()=>"")); // thx ben
}

// User input function:
const inputHandler = (event) => {
    console.log("Key pressed: " + event.key)
    if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
        letterInsert(event.key.toUpperCase());
    }
    else if (event.key == "Backspace") {
        letterDelete();
    }
}

// Add letter to box and guess matrix:
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

// Backspace function: 
function letterDelete(){
    if (currentCol != 0) { // protects from undoing prev guesses
        currentCol--;
        guessMatrix[currentRow][currentCol] = "";
        document.getElementById(`letter-r${currentRow}-c${currentCol}`).textContent = " ";
    }
}

// Check guess:
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
        else {
            document.getElementById(`letter-r${currentRow}-c${i}`).style.backgroundColor = "gray";
        }
    }
    if (currentRow == 5 && perfectLetters != monLength) {
        loseGame();
    }
    return perfectLetters;
}

// Win State:
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

// Loss State:
function loseGame() {
    console.log("You Lose!")
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

// Start game:
async function startGame() {
    // Reset game variables:
    guessMatrix = [];
    gameSpace.innerHTML = "";
    currentCol = 0; currentRow = 0;

    // HTML overlay handling:
    startOverlay.style.display = "none";
    endScreen.style.display = "none";
    gameSpace.style.display = "grid";

    // Pokemon Name fetch request:
    await fetchNames();
    window.addEventListener("keypress", inputHandler);

    // Random pick:
    ran = Math.floor(Math.random()*809);
    console.log("random num 0-809: ", ran);
    currentMon = nameArray[ran];
    console.log("current mon: ", currentMon);


    generateLetterBoxes();

    // console.log()
}