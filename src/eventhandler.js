var async = require("async");
var auth = require("basic-auth");
var http = require("http");

var rfs = require("fs");
var rlogger = rfs.createWriteStream('./logs/rSessionID.txt', {flags:'a'});

var sfs = require("fs");
var slogger = sfs.createWriteStream('./logs/sSessionID.txt', {flags:'a'});

var asfs = require("fs");
var aslogger = asfs.createWriteStream('./logs/sAudioSessionID.txt', {flags:'a'});

var arfs = require("fs");
var arlogger = arfs.createWriteStream('./logs/rAudioSessionID.txt', {flags:'a'});

var config = require("./settings.js");
var connection = null;

const EventEmitter = require("events");
const ListenEmitter = new EventEmitter();


async.series([
	function(callback) {
		http.createServer(function (req, res) {
			if(!config.http || !config.http.auth || !config.http.auth.username || !config.http.auth.password) {
			} else {
				var credentials = auth(req);
				if(!credentials || credentials.name !== config.http.auth.username
						|| credentials.pass !== config.http.auth.password) {
					res.statusCode = 401;
					res.setHeader('WWW-Authenticate', 'Basic realm="Janus events DB backend"');
					res.end();
					return;
				}
			}
			var body = "";
			req.on("data", function (chunk) {
				body += chunk;
			});
			req.on("end", function () {
				try {
					var json = JSON.parse(body);
					handleEvent(json);
				} catch(e) {
					console.error("Error parsing event:", e);
				}
				res.writeHead(200);
				res.end();
			});
		}).on('error', function(err) {
			console.error("Error starting HTTP server:", err);
			callback(err);
		}).listen(config.http.port, function() {
			callback();
		});
	}
],

function(err, results) {
	if(err) {
		console.log(err);
		process.exit(1);
	}
	console.log("Janus events backend started");
});

