import { selectPeers, useHMSStore } from "@100mslive/react-sdk";
import Peer from "./Peer";
import ScreenShare from "./ScreenShare";
import PDFShare from "./PDFShare";

function Conference({isSharing, setIsSharing}) {
  const peers = useHMSStore(selectPeers);
  return (
    <div className="conference-section">
      <h2>Conference</h2>
      <div className="peers-container">
        {peers.map((peer, index) => (
          <>
            <Peer key={peer.id} peer={peer} />
            {!peer.isLocal && <ScreenShare key={`${peer.id}-screen-${index}`}  peer={peer}/> }
          </>
        ))}
      </div>
      <div className="peers-container">
        {isSharing && <PDFShare setIsSharing={setIsSharing} />}
      </div>
    </div>
  );
}

export default Conference;
