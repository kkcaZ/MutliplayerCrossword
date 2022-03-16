import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { workerData } from "worker_threads";
import { WebSocketServer } from "ws";

import { GenerateCluesHtml, GenerateCrosswordHtml } from "./crossword.js";

const app = express();
const httpServer = http.createServer(app);

const wss = new WebSocketServer({ server: httpServer, path: "/crossword" });

const crosswordHtml = GenerateCrosswordHtml();
const cluesHtml = GenerateCluesHtml();

var cursorDict = {};

wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
        const parsedData = JSON.parse(data);

        switch (parsedData.type) {
            case "connection":
                console.log("RECEIVED: %s", parsedData.message);

                // Send initial connection information
                ws.send(JSON.stringify({ type: "connection", crosswordHtml, cluesHtml }));

                // Generate unique ID for new client
                var guid = uuidv4();
                ws.guid = guid;

                // Add new client's cursor to other clients
                wss.clients.forEach((client) => {
                    if (client != ws) client.send(JSON.stringify({ type: "newCursor", guid }));
                });

                // Create all currently existing cursors on new client
                wss.clients.forEach((client) => {
                    if (client != ws) ws.send(JSON.stringify({ type: "newCursor", guid: client.guid }));
                });
                break;

            case "letter":
                console.log("RECEIVED: %s", parsedData.letter);

                var type = "letter";
                var letter = parsedData.letter;
                var name = parsedData.name;

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({ type, letter, name }));
                });
                break;

            case "mouseMove":
                var type = "mouseMove";

                wss.clients.forEach((client) => {
                    if (client != ws)
                        client.send(
                            JSON.stringify({
                                type,
                                guid: ws.guid,
                                mouseX: parsedData.mouseX,
                                mouseY: parsedData.mouseY,
                            })
                        );
                });
                break;

            case "colourChange":
                console.log("Colour received: " + parsedData.colourHex);
                wss.clients.forEach((client) => {
                    if (client != ws)
                        client.send(
                            JSON.stringify({
                                type: "colourChange",
                                guid: ws.guid,
                                colourHex: parsedData.colourHex,
                            })
                        );
                });
                break;

            case "nameChange":
                console.log("Name received: " + parsedData.newName);
                wss.clients.forEach((client) => {
                    if (client != ws)
                        client.send(
                            JSON.stringify({
                                type: "nameChange",
                                guid: ws.guid,
                                newName: parsedData.newName,
                            })
                        );
                });
                break;

            default:
                console.log("A message was received but server was unable to parse data");
        }
    });

    ws.on("close", function close() {
        wss.clients.forEach((client) => {
            if (client != ws) client.send(JSON.stringify({ type: "deleteCursor", guid: ws.guid }));
        });
    });
});

app.use(express.static("client"));

httpServer.listen(8080, () => {
    console.log("server started at http://localhost:8080");
});
