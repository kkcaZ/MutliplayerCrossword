window.addEventListener("mousemove", (e) => throttle(() => SendMousePosition(e), 100));

function SendMousePosition(e) {
    const type = "mouseMove";
    socket.send(JSON.stringify({ type: type, mouseX: e.clientX, mouseY: e.clientY }));
}
