const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("open", function (event) {
    const type = "connection";
    const message = "Connection has been established.";
    socket.send(JSON.stringify({ type, message }));
});

socket.addEventListener("message", function message(event) {
    var parsedData = JSON.parse(event.data);

    switch (parsedData.type) {
        case "connection":
            document.getElementById("crossword").innerHTML = parsedData.html;
            break;

        case "letter":
            console.log("New letter received: " + parsedData.letter);
            document.getElementsByName(parsedData.name)[0].value = parsedData.letter;
            break;

        case "newCursor":
            var cursor = document.createElement("img");
            cursor.src = "./cursor.png";
            cursor.className = "cursor";
            cursor.id = parsedData.guid;
            document.body.appendChild(cursor);
            break;

        case "deleteCursor":
            document.getElementById(parsedData.guid).remove();
            break;

        case "mouseMove":
            var cursor = document.getElementById(parsedData.guid);
            cursor.style.top = parsedData.mouseY + "px";
            cursor.style.left = parsedData.mouseX + "px";
            break;

        default:
            console.log("Unable to parse message sent by server of type " + parsedData.type);
    }
});

window.addEventListener("mousemove", (e) => throttle(() => SendMousePosition(e), 100));

// initialize throttlePause variable outside throttle function
let throttlePause;

const throttle = (callback, time) => {
    // don't run the function if throttlePause is true
    if (throttlePause) return;

    // set throttlePause to true after the if condition. This allows the function to be run once
    throttlePause = true;

    // setTimeout runs the callback within the specified time
    setTimeout(() => {
        callback();

        // throttlePause is set to false once the function has been called, allowing the throttle function to loop
        throttlePause = false;
    }, time);
};

let inThrottle;
function SendMousePosition(e) {
    const type = "mouseMove";
    socket.send(JSON.stringify({ type: type, mouseX: e.offsetX, mouseY: e.offsetY }));
}

var previousOrientation;

function SendLetterUpdate(letter, name, className) {
    const type = "letter";
    socket.send(JSON.stringify({ type, letter, name }));

    SelectNextBox(name, className);
}

function SelectNextBox(name, className, xInc = null, yInc = null) {
    var classes = className.split(" ");
    classes.forEach((c) => {
        console.log(c.split("-"));
    });

    var orientation;
    if (document.getElementsByClassName(classes[0])[0].className.includes("selected"))
        orientation = classes[0].split("-")[1];
    else orientation = classes[1].split("-")[1];

    var xIncrement = xInc != null ? xInc : orientation == "across" ? 1 : 0;
    var yIncrement = yInc != null ? yInc : orientation == "down" ? 1 : 0;

    var parsedName = name.split("-");
    var x = parseInt(parsedName[0]) + xIncrement;
    var y = parseInt(parsedName[1]) + yIncrement;

    console.log(orientation, x + "-" + y);

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
    }
}

var previousElements;
var previousClassname;

function SelectWord(className) {
    var classes = className.replace(" selected", "").split(" ");

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
}
