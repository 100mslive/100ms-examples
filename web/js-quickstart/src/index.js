import {
  HMSReactiveStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectScreenShareByPeerID,
  selectLocalPeer,
  selectPeerByID,
  selectPeersByRole,
} from "@100mslive/hms-video-store";

const ROLES = {
  PROCTOR: "proctor",
  CANDIDATE: "candidate",
  ON_STAGE_CANDIDATE: "on-stage-candidate",
};

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
    settings: { isAudioMuted: false, isVideoMuted: false },
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

const audioToggle = async (peerID, setContent) => {
  const isPeerOnStage =
    hmsStore.getState(selectPeerByID(peerID))?.roleName ===
    ROLES.ON_STAGE_CANDIDATE;
  await hmsActions.changeRoleOfPeer(
    peerID,
    isPeerOnStage ? ROLES.CANDIDATE : ROLES.ON_STAGE_CANDIDATE,
    true
  );
  setContent(isPeerOnStage ? "Unmute" : "Mute");
};

// Render a single peer
async function renderPeer(peer, showScreenShare) {
  const isProctor = peer.roleName === ROLES.PROCTOR;
  if (isProctor) return;
  const peerTileDiv = createElementWithClass("div", "peer-tile");
  const videoElement = createElementWithClass("video", "peer-video");
  const screenElement = createElementWithClass("video", "peer-video");
  const peerTileName = createElementWithClass("div", "peer-name");
  const audioButton = createElementWithClass("button", "btn-control");
  const div = createElementWithClass("div", "");
  audioButton.innerText = peer.roleName === ROLES.CANDIDATE ? "Unmute" : "Mute";
  audioButton.onclick = () =>
    audioToggle(peer.id, (buttonText) => (audioButton.innerText = buttonText));
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
  if (showScreenShare) peerTileDiv.append(screenElement);
  peerTileDiv.id = `peer-tile-${peer.id}`;

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
      document.getElementById(`peer-tile-${peerId}`)?.remove();
    }
  });
  const localPeer = hmsStore.getState(selectLocalPeer);
  const localPeerIsProctor = localPeer?.roleName === ROLES.PROCTOR;
  const peersToRender = localPeerIsProctor ? peers : [localPeer];

  peersToRender.forEach(async (peer) => {
    if (!renderedPeerIDs.has(peer.id) && peer.videoTrack) {
      peersContainer.append(await renderPeer(peer, localPeerIsProctor));
    }
  });
}

// Reactive state - renderPeers is called whenever there is a change in the peer-list
hmsStore.subscribe(renderPeers, selectPeers);
hmsStore.subscribe(() => {
  const proctors = hmsStore.getState(selectPeersByRole(ROLES.PROCTOR));
  proctors.forEach(
    async (proctor) =>
      await hmsActions.setRemoteTracksEnabled(proctor.audioTrack)
  );
}, selectPeersByRole(ROLES.ON_STAGE_CANDIDATE));

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
