const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/crossword`);

socket.addEventListener("open", function (event) {
    const type = "connection";
    const message = "Connection has been established.";
    socket.send(JSON.stringify({ type, message }));
});

socket.addEventListener("message", function message(event) {
    var parsedData = JSON.parse(event.data);

    switch (parsedData.type) {
        case "connection":
            document.getElementById("crossword").innerHTML = parsedData.crosswordHtml;
            document.getElementById("clues").innerHTML = parsedData.cluesHtml;
            break;

        case "letter":
            console.log("New letter received: " + parsedData.letter);
            document.getElementsByName(parsedData.name)[0].value = parsedData.letter;
            break;

        case "newCursor":
            var cursor = document.createElement("div");
            cursor.className = "cursor";
            cursor.id = parsedData.guid;

            var cursorName = document.createElement("p");
            cursorName.className = "cursorName";
            cursorName.appendChild(document.createTextNode("Player"));

            cursor.appendChild(cursorName);

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

        case "colourChange":
            console.log(parsedData.colourHex);
            var cursor = document.getElementById(parsedData.guid);
            cursor.style.setProperty("border-bottom", `20px solid ${parsedData.colourHex}`);
            cursor.style.color = parsedData.colourHex;
            break;

        case "nameChange":
            var cursor = document.getElementById(parsedData.guid);
            var cursorName = cursor.firstChild;
            cursorName.innerHTML = parsedData.newName;
            break;

        default:
            console.log("Unable to parse message sent by server of type " + parsedData.type);
    }
});
