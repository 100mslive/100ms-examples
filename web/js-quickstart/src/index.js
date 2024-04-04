import {
  HMSReactiveStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectIsLocalScreenShared,
  selectScreenShareByPeerID,
  selectPeersScreenSharing,
} from "@100mslive/hms-video-store";

// Initialize HMS Store
const hmsManager = new HMSReactiveStore();
hmsManager.triggerOnSubscribe();
const hmsStore = hmsManager.getStore();
const hmsActions = hmsManager.getActions();

// HTML elements
const form = document.getElementById("join");
const joinBtn = document.getElementById("join-btn");
const conference = document.getElementById("conference");
const peersContainer = document.getElementById("peers-container");
const leaveBtn = document.getElementById("leave-btn");
const muteAudio = document.getElementById("mute-aud");
const muteVideo = document.getElementById("mute-vid");
const toggleScreenshare = document.getElementById("toggle-screenshare");
const controls = document.getElementById("controls");

// store peer IDs already rendered to avoid re-render on mute/unmute
const renderedPeerIDs = new Set();
const renderedScreenshareIDs = new Set();

// Joining the room
joinBtn.onclick = async () => {
  const userName = document.getElementById("name").value;
  const roomCode = document.getElementById("room-code").value;
  // use room code to fetch auth token
  const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });
  // join room using username and auth token
  hmsActions.join({
    userName,
    authToken,
  });
};

// Leaving the room
async function leaveRoom() {
  await hmsActions.leave();
  peersContainer.innerHTML = "";
}

// Cleanup if user refreshes the tab or navigates away
window.onunload = window.onbeforeunload = leaveRoom;
leaveBtn.onclick = leaveRoom;

// Helper function to create html elements
function createElementWithClass(tag, className) {
  const newElement = document.createElement(tag);
  newElement.className = className;
  return newElement;
}

// Render a single peer
async function renderPeer(peer) {
  const peerTileDiv = createElementWithClass("div", "peer-tile");
  const videoElement = createElementWithClass("video", "peer-video");
  const peerTileName = createElementWithClass("div", "peer-name");
  const peerAudioMuted = createElementWithClass("div", "peer-audio-muted");
  const peerVideoMuted = createElementWithClass("div", "peer-video-muted");
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsinline = true;
  peerTileName.textContent = peer.name;
  peerTileDiv.append(videoElement);
  peerTileDiv.append(peerTileName);
  peerTileDiv.append(peerAudioMuted);
  peerTileDiv.append(peerVideoMuted);
  peerTileDiv.id = `peer-tile-${peer.id}`;
  hmsStore.subscribe((enabled) => {
    peerAudioMuted.style.display = enabled ? "none" : "flex";
    peerAudioMuted.innerHTML = `<span class="material-symbols-outlined">
    ${enabled ? "mic" : "mic_off"}
 </span>`;
  }, selectIsPeerAudioEnabled(peer.id));
  hmsStore.subscribe((enabled) => {
    peerVideoMuted.style.display = enabled ? "none" : "flex";
    peerVideoMuted.innerHTML = `<span class="material-symbols-outlined">
         ${enabled ? "videocam" : "videocam_off"}
      </span>
    `;
  }, selectIsPeerVideoEnabled(peer.id));
  await hmsActions.attachVideo(peer.videoTrack, videoElement);
  return peerTileDiv;
}

async function renderScreenshare(screenshareID) {
  const screenshareTileDiv = createElementWithClass("div", "peer-tile");
  const screenshareTileName = createElementWithClass("div", "peer-name");
  const videoElement = createElementWithClass("video", "peer-video");
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsinline = true;
  screenshareTileName.textContent = "screenshare";
  screenshareTileDiv.append(videoElement);
  screenshareTileDiv.append(screenshareTileName);
  screenshareTileDiv.id = `screen-share-tile-${screenshareID}`;
  await hmsActions.attachVideo(screenshareID, videoElement);
  return screenshareTileDiv;
}

// display a tile for each peer in the peer list
function renderPeers(peers) {
  const currentPeerIds = new Set(peers.map((peer) => peer.id));
  // remove peers that are not present
  renderedPeerIDs.forEach((peerId) => {
    if (!currentPeerIds.has(peerId)) {
      document.getElementById(`peer-tile-${peerId}`).remove();
    }
  });

  peers.forEach(async (peer) => {
    if (!renderedPeerIDs.has(peer.id) && peer.videoTrack) {
      renderedPeerIDs.add(peer.id);
      peersContainer.append(await renderPeer(peer));
    }
  });
}

// Reactive state - renderPeers is called whenever there is a change in the peer-list
hmsStore.subscribe(renderPeers, selectPeers);

hmsStore.subscribe((screensharingPeers) => {
  const currentScreenShareIDs = new Set();
  screensharingPeers.forEach((peer) => {
    const screenshareID = hmsStore.getState(
      selectScreenShareByPeerID(peer.id)
    ).id;
    currentScreenShareIDs.add(screenshareID);
  });

  // Remove screenshare tiles for peers who have stopped screensharing or left
  renderedScreenshareIDs.forEach((renderedID) => {
    if (!currentScreenShareIDs.has(renderedID)) {
      document.getElementById(`screen-share-tile-${renderedID}`).remove();
      renderedScreenshareIDs.delete(renderedID);
    }
  });

  currentScreenShareIDs.forEach(async (screenshareID) => {
    if (!renderedScreenshareIDs.has(screenshareID)) {
      renderedScreenshareIDs.add(screenshareID);
      if (screenshareID)
        peersContainer.append(await renderScreenshare(screenshareID));
    }
  });
}, selectPeersScreenSharing);

// Mute and unmute audio
muteAudio.onclick = () => {
  const audioEnabled = !hmsStore.getState(selectIsLocalAudioEnabled);
  hmsActions.setLocalAudioEnabled(audioEnabled);
  muteAudio.innerHTML = `<span class="material-symbols-outlined">
         ${audioEnabled ? "mic" : "mic_off"}
      </span>
    `;
};

// Mute and unmute video
muteVideo.onclick = () => {
  const videoEnabled = !hmsStore.getState(selectIsLocalVideoEnabled);
  hmsActions.setLocalVideoEnabled(videoEnabled);
  muteVideo.innerHTML = `<span class="material-symbols-outlined">
         ${videoEnabled ? "videocam" : "videocam_off"}
      </span>
    `;
};

// Toggle local screenshare
toggleScreenshare.onclick = async () => {
  const isLocalScreenshared = hmsStore.getState(selectIsLocalScreenShared);
  await hmsActions.setScreenShareEnabled(!isLocalScreenshared);
  toggleScreenshare.innerHTML = `<span class="material-symbols-outlined">
         ${isLocalScreenshared ? "screen_share" : "stop_screen_share"}
      </span>
    `;
};

// Showing the required elements on connection/disconnection
function onConnection(isConnected) {
  if (isConnected) {
    form.classList.add("hide");
    conference.classList.remove("hide");
    leaveBtn.classList.remove("hide");
    controls.classList.remove("hide");
  } else {
    form.classList.remove("hide");
    conference.classList.add("hide");
    leaveBtn.classList.add("hide");
    controls.classList.add("hide");
  }
}

// Listen to the connection state
hmsStore.subscribe(onConnection, selectIsConnectedToRoom);
