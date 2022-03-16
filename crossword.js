import crossword from "crossword-layout-generator";
import inputs from "./input.js";

const layout = crossword.generateLayout(inputs);

export function GenerateCrosswordHtml() {
    const rows = layout.rows;
    const cols = layout.cols;
    const output_json = layout.result;

    var html = `<div class='crossword' style='
                    grid-template-columns: repeat(${cols}, 1fr);
                    grid-template-rows: repeat(${rows}, 1fr);
                    width: ${32 * cols}px;
                    height: ${32 * rows}px'>`;

    var letterObjects = [];

    output_json.forEach((item) => {
        var xPos = item.startx;
        var yPos = item.starty;
        var xIncrement = item.orientation == "across" ? 1 : 0;
        var yIncrement = item.orientation == "down" ? 1 : 0;
        var direction = item.orientation == "across" ? "row" : "column";

        for (var i = 0; i < item.answer.length; i++) {
            var letterObject = {
                xPos,
                yPos,
                className: `${item.position}-${item.orientation}`,
                position: item.position,
                orientation: item.orientation,
                first: i == 0,
                positionIndicator: "",
            };

            var letterExists = false;
            letterObjects.forEach((obj) => {
                if (obj.xPos == letterObject.xPos && obj.yPos == letterObject.yPos) {
                    obj.className += ` ${item.position}-${item.orientation}`;

                    if (i == 0) {
                        obj.className += " first";
                        obj.positionIndicator = `<p class='posIndicator'>${item.position}</p>`;
                    }

                    letterExists = true;
                }
            });

            if (!letterExists) {
                letterObjects.push(letterObject);

                if (i == 0) {
                    letterObject.className += " first";
                    letterObject.positionIndicator = `<p class='posIndicator'>${item.position}</p>`;
                }
            }

            xPos += xIncrement;
            yPos += yIncrement;
        }
    });

    letterObjects.forEach((obj) => {
        var newHtml = `<span class='crossword-box'
                            style='grid-column: ${obj.xPos} / span 1; grid-row: ${obj.yPos} / span 1;' >
                            <input maxlength='1'
                                oninput='SendLetterUpdate(this.value, this.name, this.className)'
                                onclick='SelectWord(this.className)'
                                onkeydown='KeyboardCommands(event, this.name, this.className)'
                                name='${obj.xPos}-${obj.yPos}'
                                class='${obj.className}'/>
                            ${obj.positionIndicator}
                        </span>`;

        html += newHtml;
    });

    html += "</div>";

    return html;
}

export function GenerateCluesHtml() {
    var html = "<div class='cluesContainer'><div class='cluesColumn'><h4>Across</h4>";
    const outputJson = layout.result;

    outputJson.forEach((word) => {
        if (word.orientation == "across")
            html += `<a class="crosswordClue"
                        onclick="ClueSelect(this, '${word.position}-${word.orientation}')">
                        ${word.position}. ${word.clue}
                    </a>`;
    });

    html += "</div>";

    html += "<div class='cluesColumn'><h4>Down</h4>";

    outputJson.forEach((word) => {
        if (word.orientation == "down")
            html += `<a class="crosswordClue"
                onclick="ClueSelect(this, '${word.position}-${word.orientation}')">
                ${word.position}. ${word.clue}
            </a>`;
    });

    html += "</div></div>";

    return html;
}
