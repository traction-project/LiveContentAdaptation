# TRACTION Live Content Adaptation Algorithm

This repository contains the Live Content Adaptation Algorithm for the TRACTION EU-project. It is used to select the appropriate video resolution and bitrates during live content streaming to guarantee viewers’ good QoE. The algorithm considers different network condition parameters such as bandwidth, packet loss, and jitter. Further, the algorithm tries to ensure the highest bitrate for audio, this is a key feature for performing and viewing opera arts pieces, while adapting the video quality given the bandwidth constraints. This is because many studies have shown that ensuring high audio quality can have a positive impact on viewers' QoE.

<img src="https://www.traction-project.eu/wp-content/uploads/sites/3/2020/02/Logo-cabecera-Traction.png" align="left"/><em>This algorithm was originally developed as part of the <a href="https://www.traction-project.eu/">TRACTION</a> project, funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> research and innovation programme under grant agreement No. 870610.</em>

## Setup

The TRACTION Live Content Adaptation Algorithm is deployed with the WebRTC. The deployment was done using [Janus WebRTC server]([url](https://janus.conf.meetecho.com/)). The algorithm is implemented in `/LiveContentAdaptation/src`. The algorithm make use of the videoroom plugin of Janus. The file containing the algorithm's logic is `streamadapt.js`.
To use the Live Content Adaptation Algorithm, first you need to setup a Janus WebRTC server. The Admin/Monitor APIs should be enabled at the Janus WebRTC server. To include the algorithm, make sure to add the janus.js, streamadapt.js, bandwidthhandler.js, and methods.js to the end of the body. A sample html file with single publisher stream is present in `/LiveContentAdaptation/sample/`

```
<body>
  ...
<script type="text/javascript" src="janus.js" ></script>
<script type="text/javascript" src="streamadapt.js"></script>
<script type="text/javascript" src="bandwidthhandler.js"></script>
<script type="text/javascript" src="methods.js"></script>
</body>
```
Now, initialise the janus server name in the streamadapt.js. The janusServer and server attribute should contain the link to the janus server name and the port.

```
var janusServer = "dummy.janusserver.details";
var server = null;
server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus"; 
```

## Data Collection

The janus sever API enables the collection of some network metrics such as:

```
var lostlocal = json["event"]["lost"];
var lostremote = json["event"]["lost-by-remote"];
var jitterlocal = json["event"]["jitter-local"];
var jitterremote = json["event"]["jitter-remote"];
var packetssent = json["event"]["packets-sent"];
var packetsrecv = json["event"]["packets-received"];
var bytessent = json["event"]["bytes-sent"];
var bytesrecv = json["event"]["bytes-received"];
var nackssent = json["event"]["nacks-sent"];
var nacksrecv = json["event"]["nacks-received"]; 
```

event denotes the different even types (i.e., session, media, SDP, WebRTC). These metrics along with others can help the adaptation algorithm.

## Adding/ modifying the Live Content Adaptation Algorithm

To be able to add or modify the algorithm, you need to do the following steps:
1.	Install [node.js]([url](http://nodejs.org/)).
2.	Checkout the project repository (`git clone https://github.com/traction-project/LiveContentAdaptation.git`).
3.	Install dependencies (`npm install`).
4.	Add or make changes to `streamadapt.js`, `janus.js`, and related files.
5.	Build, watch file changes, and launch samples page (`npm run start`).

## Janus WebRTC Documentation

[Full Documentation]([url](https://janus.conf.meetecho.com/docs/)) is available describing all methods, interfaces, properties, and events.


## Documentation

The documentation is available here: https://traction-project.github.io/LiveContentAdaptation

