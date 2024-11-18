document.addEventListener("DOMContentLoaded", async function() {
  document.getElementById("remoteVideo").setAttribute("autoplay", true);
  document.getElementById("remoteVideo").setAttribute("playsinline", true);
  document.getElementById("remoteVideo").setAttribute("muted", true);  // Mute to avoid autoplay restrictions
  await joinWebCRT();
});

var isConnected = false;
let localStream;
let remoteStream;
let socketCRT;
let stompClientCRT;
let pendingAnswer = null;
let candidateBuffer = [];
let isRemoteDescriptionSet = false;
const config = {
  iceServers: [
    { urls: "stun:tictactoe.pokerdash.fun:3478" },
    {
      urls: "turn:tictactoe.pokerdash.fun:5349",
      username: "user",
      credential: "JavaVakariniai123"
    }
  ]
};
let peerConnection = new RTCPeerConnection(config);

// Join WebSocket connection for signaling
async function joinWebCRT() {
  return new Promise((resolve, reject) => {
    socketCRT = new SockJS(url + '/websocket');
    stompClientCRT = Stomp.over(socketCRT);

    stompClientCRT.connect({}, function (frame) {
      console.log("WebSocket connected:", frame);
      stompClientCRT.subscribe('/topic/signal/' + gameSession.sessionId, function (message) {
        const parsedMessage = JSON.parse(message.body);
        console.log("Received message:", parsedMessage);
        handleSignalingMessage(parsedMessage);
      });
      resolve(frame);
    }, function (error) {
      console.log('Error connecting to WebSocket:', error);
      reject(error);
    });
  });
}

// Handle incoming signaling messages (offer, answer, ICE candidates)
function handleSignalingMessage(message) {
   console.log("Received signaling message:", message);
    console.log("Current signaling state before processing message:", peerConnection.signalingState);


  if (message.type === "offer") {
      console.log("Received offer:", message);
      if (peerConnection.signalingState === "stable") {
          peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))
              .then(async () => {
                  console.log("Offer set as remote description.");
                  isRemoteDescriptionSet = true;
                  const answer = await peerConnection.createAnswer();
                  await peerConnection.setLocalDescription(answer);
                  sendSignalingMessage({ type: "answer", answer });
                  console.log("Created and sent answer:", answer);
                  
                  processBufferedCandidates();
              })
              .catch(error => console.error("Error setting remote offer:", error));
      } else {
          console.warn("PeerConnection not in 'stable' state, current state:", peerConnection.signalingState);
      }
  } else if (message.type === "answer") {
      console.log("Received answer:", message);
      if (peerConnection.signalingState === "have-local-offer") {
          setRemoteAnswer(message.answer);
      } else {
          console.log("Buffering answer, waiting for 'have-local-offer' state.");
          pendingAnswer = message.answer;
      }
  } else if (message.type === "candidate" && message.candidate) {
      console.log("Received ICE candidate:", message.candidate);

      if (!isRemoteDescriptionSet) {
          console.log("Buffering ICE candidate:", message.candidate);
          candidateBuffer.push(message.candidate);
      } else {
          addIceCandidate(message.candidate);
      }
  }
}


// Send a signaling message to the other peer
function sendSignalingMessage(message) {
  console.log("Sending signaling message:", message);
  stompClientCRT.send("/app/signal/" + gameSession.sessionId, {}, JSON.stringify(message));
}

// Start the call by capturing local media and creating an offer
async function startCall() {
  if(isConnected == true){
    stompClientCRT.disconnect();
    document.getElementById("startCallButton").innerHTML = "Start Call";
    isConnected = false;
    disconnectVideo();
  }else{
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      document.getElementById("localVideo").srcObject = localStream;
      console.log("Local stream captured:", localStream);
  
      // Add local tracks to the peer connection
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
      console.log("Added tracks to peer connection:", peerConnection.getSenders());
  
      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Created and set local offer:", offer);
      sendSignalingMessage({ type: "offer", offer });
      document.getElementById("startCallButton").innerHTML = "Disconnect";
      isConnected = true;
      connectVideo();
    } catch (error) {
      console.error("Error starting call or capturing local media:", error);
    }
  }
}

// Handle ICE candidate generation and sending
peerConnection.onicecandidate = event => {
  if (event.candidate) {
    console.log("Generated ICE candidate:", event.candidate);

    // Buffer ICE candidates if the remote description is not set yet
    if (!isRemoteDescriptionSet) {
      console.log("Remote description not set yet, buffering ICE candidate:", event.candidate);
      candidateBuffer.push(event.candidate);
    } else {
      // Send ICE candidate immediately if the remote description is already set
      sendSignalingMessage({ type: "candidate", candidate: event.candidate });
      console.log("ICE candidate sent:", event.candidate);
    }
  } else {
    console.log("All ICE candidates have been sent.");
  }
};

peerConnection.oniceconnectionstatechange = () => {
  console.log("ICE Connection State changed:", peerConnection.iceConnectionState);

  switch (peerConnection.iceConnectionState) {
    case "checking":
      console.log("ICE checking: Searching for candidates...");
      break;

    case "connected":
      console.log("ICE connected: Peers are connected.");
      break;

    case "completed":
      console.log("ICE connection completed: All checks passed, full connection established.");
      break;

    case "disconnected":
      console.warn("ICE connection disconnected: Possible connection issue.");
      break;

    case "failed":
      console.error("ICE connection failed: Unable to establish connection.");
      break;

    case "closed":
      console.log("ICE connection closed: Connection has been terminated.");
      break;

    default:
      console.log("ICE connection in unknown state:", peerConnection.iceConnectionState);
      break;
  }
};

peerConnection.onsignalingstatechange = () => {
  console.log("Signaling State changed:", peerConnection.signalingState);
  
  // Process the pending answer if we're now in the 'have-local-offer' state
  if (peerConnection.signalingState === "have-local-offer" && pendingAnswer) {
      console.log("Setting buffered answer as remote description.");
      setRemoteAnswer(pendingAnswer);
      pendingAnswer = null; // Clear the buffered answer after setting it
  }
};

// Track signaling state changes
peerConnection.onsignalingstatechange = () => {
  console.log("Signaling State changed:", peerConnection.signalingState);
};

// Receive remote media streams and attach to the video element
peerConnection.ontrack = event => {
  console.log("Received remote track:", event.track);
  if (!remoteStream) {
    remoteStream = new MediaStream();
    document.getElementById("remoteVideo").srcObject = remoteStream;
    console.log("Initialized remote stream for display.");
  }
  remoteStream.addTrack(event.track);
  console.log("Added track to remote stream:", event.track);
};




function addIceCandidate(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .then(() => console.log("ICE candidate added successfully:", candidate))
      .catch(error => console.error("Error adding ICE candidate:", error));
}

function processBufferedCandidates() {
  console.log("Processing buffered ICE candidates...");  
  candidateBuffer.forEach(candidate => addIceCandidate(candidate));
  candidateBuffer = [];  // Clear the buffer once candidates are added
}

function setRemoteAnswer(answer) {
  console.log("Setting remote description. Processing buffered candidates.");
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      .then(() => {
          console.log("Answer set as remote description.");
          isRemoteDescriptionSet = true;
          processBufferedCandidates();
          
      })
      .catch(error => console.error("Error setting remote answer:", error));
}
function disconnectVideo(){
  document.getElementById("localVideo").pause();
  document.getElementById("remoteVideo").pause();
}

function connectVideo(){
  document.getElementById("remoteVideo").start();
  document.getElementById("remoteVideo").start();
}