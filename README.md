# SHEN: Self-Healing Extensions for Node-RED

![Logo](https://i.imgur.com/AynqSQm.png)

## node-red-contrib-self-healing

[![DOI](https://zenodo.org/badge/doi/10.1007/978-3-030-50426-7_27.svg)](http://dx.doi.org/10.1007/978-3-030-50426-7_27)
[![npm version badge](https://img.shields.io/npm/v/node-red-contrib-self-healing.svg)](https://www.npmjs.org/package/node-red-contrib-self-healing)
[![downloads badge](https://img.shields.io/npm/dm/node-red-contrib-self-healing.svg)](https://www.npmjs.com/package/node-red-contrib-self-healing)
[![license: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### **! Under Active Development ! **

A collection of nodes for making Node-RED more resilient by adding self-healing capabilities. This project is at an early development stage.

This work is part of an ongoing PhD thesis in Software Engineering and Internet-of-Things at the Faculty of Engineering, University of Porto (FEUP). Work supervised by Prof. [Hugo Sereno Ferreia](http://hugosereno.eu/) and Prof. [João Pascoal Faria](https://sigarra.up.pt/feup/en/FUNC_GERAL.FORMVIEW?P_CODIGO=210006). With collaboration of Prof. [André Restivo](https://web.fe.up.pt/~arestivo/page/).

## Available Nodes

### :package: balancing

Balances the distribution of messages through multiple outputs using three different strategies: Round Robin, Weighted Round Robin and Random.

### :package: checkpoint

Acts between a node sending a message to another, storing the last one in local context and resending it after restarts, if it's within a specified time to live.

### :package: compensate

Compensate missing values (detected by disruptions on the periodicity of incoming mesages) with a pre-defined strategy (e.g. average of the last 10 readings, last value or maximum value of the last 10 readings).

It can also provide a "confidence" level on the compensated values. Confidence metric results from an `eval` of a valid JS expression. Both compensated values counter (`compensatedCounter`) and history values (`history`) can be used. Example: `(1 / compensatedCounter) >= 1 ? 1 : (1 / compensatedCounter)`.

### :package: debounce

Delay a command (message) in order to meet the actuator response capacity (e.g. avoid overload). Similar to [rate-limit-messages](https://cookbook.nodered.org/basic/rate-limit-messages), but with different strategies.

### :package: flow-control

Enable and disable Node-RED flows during runtime (local or remote instances, using the available REST API).

### :package: heartbeat

Provides a heartbeat probe for MQTT and HTTP. For HTTP an endpoint must be provided, for MQTT an `MQTT in` node should be connected.

### :package: kalman-noise-filter

Kalman noise filter based on the work of Bulten et al.

> R models the process noise and describes how noisy our system internally is. Or, in other words, how much noise can we expect from the system itself? Our system is constant we can set this to a (very) low value. Q resembles the measurement noise; how much noise is caused by our measurements? As we expect that our measurements will contain most of the noise, it makes sense to set this parameter to a high number (especially in comparison to the process noise).

> In real life scenario's you usually make an estimate of R and Q based on measurements or domain knowledge. For this example we assume we know the noise levels.

> W. Bulten, A. C. V. Rossum and W. F. G. Haselager, **Human SLAM, Indoor Localisation of Devices and Users,** 2016 IEEE First International Conference on Internet-of-Things Design and Implementation (IoTDI), Berlin, 2016, pp. 211-222, doi: 10.1109/IoTDI.2015.19.

### :package: network-aware

Continuosly scan the network to find new or removed devices. Can be combined with a `device-registry`.

### :package: redundancy

Manage redundant instances of Node-RED (setting a master instance). Works only on the local network (uses [n2n](https://flows.nodered.org/node/node-red-contrib-n2n) communication).

### :package: readings-watcher

Drop values if they are in or out of a given threshold (e.g. two close temperature readings).

### :package: replication-voter

Picks a value (e.g. sensor reading) from an array values based on a pre-defined majority.

### :package: resource-monitor

Monitors system resources, ranging from battery levels to resources usage.

### :package: threshold-check

Checks for reading (value) sanity (e.g. checks if the reading is between the sensor possible output values).

### :package: timeout

Checks if an action occurs within a given time frame. This node is not implemented by this package, given that some implementations can already be found in Node-RED's contribution library, such as: [node-red-contrib-timeout](https://flows.nodered.org/node/node-red-contrib-timeout) and [node-red-contrib-mytimeout](https://flows.nodered.org/node/node-red-contrib-mytimeout).

### :package: timing-check

Checks for timing issues on data inputs. There are 3 outputs that refer to data comming on expected time, too slow or too fast. A frequency in seconds along with a margin (float: 0-1) should be provided.

## Todo Nodes

### :package: action-audit

Makes sure that a command is sent and received by an sensor/actuator pair.

### :package: device-registry

Store a list of the available devices in the network.

### :package: internal-state

Stores the internal state of all flows, making it available to different Node-RED instances.

## Known Issues

- ~~Lack of description on how to configure nodes.~~
- ~~No standardization on inputs and outputs.~~
- ~~Lack of proper unit testing. Some edge cases still break the _node's_ functionality.~~

## How to Use

- Installing Node-RED (Official Docs): [https://nodered.org/docs/getting-started/](https://nodered.org/docs/getting-started/)

### Installing node-red-contrib-self-healing for development

- Clone or download this repository.
- In your node-red user directory, typically ~/.node-red (in Windows something like `C:\Users\<my_name>\.node_red`), run: `npm install <path_to_downloaded_folder>/node-red-contrib-self-healing`
  - Note: this will come with [Sentry](https://sentry.io/) support, providing some app telemetry. In order to disable it, add the `--no-optional` flag. Since it's an optional dependency, Sentry won't be installed.
- Start (or restart) Node-RED.
- Nodes should be available under the SHEN tab of the _node palette_.

### Running tests

- Unit tests for every node: `npm run test`
- Unit tests with coverage: `npm run test-coverage`
- Mutation tests: `npm run mutate`
- Property based tests: `npm run test-pbt`
- Acceptance tests: `npm run test-acceptance`
- Static analysis with sonarqube (requires docker): `npm run sonar-server` then `npm run sonar-scanner <path-to-node-js-file>`

### Helper documentation

- [Installing Costum Nodes -- Official Documentation](https://nodered.org/docs/creating-nodes/first-node#testing-your-node-in-node-red)

### Citing this Work

If you find this code useful in your research, please consider citing:

    @inproceedings{DiasICCS2020,
        author="Dias, Joao Pedro and Lima, Bruno and Faria, Joao Pascoal and Restivo, Andre and Ferreira, Hugo Sereno",
        editor="Krzhizhanovskaya, Valeria V. and Zavodszky, Gabor and Lees, Michael H. and Dongarra, Jack J. and Sloot, Peter M. A. and Brissos, Sergio and Teixeira, Joao",
        title="Visual Self-healing Modelling for Reliable Internet-of-Things Systems",
        booktitle="Computational Science -- ICCS 2020",
        year="2020",
        publisher="Springer International Publishing",
        address="Cham",
        pages="357--370",
        isbn="978-3-030-50426-7"
    }
