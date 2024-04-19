import {
  selectPeers,
  selectPeersScreenSharing,
  useHMSStore,
} from "@100mslive/react-sdk";
import Peer from "./Peer";
import { ScreenTile } from "./ScreenTile";

function Conference() {
  const peers = useHMSStore(selectPeers);
  const presenters = useHMSStore(selectPeersScreenSharing);

  return (
    <div className="conference-section">
      <div className="peers-container">
        {peers.map((peer) => (
          <Peer key={peer.id} peer={peer} />
        ))}
        {presenters.map((peer) => (
          <ScreenTile key={"screen" + peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
}

export default Conference;
