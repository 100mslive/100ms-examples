import { useAVToggle, usePDFShare } from "@100mslive/react-sdk";
import { useCallback, useState } from "react";

function Footer({isSharing, setIsSharing}) {
  const {
    isLocalAudioEnabled,
    isLocalVideoEnabled,
    toggleAudio,
    toggleVideo
  } = useAVToggle();

  const resetConfig = useCallback(() => {
    setIsSharing(false);
  })

  const { isPDFShareInProgress, stopPDFShare } = usePDFShare(resetConfig);

  const stopSharing = useCallback(() => {
    if (isSharing) {
      stopPDFShare();
      setIsSharing(false);
    } else {
      setIsSharing(true);
    }
  }, [setIsSharing, stopPDFShare]);
  return (
    <div className="control-bar">
      <button className="btn-control" onClick={toggleAudio}>
        {isLocalAudioEnabled ? "Mute" : "Unmute"}
      </button>
      <button className="btn-control" onClick={toggleVideo}>
        {isLocalVideoEnabled ? "Hide" : "Unhide"}
      </button>
      <button className="btn-control" onClick={stopSharing}>
        {isSharing ? "Stop Share": "PDF Share"}
      </button>
    </div>
  );
}

export default Footer;
