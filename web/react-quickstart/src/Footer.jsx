import {
  MicOffIcon,
  MicOnIcon,
  ShareScreenIcon,
  VideoOffIcon,
  VideoOnIcon,
} from "@100mslive/react-icons";
import {
  selectIsLocalScreenShared,
  useAVToggle,
  useHMSStore,
} from "@100mslive/react-sdk";

function Footer() {
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const amIScreenSharing = useHMSStore(selectIsLocalScreenShared);
  return (
    <div className="control-bar">
      <button
        className={`btn-control ${isLocalAudioEnabled ? "" : "highlight"}`}
        onClick={toggleAudio}
      >
        {isLocalAudioEnabled ? <MicOnIcon /> : <MicOffIcon />}
      </button>
      <button
        className={`btn-control ${isLocalVideoEnabled ? "" : "highlight"}`}
        onClick={toggleVideo}
      >
        {isLocalVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
      </button>
      <button
        className={`btn-control ${amIScreenSharing ? "" : "highlight"}`}
        onClick={toggleVideo}
      >
        <ShareScreenIcon />
      </button>
    </div>
  );
}

export default Footer;
