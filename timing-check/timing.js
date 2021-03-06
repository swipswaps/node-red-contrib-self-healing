const SentryLog = require("../utils/sentry-log.js");

module.exports = function (RED) {
  function Timing(config) {
    RED.nodes.createNode(this, config);
    SentryLog.sendMessage("timing was deployed");

    let lastTimestamp = null;
    const periodBetweenReadings = config.period * 1000; //seconds to milliseconds
    let intervalMargin = config.margin;
    let slidingWindow = [];
    const slidingWindowLength = config.slidingWindowLength;

    const maximumPeriod =
      periodBetweenReadings + intervalMargin * periodBetweenReadings;
    const minimumPeriod =
      periodBetweenReadings - intervalMargin * periodBetweenReadings;

    let node = this;

    this.on("input", (msg) => {
      const currentTimestamp = Date.now();
      msg.timestamp = currentTimestamp;

      addToWindow(msg, slidingWindow, slidingWindowLength);

      if (lastTimestamp == null) {
        node.status({
          fill: "green",
          shape: "dot",
          text: "First message",
        });

        node.send([msg, null, null]);
      } else {
        const intervalPeriod = determineWindowAverage(slidingWindow);

        if (intervalPeriod > maximumPeriod) {
          node.status({
            fill: "yellow",
            shape: "dot",
            text: "Too Slow",
          });

          node.send([null, null, msg]);
        } else if (intervalPeriod < minimumPeriod) {
          node.status({
            fill: "yellow",
            shape: "dot",
            text: "Too Fast",
          });

          node.send([null, msg, null]);
        } else {
          node.status({
            fill: "green",
            shape: "dot",
            text: "Normal",
          });

          node.send([msg, null, null]);
        }
      }
      lastTimestamp = currentTimestamp;
    });
  }

  RED.nodes.registerType("timing", Timing);
};

function addToWindow(msg, slidingWindow, slidingWindowLength) {
  if (slidingWindow.length == slidingWindowLength) {
    slidingWindow.shift();
  }

  slidingWindow.push(msg);
}

function determineWindowAverage(slidingWindow) {
  let sum = 0;

  for (let i = 1; i < slidingWindow.length; i++) {
    const intervalPeriod =
      slidingWindow[i].timestamp - slidingWindow[i - 1].timestamp;

    sum += intervalPeriod;
  }

  return sum / (slidingWindow.length - 1);
}
