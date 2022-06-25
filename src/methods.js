const userAction = async() => {
    const response = await fetch('http://dummy.janusserver.details/get');
    const myJson = await response.json();
    handleEvent(myJson);
}


function mySleep(millisecond){
	var start = new Date().getTime();
	for (var i=0;i<1e7;i++){
		if((new Date().getTime()- start)>millisecond){
			break;
		}
	}
}

function handleEvent(json) {
	if(Array.isArray(json)) {
		for(var i=0; i<json.length; i++) {
			handleEvent(json[i]);
		}
		return;
	}
	if(json.type === 1) {
		console.log(" Session Related Event ");
		var sessionId = json["session_id"];
		var event = json["event"]["name"];
		var when = new Date(json["timestamp"]/1000);
		console.log("Session ID " + sessionId);
        console.log("Event " + event);
        console.log("When " + when);

		if(sessionId !== undefined){
		var sessionWrite = "Session Event - Session ID: ".concat(sessionId);
		
		
		}
        
	} else if(json.type === 2) {
		console.log(" Handle Related Event ");
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
		
		}

	} else if(json.type === 8) {
		console.log(" SDP Offer/Answer Related Event ");
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
		
		}

	} else if(json.type === 16) {
		console.log(" WebRTC Stat Events Related Event ");
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
		}
	} else if(json.type === 32) {
		console.log(" Media Related Event ");
		
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var medium = json["event"]["media"];
		var when = new Date(json["timestamp"]/1000);
		if(json["event"]["receiving"] !== null && json["event"]["receiving"] !== undefined) {
			var receiving = json["event"]["receiving"] === true;
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

///*            
            console.log("Network Statistics");
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
//*/
			//return ()

		} else {
			console.error("Unsupported media event?");
		}
		
		if (medium == "video" && packetssent == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
		}
		if (medium == "video" && packetsrecv == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
		}
		if (medium == "audio" && packetssent == "0" && (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
		}
		if (medium == "audio" && packetsrecv == "0"&& (sessionId !== undefined)){
			var sessionWrite = "Media Events - Session ID: ".concat(sessionId);
		}
		if (lostlocal > 0 && medium == "audio"){
			console.log("Loss is More");
			console.log(json);
			console.log("NACK Sent " + nackssent);
            console.log("NAVK Received " + nacksrecv);
		}


	} else if(json.type === 64 || json.type === 128) {
		console.log(" Plugin OR Transport Related Event ");
		var sessionId = json["session_id"];
		var handleId = json["handle_id"];
		var plugin = json["event"]["plugin"];
		var event = JSON.stringify(json["event"]["data"]);
		var when = new Date(json["timestamp"]/1000);

		if(sessionId !== undefined){
		var sessionWrite = "Plugin Event -Session ID: ".concat(sessionId);
		
		}
		
	} else if(json.type === 256) {
		console.log(" Core Event Related Event ");
		var name = "status";
		var event = json["event"][name];
		var signum = json["event"]["signum"];
		if(signum)
			event += " (" + signum + ")";
		var when = new Date(json["timestamp"]/1000);
		
		if(sessionId !== undefined){
		var sessionWrite = "Core Event - Session ID: ".concat(sessionId);
		
		}

	} else {
		console.warn("Unsupported event type " + json.type);
	}
}
