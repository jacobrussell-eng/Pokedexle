// python3 -m http.server 8000 in Pokedexle folder to host local http - thanks @benjaminbenben

// var init:
let nameArray = [];
let ran;
let currentMon; // turn string to iterable for individual letterboxes?
let monLength;
let currentRow = 0;
let currentCol = 0;
let guessMatrix = [] // values within letterboxes
let currentGuess = []; // will store the positions of correct letters when checking rows
let greens = new Set(); let yellows = new Set(); let grays = new Set();
const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
];


const submitIcon = new Image();
submitIcon.src = 'arrow.png';
const backIcon = new Image();
backIcon.src = 'backspace-arrow.png';

// HTML connectors:
const startOverlay = document.querySelector("#startScreen");
const gameSpace = document.querySelector("#gameSpace");
const endScreen = document.querySelector("#endScreen");
const keyboardSpace = document.querySelector("#keyboardSpace");

// Fetching names from the .txt:
const nameRequest = new Request('pokemon_names.txt');
async function fetchNames() {
    await fetch(nameRequest).then((response) => {
        // console.log(response.ok);
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

// Make Keyboard:
function generateKeycaps() {
    keyboardLayout.forEach(row => {
        const keyRow = document.createElement('div');
        keyRow.classList.add('keyrow');
        keyRow.style.display = "flex";
        row.forEach(letter => {
            const keycap = document.createElement('button');
            keycap.classList.add('keycap');
            keycap.style.fontSize = `max(${keyboardSpace.offsetHeight*0.15}px,1em)`;
            console.log("keyboardSpace offset height = " + keyboardSpace.offsetHeight);
            if (letter == "Backspace") {
                keycap.innerHTML = `<img src="backspace-arrow.png" style="height: ${keyboardSpace.offsetHeight*0.15}px;width:auto;">`;
                keycap.addEventListener('click', ()=>{letterDelete()});
            } else if (letter == "Enter") {
                keycap.innerHTML = `<img src="arrow.png" style="height: ${keyboardSpace.offsetHeight*0.12}px;width:auto">`;
                keycap.addEventListener('click', ()=> {
                    if (currentCol == (monLength-1) && guessMatrix[currentRow][currentCol] != "") {
                        let correctGuesses = checkRow();
                        if (correctGuesses == monLength) {
                            winGame();
                        } else {
                            currentRow++ , currentCol=0;
                        }
                    }
                });
            } else {
                keycap.id = `keycap-${letter}`;
                keycap.textContent = letter;
                keycap.addEventListener('click', ()=>{letterInsert(letter)});
            }
            keyRow.appendChild(keycap);
        })

        keyboardSpace.appendChild(keyRow);
    })
}

// User input function:
const inputHandler = (event) => {
    // console.log("Key pressed: " + event.key)
    if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
        letterInsert(event.key.toUpperCase());
    }
    else if (event.key === "Backspace" || event.keyCode == 8) {
        letterDelete();
    }
    else if (event.key === "Enter" || event.keyCode == 13) {
        if (currentCol == (monLength-1) && guessMatrix[currentRow][currentCol] != "") {
            let correctGuesses = checkRow();
            if (correctGuesses == monLength) {
                winGame();
            } else {
                currentRow++ , currentCol=0;
            }
        }
    }
}

// Add letter to box and guess matrix:
function letterInsert(letter){
    guessMatrix[currentRow][currentCol] = letter;
    document.getElementById(`letter-r${currentRow}-c${currentCol}`).textContent = letter;
    // console.log(guessMatrix);
    if (currentCol != (monLength-1)) {
        currentCol++;
    } 
    /* - Changed from Automatic to Enter key:
    else {
        let correctGuesses = checkRow();
        // console.log("correctGuesses = " + correctGuesses)
        if (correctGuesses == monLength) {
            winGame();
        } else {
            currentRow++ , currentCol=0
        }
    }
    */
}

// Backspace function: 
function letterDelete(){
    console.log("currentCol in letterDelete: " + currentCol);

    if (currentCol >= 0) { // protects from undoing prev guesses
        if (currentCol != 0 && guessMatrix[currentRow][currentCol] == "") { currentCol--; }
        guessMatrix[currentRow][currentCol] = "";
        document.getElementById(`letter-r${currentRow}-c${currentCol}`).textContent = " "; 
    }

    // if (currentCol >= 0) { // protects from undoing prev guesses
    //     guessMatrix[currentRow][currentCol] = "";
    //     document.getElementById(`letter-r${currentRow}-c${currentCol}`).textContent = " ";  
    //     if (currentCol != 0) { currentCol--; }
    // }
}

// Check guess:
function checkRow() {
    let perfectLetters = 0
    rowToCheck = guessMatrix[currentRow];
    answerArray = currentMon.toUpperCase().split('');
    console.log("row to check: " + rowToCheck)
    console.log("answerArray: " + answerArray)

    // Dict with no. of each unique letter in the answer:
    const answerUniqueCounts = {};
    answerArray.forEach(letter => answerUniqueCounts[letter] = (answerUniqueCounts[letter] || 0) + 1);

    // Positions of confirmed greens for this row:
    currentGuess = Array.from({length:monLength}, ()=>" ");

    for (i=0;i<rowToCheck.length;i++) { // Green pass
        if (rowToCheck[i] == answerArray[i]) {        

            document.getElementById(`letter-r${currentRow}-c${i}`).style.backgroundColor = "green";
            currentGuess[i] = "green"; // rename array to isGreens? 
            answerUniqueCounts[rowToCheck[i]]--;

            greens.add(rowToCheck[i]);
            if (yellows.has(rowToCheck[i])) {
                yellows.delete(rowToCheck[i]);
            } else if (grays.has(rowToCheck[i])) {
                grays.delete(rowToCheck[i]);
            }

            perfectLetters++;

        }   
    }

    for (j=0;j<rowToCheck.length;j++) { // Yellow & Gray pass
        if (answerArray.includes(rowToCheck[j]) && currentGuess[j] != "green" && answerUniqueCounts[rowToCheck[j]] != 0) {

            document.getElementById(`letter-r${currentRow}-c${j}`).style.backgroundColor = "yellow";
            answerUniqueCounts[rowToCheck[j]]--;
        
            yellows.add(rowToCheck[j]);
            if (grays.has(rowToCheck[j])) {
                grays.delete(rowToCheck[j]);
            }

        } else {
            if (currentGuess[j] != "green") {
                document.getElementById(`letter-r${currentRow}-c${j}`).style.backgroundColor = "gray";
                grays.add(rowToCheck[j]);
            }
        }

    }

    // remove dupes:
    yellows.forEach(letter => { grays.delete(letter) });
    greens.forEach(letter => { yellows.delete(letter); grays.delete(letter) });
    // update keycap colors:
    greens.forEach(letter => { document.getElementById(`keycap-${letter}`).style.backgroundColor = "green"; })
    yellows.forEach(letter => { document.getElementById(`keycap-${letter}`).style.backgroundColor = "yellow"; })
    grays.forEach(letter => { document.getElementById(`keycap-${letter}`).style.backgroundColor = "gray"; })

    console.log("Current Guess " + currentGuess);
    console.log("Greens: " + Array.from(greens));
    console.log("Yellows: " + Array.from(yellows));
    console.log("Grays: " + Array.from(grays));

    if (currentRow == 5 && perfectLetters != monLength) {
        loseGame();
    }
    return perfectLetters;
}

// Win State:
function winGame() {
    window.removeEventListener("keydown", inputHandler);
    // HTML win screen:
    endScreen.style.display = "flex";
    if (currentRow==0) { endScreen.textContent = `Wow! You guessed ${nameArray[ran]} in 1 try!`; } 
    else { endScreen.textContent = `Congrats! You guessed ${nameArray[ran]} in ${currentRow+1} tries!`; }
    

    // Restart Button:
    const restartButton = document.createElement('button');
    restartButton.textContent = "Play Again?";
    restartButton.addEventListener("click", startGame);
    endScreen.appendChild(restartButton);
}

// Loss State:
function loseGame() {
    console.log("You Lose!")
    window.removeEventListener("keydown", inputHandler);
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
    greens.clear(); yellows.clear(); grays.clear();
    gameSpace.innerHTML = "";
    keyboardSpace.innerHTML = "";
    currentCol = 0; currentRow = 0;

    // HTML overlay handling:
    startOverlay.style.display = "none";
    endScreen.style.display = "none";
    gameSpace.style.display = "grid";
    keyboardSpace.style.display = "flex";

    // Pokemon Name fetch request:
    await fetchNames();
    window.addEventListener("keydown", inputHandler);

    // Random pick:
    ran = Math.floor(Math.random()*809);
    console.log("random num 0-809: ", ran);
    currentMon = nameArray[ran].replace(/[^a-zA-Z]/g, '');
    console.log("current mon: ", currentMon);


    generateLetterBoxes();
    generateKeycaps();

    // console.log()
}
