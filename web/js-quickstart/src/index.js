import {
  HMSReactiveStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectScreenShareByPeerID,
  selectLocalPeer,
  selectPeersByRole,
} from "@100mslive/hms-video-store";

const ROLES = { PROCTOR: "proctor", CANDIDATE: "candidate" };

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

// store peer IDs already rendered to avoid re-render on mute/unmute
const renderedPeerIDs = new Set();
const screenShareTrackIDs = new Map();
const unmutedForPeerIDs = new Set();

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
async function renderPeer(peer, showScreenShare, proctorAudioTrack) {
  const isCandidate = peer.roleName === ROLES.CANDIDATE;
  if (!isCandidate) return;
  const peerTileDiv = createElementWithClass("div", "peer-tile");
  const videoElement = createElementWithClass("video", "peer-video");
  const screenElement = createElementWithClass("video", "peer-video");
  const peerTileName = createElementWithClass("div", "peer-name");
  const peerAudioMuted = createElementWithClass("div", "peer-audio-muted");
  const peerVideoMuted = createElementWithClass("div", "peer-video-muted");
  const audioButton = createElementWithClass("button", "btn-control");
  const div = createElementWithClass("div", "");
  const unmutedForPeer = unmutedForPeerIDs.has(peer.id);
  audioButton.innerText = unmutedForPeer ? "Mute" : "Unmute";

  // Instead of changing the role, the proctor's audio is restored only for the selected peer
  // Faster and simpler than role change
  audioButton.onclick = () => {
    console.log("ollo", { proctorAudioTrack, unmutedForPeer });
    if (unmutedForPeer) {
      if (proctorAudioTrack) {
        console.log("ollo muting");
        hmsActions.setVolume(0, proctorAudioTrack);
      }
      unmutedForPeerIDs.delete(peer.id);
    } else {
      unmutedForPeerIDs.add(peer.id);
      if (proctorAudioTrack) {
        hmsActions.setVolume(100, proctorAudioTrack);
      }
    }
  };
  div.append(peerTileName);
  if (showScreenShare) div.append(audioButton);

  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsinline = true;
  screenElement.autoplay = true;
  screenElement.muted = true;
  screenElement.playsinline = true;
  peerTileName.textContent = peer.name;
  peerTileDiv.append(div);
  peerTileDiv.append(videoElement);
  peerTileDiv.append(peerAudioMuted);
  peerTileDiv.append(peerVideoMuted);
  if (showScreenShare) peerTileDiv.append(screenElement);
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

  let screenShareTrackID = screenShareTrackIDs.get(peer.id);
  if (!screenShareTrackID) {
    await hmsActions.setScreenShareEnabled(true);
    screenShareTrackID = hmsStore.getState(
      selectScreenShareByPeerID(peer.id)
    ).id;
    screenShareTrackIDs.set(peer.id, screenShareTrackID);
  }

  await hmsActions.attachVideo(peer.videoTrack, videoElement);
  if (showScreenShare)
    await hmsActions.attachVideo(screenShareTrackID, screenElement);

  renderedPeerIDs.add(peer.id);
  return peerTileDiv;
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
  const localPeer = hmsStore.getState(selectLocalPeer);
  const localPeerIsProctor = localPeer?.roleName === ROLES.PROCTOR;
  const proctorPeer = hmsStore.getState(selectPeersByRole(ROLES.PROCTOR));
  const peersToRender = localPeerIsProctor ? peers : [localPeer];

  peersToRender.forEach(async (peer) => {
    if (!renderedPeerIDs.has(peer.id) && peer.videoTrack) {
      peersContainer.append(
        await renderPeer(peer, localPeerIsProctor, proctorPeer?.audioTrack)
      );
    }
  });
}

// Reactive state - renderPeers is called whenever there is a change in the peer-list
hmsStore.subscribe(renderPeers, selectPeers);

// Showing the required elements on connection/disconnection
function onConnection(isConnected) {
  if (isConnected) {
    form.classList.add("hide");
    conference.classList.remove("hide");
    leaveBtn.classList.remove("hide");
  } else {
    form.classList.remove("hide");
    conference.classList.add("hide");
    leaveBtn.classList.add("hide");
  }
}

// Listen to the connection state
hmsStore.subscribe(onConnection, selectIsConnectedToRoom);
