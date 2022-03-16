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
    socket.send(JSON.stringify({ type: type, mouseX: e.clientX, mouseY: e.clientY }));
}
