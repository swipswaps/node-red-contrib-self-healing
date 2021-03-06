const SentryLog = require("../utils/sentry-log.js");

module.exports = function (RED) {
  /*get my ip stuff*/
  const os = require("os");
  function getIp() {
    let ips = [];
    var interfaces = os.networkInterfaces();
    for (var i in interfaces) {
      interfaces[i].forEach(function (details) {
        details.interface = i;
        if (!details.internal) {
          ips.push(details.address);
        }
      });
    }
    return ips[0];
  }

  var master = false;
  var masterExists = false;
  var lastAlive = {};
  var ips = new Set();
  var thisip = 0;

  //last octect
  function getMajor(res) {
    return Array.from(res).reduce(function (a, b) {
      return Math.max(parseInt(a.split(".")[3]), parseInt(b.split(".")[3]));
    }, 0);
  }

  //Bully Algorithm
  function setMaster(send, node) {
    if (masterExists) {
      return;
    }

    let major = 0;

    if (ips.size > 0) {
      major = getMajor(ips);
    }

    if (ips.size == 0 && !master) {
      master = true;
      masterExists = true;
      node.status({ fill: "green", shape: "dot", text: "I'm Master" });
    } else if (major <= thisip && !master) {
      master = true;
      masterExists = true;
      node.status({ fill: "green", shape: "dot", text: "I'm Master" });
    } else {
      master = false;
      node.status({ fill: "yellow", shape: "dot", text: "Master is" });
    }

    send([
      { payload: { master: master } },
      { payload: Array.from(ips) },
      { payload: { sync: "ping", master: master } },
    ]);
  }

  function aliveBeat(timeout, send, node) {
    for (let [key, value] of Object.entries(lastAlive)) {
      //console.log(`${key}: ${JSON.stringity(value)}`);
      if (Date.now() - value.last >= timeout) {
        if (value.isMaster) {
          console.log("hey");
          masterExists = false;
          setMaster(send, node);
        }
        ips.delete(key.replace("-", "."));
        delete lastAlive[key];
      }
    }

    send([
      { payload: { master: master } },
      { payload: Array.from(ips) },
      { payload: { sync: "ping", master: master } },
    ]);
  }

  function RedundancyManager(config) {
    RED.nodes.createNode(this, config);
    SentryLog.sendMessage("redundancy was deployed");

    var node = this;
    let voting = "undefined";
    let alive = "undefined";
    let init = false;

    node.emit("input", { payload: "internal-sync" });

    node.status({ fill: "yellow", shape: "dot", text: "Sync in Progress" });

    node.on("input", function (msg, send, _done) {
      //update ip list
      if (typeof msg.hostip != "undefined") {
        lastAlive[msg.hostip.replace(".", "-")] = {
          last: Date.now(),
          isMaster: msg.payload.master,
        };
        ips.add(msg.hostip);
      }

      if (voting == "undefined" && alive == "undefined" && !init) {
        thisip = parseInt(getIp().split(".")[3]);

        master = false;
        masterExists = false;
        lastAlive = {};
        ips = new Set();
        thisip = 0;

        send([null, null, { payload: { sync: "ping", master: master } }]);
        voting = setInterval(
          setMaster,
          parseInt(config.frequency) * 1000,
          send,
          node
        );
        alive = setInterval(
          aliveBeat,
          parseInt(config.pingInterval) * 1000,
          parseInt(config.timeout) * 1000,
          send,
          node
        );
        init = true;
      }

      if (msg.payload.master && !master) {
        master = false;
        masterExists = true;
        node.status({
          fill: "yellow",
          shape: "dot",
          text: "Master is " + msg.hostip,
        });
      } else if (msg.payload.master && master && getMajor(ips) > thisip) {
        node.status({
          fill: "yellow",
          shape: "dot",
          text: "Master is " + msg.hostip,
        });
        master = false;
        masterExists = true;
      }
    });
  }

  RED.nodes.registerType("redundancy-manager", RedundancyManager);
};
