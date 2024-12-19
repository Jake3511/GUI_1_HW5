var ScrabbleTiles = [] ;
ScrabbleTiles["A"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["B"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["C"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["D"] = { "value" : 2,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["E"] = { "value" : 1,  "original-distribution" : 12, "number-remaining" : 12 } ;
ScrabbleTiles["F"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["G"] = { "value" : 2,  "original-distribution" : 3,  "number-remaining" : 3  } ;
ScrabbleTiles["H"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["I"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["J"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["K"] = { "value" : 5,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["L"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["M"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["N"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["O"] = { "value" : 1,  "original-distribution" : 8,  "number-remaining" : 8  } ;
ScrabbleTiles["P"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Q"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["R"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["S"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["T"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["U"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["V"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["W"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["X"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["Y"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Z"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["_"] = { "value" : 0,  "original-distribution" : 2,  "number-remaining" : 2  } ;

$(function () {
    let currentScore = 0; // Current game score
    let wordMultipliers = []; // Used for doubles

    // Initialize draggable tiles
    $(".draggable").draggable({
        revert: "invalid", // If not dropped on valid square, will go back to previous one
    });

    // Initialize droppable and tiles
    $(".droppable, .droppable-double-word-3, .droppable-double-word-13, .droppable-double-letter-7, .droppable-double-letter-9").droppable({
        accept: ".draggable",
        drop: function (event, ui) {
            // Check if the square is already occupied, if it is won't be able to place cause it will revert
            if ($(this).data("occupied")) {
                ui.draggable.draggable("option", "revert", true);
                return;
            }

            const tile = ui.draggable.attr("alt").split(" ")[2]; // Extract the letter from the tile
            const tileValue = ScrabbleTiles[tile]?.value || 0; // Get the value of the tile/letter
            const squareType = $(this).data("type") || "normal"; // Get the square type if it's a double word or double letter

            // Get rid of the previous score if there was a letter placed on tile and update it
            const previousTileValue = $(this).data("tile-value") || 0;
            currentScore -= previousTileValue;

            // Handle double letter squares
            if (squareType === "double-word" && !$(this).data("has-multiplier")) {
                wordMultipliers.push(2); // Add double effect
                $(this).data("has-multiplier", true); // Prevent duplicate multipliers
            }

            // Calculate the new tile's score for specifically double letters
            let scoreToAdd = tileValue;
            if (squareType === "double-letter") {
                scoreToAdd *= 2;
            }

            // Add the new score
            currentScore += scoreToAdd;

            // Mark the tile as taken
            $(this).data("occupied", true);
            $(this).data("tile-value", scoreToAdd);

            // Snap the letter into place
            $(this).children(".draggable").detach(); // Remove any existing tile
            $(this).append(ui.draggable); // Place the new tile
            ui.draggable.css({ top: "0", left: "0" });

            // Recalculate the total score
            recalculateWordScore();
        },
        out: function (event, ui) {
            // Free the square when the tile is removed
            const squareType = $(this).data("type") || "normal";

            // Deduct the score for the removed tile
            const removedTileValue = $(this).data("tile-value") || 0;
            currentScore -= removedTileValue;

            // Handle double word squares
            if (squareType === "double-word" && $(this).data("has-multiplier")) {
                wordMultipliers.pop(); // Remove one double effect
                $(this).data("has-multiplier", false); // Reset multiplier tracking
            }

            // Clear the square's data
            $(this).removeData("tile-value");
            $(this).data("occupied", false); // Mark the square as unoccupied

            // Recalculate the total score
            recalculateWordScore();
        },
    });

    function recalculateWordScore() { // used for double words and double letters
        let wordScore = 0;

        // Sum the values of all letters currently placed on the board accounting for doubles
        $(".droppable, .droppable-double-word-3, .droppable-double-word-13, .droppable-double-letter-7, .droppable-double-letter-9").each(function () {
            const tileValue = $(this).data("tile-value") || 0; 
            wordScore += tileValue;
        });

        // Apply the doubles
        wordMultipliers.forEach(multiplier => {
            wordScore *= multiplier;
        });

        currentScore = wordScore
        updateScoreDisplay(currentScore); // updates the score
    }

    function updateScoreDisplay() {
        $("#score-display").text(`Score: ${currentScore}`);
    }
});


function getRandomLetters() { // gets seven random letters
    let letters = []; // used to store the seven tiles
    const container = document.getElementById("draggable-container");

    while(letters.length < 7) {
        const keys = Object.keys(ScrabbleTiles); // gets every key avaliable in the object
        const randomKey = keys[Math.floor(Math.random() * keys.length)]; // gets a random key from the 28 options

        if (ScrabbleTiles[randomKey]["number-remaining"] > 0) { // if statment to check if number remaining is at least greater than 0
            ScrabbleTiles[randomKey]["number-remaining"]--; // if valid, subtracts "number-remaining" by 1
            letters.push(randomKey); // pushes value of randomKey into the letters array
        }
        else { // used if the number remaining is in fact less than 0 and can't be displayed or pushed to letters
            continue;
        }
        const totalRemainingTiles = Object.values(ScrabbleTiles).reduce((sum, tile) => sum + tile["number-remaining"], 0); // adds all values of "number-remaining" to see if value is at least 7 


        const img = document.createElement("img"); // creates an img element

        if (randomKey == '_') { // for the blank key since file name can't be generalized
            img.src = `/graphics_data/Scrabble_Tiles/Scrabble_Tile_blank.jpg`
            img.alt = `Scrabble Tile _`
            img.style.width = "65px"; 
            img.style.height = "63px";
            img.className = "draggable";
            container.appendChild(img);
        }
        else {
            img.src = `/graphics_data/Scrabble_Tiles/Scrabble_Tile_${randomKey}.jpg`
            img.alt = `Scrabble Tile ${randomKey}`;
            img.style.width = "65px";
            img.style.height = "63px";
            img.className = "draggable";
            container.appendChild(img);
        }

        $(img).draggable({
            revert: "invalid", // If not dropped on valid square, will go back to previous one
        });

        if (totalRemainingTiles < 7) { // checks to see if the letters remaining are at least greater than or equal to 7
            console.log("Not enough tiles remaining to pick 7.");
            break;
        }
    }
    console.log(letters);
}

function restartGame(resetScore) {
    console.log(`Restarting game. Reset score: ${resetScore}`); // for testing to see if function called

    const container = document.getElementById("draggable-container");
    container.innerHTML = ""; // removes all elements

    // Clear the board squares as well as remove the tiles both visually and data wise. Final line resets the state.
    $(".droppable, .droppable-double-word-3, .droppable-double-word-13, .droppable-double-letter-7, .droppable-double-letter-9").each(function () {
        $(this).empty();
        $(this).removeData("tile-value").removeData("occupied");
        $(this).data("occupied", false);
    });

    // Reset ScrabbleTiles and score only if resetScore is true
    if (resetScore) {
        for (const tile in ScrabbleTiles) {
            ScrabbleTiles[tile]["number-remaining"] = ScrabbleTiles[tile]["original-distribution"];
        }
        updateScoreDisplay(0); // function to display 0 for score
    }

    getRandomLetters(); // Call getRandomLetters to populate the rack
}

function updateScoreDisplay(currentScore) { // updates score if restart button is clicked
    document.getElementById("score-display").textContent = `Score: ${currentScore}`;
}

// Event listener for the next button
document.getElementById("next-button").addEventListener("click", function () {
    console.log("Next button clicked. Keeping score intact."); // error checking to see if event listener worked
    restartGame(false); // Keep the score
});

// Event listener for the restart button
document.getElementById("restart-button").addEventListener("click", function () {
    console.log("Restart button clicked. Resetting score."); // error checking to see if event listener worked
    restartGame(true); // Reset the score
});

const randomLetters = getRandomLetters(); // initial call to get random letters populated on the board
console.log(randomLetters); // logs the random letters for testing