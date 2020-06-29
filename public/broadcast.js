const myroomID = localStorage.getItem("roomID")

const pusher = new Pusher('2e15bed130f01b4dc67c', {
cluster: 'ap1',
encrypted: true,
authEndpoint: '/pusher/auth'
});

const channel = pusher.subscribe(myroomID);
channel.bind('message_sent', (data) => {
	console.log(data)
	document.getElementById("list-message").innerHTML += `<li><small>${data.username}</small><br>${data.message}</li>`;
});

channel.bind('pusher:subscription_succeeded', (members) => {
	console.log(channel.members)
	const ms = channel.members;
	if(ms != undefined){
		let lists = `<ul>`;
		for (let i = 0; i < ms.length; i++) {
		const e = ms[i];
		lists += `<li>${e.id}</li>`;
		}
		lists += `</ul>`;
		document.getElementById("tab-people").innerHTML = lists;
	}
	
});

function changeAtiveTab(event,tabID){
    let element = event.target;
    while(element.nodeName !== "A"){
      element = element.parentNode;
    }
    ulElement = element.parentNode.parentNode;
    aElements = ulElement.querySelectorAll("li > a");
    tabContents = document.getElementById("tabs-id").querySelectorAll(".tab-content > div");
    for(let i = 0 ; i < aElements.length; i++){
      aElements[i].classList.remove("text-blue-700");
      aElements[i].classList.remove("border-l");
      aElements[i].classList.remove("border-t")
      aElements[i].classList.remove("border-r")
      aElements[i].classList.remove("rounded-t")
     
      tabContents[i].classList.add("hidden");
      tabContents[i].classList.remove("block");
      console.log(tabContents[i])
    }
    element.classList.add("text-blue-700");
    element.classList.add("border-l");
    element.classList.add("border-t")
    element.classList.add("border-r")
    element.classList.add("rounded-t")
	
    
    document.getElementById(tabID).classList.remove("hidden");
    document.getElementById(tabID).classList.add("block");
  }
  

const config = { 
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302']
  }]
};

const socket = io.connect(window.location.origin+"?roomID="+myroomID);
const video = document.querySelector('video');
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;


window.onunload = window.onbeforeunload = function() {
	socket.close();
};


/*global socket, video, config*/
const peerConnections = {};

/** @type {MediaStreamConstraints} */
const constraints = {
	// audio: true,
	video: {facingMode: "user"}
};

// navigator.mediaDevices.getUserMedia(constraints)
// .then(function(stream) {

// 	const audioSource = audioSelect.value;
// 	const videoSource = videoSelect.value;
// 	const constraints = {
// 		audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
// 		video: { deviceId: videoSource ? { exact: videoSource } : undefined }
// 	};
// 	gotStream(stream);
// 	video.srcObject = stream;
// 	socket.emit('broadcaster');
// }).catch(error => console.error(error));



socket.on('answer', function(id, description,roomID) {
	console.log("answer : "+roomID)
//   if(roomID != myroomID){
//     return;
//   }
	peerConnections[id].setRemoteDescription(description);
});

socket.on('watcher', function(id,roomID) {
//   if(roomID != myroomID){
//     return;
//   }
	const peerConnection = new RTCPeerConnection(config);
	peerConnections[id] = peerConnection;
	let stream = video.srcObject;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
	peerConnection.createOffer()
	.then(sdp => peerConnection.setLocalDescription(sdp))
	.then(function () {
		socket.emit('offer', id, peerConnection.localDescription);
	});
	peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			socket.emit('candidate', id, event.candidate);
		}
	};
});

socket.on('candidate', function(id, candidate,roomID) {
	console.log("candidate : "+roomID)
//   if(roomID != myroomID){
//     return;
//   }
	if(peerConnections[id] != undefined){
		peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
	}
	
});

socket.on('bye', function(id,roomID) {
	console.log("bye : "+roomID)
//   if(roomID != myroomID){
//     return;
//   }
	peerConnections[id] && peerConnections[id].close();
	delete peerConnections[id];
});

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
  .then(getDevices)
  .then(gotDevices);

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    option => option.text === stream.getAudioTracks()[0].label
  );
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );
  video.srcObject = stream;
  socket.emit("broadcaster");
}

function handleError(error) {
  console.error("Error: ", error);
}
  

