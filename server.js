import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { workerData } from "worker_threads";
import { WebSocketServer } from "ws";

import { GenerateCrosswordHtml } from "./crossword.js";

const app = express();
const httpServer = http.createServer(app);

const wss = new WebSocketServer({ server: httpServer });

const html = GenerateCrosswordHtml();

var cursorDict = {};

wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
        const parsedData = JSON.parse(data);

        switch (parsedData.type) {
            case "connection":
                console.log("RECEIVED: %s", parsedData.message);
                var type = "connection";
                ws.send(JSON.stringify({ type, html }));

                var guid = uuidv4();
                ws.guid = guid;

                wss.clients.forEach((client) => {
                    if (client != ws) client.send(JSON.stringify({ type: "newCursor", guid }));
                });
                break;

            case "letter":
                console.log("RECEIVED: %s", parsedData.letter, ws.url);

                var type = "letter";
                var letter = parsedData.letter;
                var name = parsedData.name;

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({ type, letter, name }));
                });
                break;

            case "mouseMove":
                console.log(parsedData.mouseX, parsedData.mouseY);
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

            default:
                console.log("A message was received but server was unable to parse data.");
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
