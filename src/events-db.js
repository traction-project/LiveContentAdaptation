var async = require("async");
var auth = require("basic-auth");
var http = require("http");
var mysql = require("mysql");

var config = require("./settings.js");
var connection = null;

async.series([
	// 1. REST API server (for requests from the Frontends, typically wrapper-related)
	function(callback) {
		// Connect to the DB
		connection = mysql.createConnection(config.db);
		connection.connect(function(err) {
			if(err) {
				console.error("Error connecting to DB: " + err.stack);
				callback(err);
				return;
			}
			console.log("Connected to DB:", config.db.database);
			callback();
		});
	},
	function(callback) {
		// Create the HTTP backend
		http.createServer(function (req, res) {
			if(!config.http || !config.http.auth || !config.http.auth.username || !config.http.auth.password) {
				// No authentication required
			} else {
				// Authentication required, check the credentials
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
				// Got an event, parse and handle it
				try {
					var json = JSON.parse(body);
					handleEvent(json);
				} catch(e) {
					console.error("Error parsing event:", e);
				}
				// Done here
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
	// We're up and running
	console.log("Janus events DB backend started");
});

function handleEvent(json) {
	if(Array.isArray(json)) {
		// We got an array: it means we have multiple events, iterate on all of them
		for(var i=0; i<json.length; i++) {
			handleEvent(json[i]);
		}
		return;
	}
	// Depending on the event, save it in a different table
	console.log(json);
	if(json.type === 1) {
		// Session event
		var sessionId = json["session_id"];
		var event = json["event"]["name"];
		var when = new Date(json["timestamp"]/1000);
		// Write to DB
		var insert = { session: sessionId, event: event, timestamp: when };
		var query = connection.query('INSERT INTO sessions SET ?', insert, function(err, result) {
			if(err) {
				console.error("Error saving session event to DB...", err);
				return;
			}
		});
	} else if(json.type === 2) {
		// Handle event
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var event = json["event"]["name"];
		var plugin = json["event"]["plugin"];
		var when = new Date(json["timestamp"]/1000);
		// Write to DB
		var insert = { session: sessionId, handle: handleId, event: event, plugin: plugin, timestamp: when };
		var query = connection.query('INSERT INTO handles SET ?', insert, function(err, result) {
			if(err) {
				console.error("Error saving handle event to DB...", err);
				return;
			}
		});
	} else if(json.type === 8) {
		// JSEP event
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var remote = json["event"]["owner"] === "remote";
		var offer = json["event"]["jsep"]["type"] === "offer";
		var sdp = json["event"]["jsep"]["sdp"];
		var when = new Date(json["timestamp"]/1000);
		// Write to DB
		var insert = { session: sessionId, handle: handleId, remote: remote, offer: offer, sdp: sdp, timestamp: when };
		var query = connection.query('INSERT INTO sdps SET ?', insert, function(err, result) {
			if(err) {
				console.error("Error saving jsep event to DB...", err);
				return;
			}
		});
	} else if(json.type === 16) {
		// WebRTC event (can result in writes to different tables)
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var streamId = json["event"]["stream_id"];
		var componentId = json["event"]["component_id"];
		var when = new Date(json["timestamp"]/1000);
		if(json["event"]["ice"]) {
			// ICE state event
			var state = json["event"]["ice"];
			// Write to DB
			var insert = { session: sessionId, handle: handleId, stream: streamId, component: componentId, state: state, timestamp: when };
			var query = connection.query('INSERT INTO ice SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving webrtc/ice event to DB...", err);
					return;
				}
			});
		} else if(json["event"]["selected-pair"]) {
			// ICE selected-pair event
			var pair = json["event"]["selected-pair"];
			// Write to DB
			var insert = { session: sessionId, handle: handleId, stream: streamId, component: componentId, selected: pair, timestamp: when };
			var query = connection.query('INSERT INTO selectedpairs SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving webrtc/selected-pair event to DB...", err);
					return;
				}
			});
		} else if(json["event"]["dtls"]) {
			// DTLS state event
			var state = json["event"]["dtls"];
			// Write to DB
			var insert = { session: sessionId, handle: handleId, state: state, timestamp: when };
			var query = connection.query('INSERT INTO dtls SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving webrtc/dtls event to DB...", err);
					return;
				}
			});
		} else if(json["event"]["connection"]) {
			// Connection (up/down) event
			var state = json["event"]["connection"];
			// Write to DB
			var insert = { session: sessionId, handle: handleId, state: state, timestamp: when };
			var query = connection.query('INSERT INTO connections SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving webrtc/connection event to DB...", err);
					return;
				}
			});
		} else {
			console.error("Unsupported WebRTC event?");
		}
	} else if(json.type === 32) {
		// Media event (can result in writes to different tables)
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var medium = json["event"]["media"];
		var when = new Date(json["timestamp"]/1000);
		if(json["event"]["receiving"] !== null && json["event"]["receiving"] !== undefined) {
			// Media receiving state event
			var receiving = json["event"]["receiving"] === true;
			// Write to DB
			var insert = { session: sessionId, handle: handleId, medium: medium, receiving: receiving, timestamp: when };
			var query = connection.query('INSERT INTO media SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving media event to DB...", err);
					return;
				}
			});
		} else if(json["event"]["base"] !== null && json["event"]["base"] !== undefined) {
			// Statistics event
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
			// Write to DB
			var insert = { session: sessionId, handle: handleId, medium: medium,
				base: base, lsr: lsr, lostlocal: lostlocal, lostremote: lostremote,
				jitterlocal: jitterlocal, jitterremote: jitterremote,
				packetssent: packetssent, packetsrecv: packetsrecv,
				bytessent: bytessent, bytesrecv: bytesrecv,
				nackssent: nackssent, nacksrecv: nacksrecv,
				timestamp: when };
			var query = connection.query('INSERT INTO stats SET ?', insert, function(err, result) {
				if(err) {
					console.error("Error saving stats event to DB...", err);
					return;
				}
			});
		} else {
			console.error("Unsupported media event?");
		}
	} else if(json.type === 64 || json.type === 128) {
		// Plugin or transport event
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var plugin = json["event"]["plugin"];
		var event = JSON.stringify(json["event"]["data"]);
		var when = new Date(json["timestamp"]/1000);
		// Write to DB
		var insert = { session: sessionId, handle: handleId, plugin: plugin, event: event, timestamp: when };
		var query = connection.query('INSERT INTO ' + (json.type === 64 ? 'plugins' : 'transports') + ' SET ?', insert, function(err, result) {
			if(err) {
				console.error("Error saving " + (json.type === 64 ? 'plugin' : 'transport') + " event to DB...", err);
				return;
			}
		});
	} else if(json.type === 256) {
		// Core event
		var name = "status";
		var event = json["event"][name];
		var signum = json["event"]["signum"];
		if(signum)
			event += " (" + signum + ")";
		var when = new Date(json["timestamp"]/1000);
		// Write to DB
		var insert = { name: name, value: event, timestamp: when };
		var query = connection.query('INSERT INTO core SET ?', insert, function(err, result) {
			if(err) {
				console.error("Error saving core event to DB...", err);
				return;
			}
		});
	} else {
		console.warn("Unsupported event type " + json.type);
	}
}
