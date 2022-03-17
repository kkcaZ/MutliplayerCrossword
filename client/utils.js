// Throttle
let throttlePause;
const throttle = (callback, delay) => {
    if (throttlePause) return;
    throttlePause = true;

    setTimeout(() => {
        callback();
        throttlePause = false;
    }, delay);
};
