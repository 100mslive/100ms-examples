import { useState } from "react";
import {
  AudioLevelIcon,
  MicOffIcon,
  MicOnIcon,
  ShareScreenIcon,
  VideoOffIcon,
  VideoOnIcon,
} from "@100mslive/react-icons";
import {
  selectIsLocalAudioPluginPresent,
  selectIsLocalScreenShared,
  selectRoom,
  useAVToggle,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import { HMSKrispPlugin } from "@100mslive/hms-noise-cancellation";

const plugin = new HMSKrispPlugin();

function Footer() {
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const amIScreenSharing = useHMSStore(selectIsLocalScreenShared);
  const actions = useHMSActions();
  const room = useHMSStore(selectRoom);
  const isAudioPluginAdded = useHMSStore(
    selectIsLocalAudioPluginPresent(plugin.getName())
  );
  const [isPluginActive, setIsPluginActive] = useState(false);

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
        title="Screenshare"
        className={`btn-control ${amIScreenSharing ? "" : "highlight"}`}
        onClick={() => actions.setScreenShareEnabled(!amIScreenSharing)}
      >
        <ShareScreenIcon />
      </button>
      {room.isNoiseCancellationEnabled ? (
        <button
          title="Noise cancellation"
          className={`btn-control ${isPluginActive ? "" : "highlight"}`}
          onClick={async () => {
            if (isAudioPluginAdded) {
              plugin.toggle();
              setIsPluginActive((prev) => !prev);
            } else {
              await actions.addPluginToAudioTrack(plugin);
              setIsPluginActive(true);
            }
          }}
        >
          <AudioLevelIcon />
        </button>
      ) : null}
    </div>
  );
}

export default Footer;