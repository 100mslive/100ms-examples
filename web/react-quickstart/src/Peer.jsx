import { MicOffIcon, PersonIcon } from "@100mslive/react-icons";
import {
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  useVideo,
  useHMSStore,
} from "@100mslive/react-sdk";

function Peer({ peer }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  const isPeerAudioEnabled = useHMSStore(selectIsPeerAudioEnabled(peer.id));
  const isPeerVideoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer.id));

  return (
    <div className="peer-container">
      {!isPeerAudioEnabled && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: "100",
            backgroundColor: "#293042",
            padding: "0.5rem",
            borderRadius: "0.75rem",
            height: "2rem",
            width: "2rem",
          }}
        >
          <MicOffIcon height={16} width={16} />
        </div>
      )}
      <video
        ref={videoRef}
        className={`peer-video ${peer.isLocal ? "local" : ""}`}
        autoPlay
        muted
        playsInline
      />
      {!isPeerVideoEnabled ? (
        <div className="peer-video video-cover">
          <PersonIcon height={48} width={48} />
        </div>
      ) : null}
      <div className="peer-name">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </div>
    </div>
  );
}

export default Peer;