function handleEvent(json) {
	if(Array.isArray(json)) {
		for(var i=0; i<json.length; i++) {
			handleEvent(json[i]);
		}
		return;
	}
	if(json.type === 1) {
		console.log(" Session Related Event ");
		//console.log(json);
		// Session event
		var sessionId = json["session_id"];
		var event = json["event"]["name"];
		var when = new Date(json["timestamp"]/1000);
		console.log("Session ID " + sessionId);
        console.log("Event " + event);
        console.log("When " + when);

		if(sessionId !== undefined){
		var sessionWrite = "Session Event - Session ID: ".concat(sessionId);
		
		rlogger.write(sessionWrite+"\r\n");
		}
        
	} else if(json.type === 2) {
		console.log(" Handle Related Event ");
		//console.log(json);
		// Handle event
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var event = json["event"]["name"];
		var plugin = json["event"]["plugin"];
		var when = new Date(json["timestamp"]/1000);
		
        console.log("Session ID " + sessionId);
        console.log("Event " + event);
        console.log("When " + when);
        console.log("Handle ID" + handleId);
        console.log("Plugin" + plugin);

		if(sessionId !== undefined){
		var sessionWrite = "Handle Event - Session ID: ".concat(sessionId);
		rlogger.write(sessionWrite+"\r\n");
		}

	} else if(json.type === 8) {
		console.log(" SDP Offer/Answer Related Event ");
		//console.log(json);
		// JSEP event
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var remote = json["event"]["owner"] === "remote";
		var offer = json["event"]["jsep"]["type"] === "offer";
		var sdp = json["event"]["jsep"]["sdp"];
		var when = new Date(json["timestamp"]/1000);
		
        console.log("Session ID " + sessionId);
        console.log("Event " + event);
        console.log("When " + when);
        console.log("Remote" + remote);
        console.log("Offer" + offer);
        console.log("SDP" + sdp);

		if(sessionId !== undefined){
		var sessionWrite = "SDP Event - Session ID: ".concat(sessionId);
		rlogger.write(sessionWrite+"\r\n");
		}

	} else if(json.type === 16) {
		console.log(" WebRTC Stat Events Related Event ");
		//console.log(json);
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var streamId = json["event"]["stream_id"];
		var componentId = json["event"]["component_id"];
		var when = new Date(json["timestamp"]/1000);
		if(json["event"]["ice"]) {
			var state = json["event"]["ice"];
		} else if(json["event"]["selected-pair"]) {
			var pair = json["event"]["selected-pair"];
			
		} else if(json["event"]["dtls"]) {
			var state = json["event"]["dtls"];
			
		} else if(json["event"]["connection"]) {
			var state = json["event"]["connection"];
			
		} else {
			console.error("Unsupported WebRTC event?");
		}
		if(sessionId !== undefined){
		var sessionWrite = "WebRTC Event - Session ID: ".concat(sessionId);
		rlogger.write(sessionWrite+"\r\n");
		}

	} else if(json.type === 32) {
		console.log(" Media Related Event ");
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var medium = json["event"]["media"];
		var when = new Date(json["timestamp"]/1000);
		if(json["event"]["receiving"] !== null && json["event"]["receiving"] !== undefined) {
			var receiving = json["event"]["receiving"] === true;

//            console.log("Media Event");
//            console.log("Receiving " + receiving);
//            console.log("Medium " + medium);
			
		} else if(json["event"]["base"] !== null && json["event"]["base"] !== undefined) {
			var base = json["event"]["base"];
			var lsr = json["event"]["lsr"];
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
			
/*          console.log("Janus Statistics");
            console.log("Medium " + medium);
            console.log("Receiving" + receiving);
            console.log("Base " + base);
            console.log("LSR " + lsr);
            console.log("LostLocal " + lostlocal);
            console.log("LostRemote " + lostremote);
            console.log("JitterLocal " + jitterlocal);
            console.log("JitterRemote" + jitterremote);
            console.log("Packet Sent " + packetssent);
            console.log("Packet Receive " + packetsrecv);
            console.log("Bytes Sent " + bytessent);
            console.log("Bytes Received " + bytesrecv);
            console.log("NACK Sent " + nackssent);
            console.log("NAVK Received " + nacksrecv);
*/


		} else {
			console.error("Unsupported media event?");
		}
		
		if (medium == "video" && packetssent == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
			//slogger.write(sessionWrite+"\r\n");
			//slogger.write(when+"\r\n");
		}
		if (medium == "video" && packetsrecv == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
			//rlogger.write(sessionWrite+"\r\n");
			//rlogger.write(when+"\r\n");
		}
		if (medium == "audio" && packetssent == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
			//aslogger.write(sessionWrite+"\r\n");
			//aslogger.write(when+"\r\n");
			
			ListenEmitter.emit('Audioupdate','Audioupdate1');
		}
		if (medium == "audio" && packetsrecv == "0"&& (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
			//arlogger.write(sessionWrite+"\r\n");
			//arlogger.write(when+"\r\n");
			ListenEmitter.emit('Audioupdate','Audioupdate2');
		}
		if (lostlocal > 0 && medium == "audio"){
			console.log("Lost is More");
			console.log(json);
			console.log("NACK Sent " + nackssent);
            console.log("NAVK Received " + nacksrecv);
			ListenEmitter.emit('Audioupdate','Audioupdate3');

		}


	} else if(json.type === 64 || json.type === 128) {
		console.log(" Plugin OR Transport Related Event ");
		//console.log(json);
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var plugin = json["event"]["plugin"];
		var event = JSON.stringify(json["event"]["data"]);
		var when = new Date(json["timestamp"]/1000);

		if(sessionId !== undefined){
		var sessionWrite = "Plugin Event -Session ID: ".concat(sessionId);
		rlogger.write(sessionWrite+"\r\n");
		}
		
	} else if(json.type === 256) {
		console.log(" Core Event Related Event ");
		//console.log(json);
		var name = "status";
		var event = json["event"][name];
		var signum = json["event"]["signum"];
		if(signum)
			event += " (" + signum + ")";
		var when = new Date(json["timestamp"]/1000);
		
		if(sessionId !== undefined){
		var sessionWrite = "Core Event - Session ID: ".concat(sessionId);
		rlogger.write(sessionWrite+"\r\n");
		}

	} else {
		console.warn("Unsupported event type " + json.type);
	}
}
