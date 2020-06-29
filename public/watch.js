const myroomID = localStorage.getItem("roomID");
let peerConnection;
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

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
  }
  element.classList.add("text-blue-700");
element.classList.add("border-l");
element.classList.add("border-t")
element.classList.add("border-r")
element.classList.add("rounded-t")

  
  document.getElementById(tabID).classList.remove("hidden");
  document.getElementById(tabID).classList.add("block");
}

const pusher = new Pusher('2e15bed130f01b4dc67c', {
  cluster: 'ap1',
  encrypted: true,
  authEndpoint: '/pusher/auth'
});
const channel = pusher.subscribe(myroomID);
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
// User joins chat
channel.bind('pusher:member_added', (member) => {
  // alert("okoc2");
  console.log(member)
});

const socket = io.connect(window.location.origin+"?roomID="+myroomID);
const video = document.querySelector("video");


socket.on('offer', function(id, description,roomID) {
  console.log("offer : "+roomID)
  // if(roomID != myroomID){
  //   return;
  // }
	peerConnection = new RTCPeerConnection(config);
	peerConnection.setRemoteDescription(description)
	.then(() => peerConnection.createAnswer())
	.then(sdp => peerConnection.setLocalDescription(sdp))
	.then(function () {
		socket.emit('answer', id, peerConnection.localDescription,roomID);
	});
	peerConnection.ontrack = function(event) {
		video.srcObject = event.streams[0];
	};
	peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			socket.emit('candidate', id, event.candidate,roomID);
		}
	};
});

socket.on('candidate', function(id, candidate,roomID) {
  console.log("candidate : "+roomID)
  // if(roomID != myroomID){
  //   return;
  // }
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  .catch(e => console.error(e));
});

socket.on('connect', function() {
	socket.emit('watcher');
});

socket.on('broadcaster', function(roomID) {
  console.log("broadcaster : "+roomID)
  // if(roomID != myroomID){
  //   return;
  // }
  socket.emit('watcher');
});

socket.on('bye', function() {
	peerConnection.close();
});

