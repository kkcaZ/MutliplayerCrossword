var selectedOrientation;

function SendLetterUpdate(letter, name, className) {
    const type = "letter";
    socket.send(JSON.stringify({ type, letter, name }));

    SelectNextBox(name, className);
}

var selectedOrientation;

function SelectNextBox(name, className, xInc = null, yInc = null, multiplier = 1, isMouse = true) {
    var classes = className.split(" ");

    var orientation;
    if (isMouse) {
        if (document.getElementsByClassName(classes[0])[0].className.includes("selected"))
            orientation = classes[0].split("-")[1];
        else orientation = classes[1].split("-")[1];
    } else {
        orientation = selectedOrientation != undefined ? selectedOrientation : classes[0].split("-")[1];
    }

    var xIncrement = xInc != null ? xInc : orientation == "across" ? 1 * multiplier : 0;
    var yIncrement = yInc != null ? yInc : orientation == "down" ? 1 * multiplier : 0;

    var parsedName = name.split("-");
    var x = parseInt(parsedName[0]) + xIncrement;
    var y = parseInt(parsedName[1]) + yIncrement;

    selectedOrientation = orientation;

    try {
        document.getElementsByName(`${x}-${y}`)[0].focus();
        return document.getElementsByName(`${x}-${y}`)[0].className;
    } catch {
        console.log("End of word reached");
    }
}

function KeyboardCommands(e, name, className) {
    switch (e.key) {
        case "ArrowRight":
            var newClass = SelectNextBox(name, className, 1, 0);
            if (newClass) SelectWord(newClass);
            break;

        case "ArrowLeft":
            var newClass = SelectNextBox(name, className, -1, 0);
            if (newClass) SelectWord(newClass);
            break;

        case "ArrowUp":
            var newClass = SelectNextBox(name, className, 0, -1);
            if (newClass) SelectWord(newClass);
            break;

        case "ArrowDown":
            var newClass = SelectNextBox(name, className, 0, 1);
            if (newClass) SelectWord(newClass);
            break;

        case "Backspace":
            e.preventDefault();
            var newClass = SelectNextBox(name, className, null, null, -1, false);
            if (newClass) SelectWord(newClass, true);

            document.getElementsByName(name)[0].value = "";
            break;
    }
}

var previousElements;
var previousClassname;

function SelectWord(className, isBackspace = false) {
    var classes = className.replace(" selected", "").replace(" first", "").split(" ");

    if (isBackspace) return;

    // No changes if clicking on same word
    if (classes.length == 1 && classes[0] == previousClassname) return;

    // Reset previously selected squares
    if (previousElements != undefined) {
        for (var i = 0; i < previousElements.length; i++) {
            previousElements[i].className = previousElements[i].className.replace(" selected", "");
        }
    }

    // Alternate between row and column where letter is in two words
    var index = 0;
    if (classes.includes(previousClassname)) {
        index = previousClassname == classes[0] ? 1 : 0;
    }

    // Highlight letters
    var wordElements = document.getElementsByClassName(classes[index]);
    for (var i = 0; i < wordElements.length; i++) {
        wordElements[i].className += " selected";
    }

    // Store element data
    previousElements = [];
    previousElements = wordElements;
    previousClassname = classes[index];

    selectedOrientation = classes[index].split("-")[1];
}

function ClueSelect(element, className) {
    var clues = document.getElementsByClassName("crosswordClue");

    for (var i = 0; i < clues.length; i++) {
        clues[i].style.background = "#ffffff";
    }

    element.style.background = "#888888";

    var classes = className.replace(" selected", "").replace(" first", "").split(" ");
    var index = 0;
    if (classes.includes(previousClassname)) {
        index = previousClassname == classes[0] ? 1 : 0;
    }

    console.log(classes[index]);
    document.getElementsByClassName(`${classes[index]} first`)[0].focus();

    SelectWord(className);
}

function ChangeColour() {
    var colourHex = document.getElementById("colourPicker").value;
    socket.send(JSON.stringify({ type: "colourChange", colourHex }));
}

function ChangeName() {
    var newName = document.getElementById("nameChanger").value;
    socket.send(JSON.stringify({ type: "nameChange", newName }));
}
