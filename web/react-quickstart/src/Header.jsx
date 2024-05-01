import { ExitIcon } from "@100mslive/react-icons";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import React from "react";

function Header() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  return (
    <header>
      <img
        className="logo"
        src="https://www.100ms.live/assets/logo.svg"
        alt="logo"
      />
      {isConnected && (
        <button
          id="leave-btn"
          className="btn btn-danger"
          onClick={() => hmsActions.leave()}
        >
          <ExitIcon style={{ marginLeft: "0.25rem" }} /> Leave Room
        </button>
      )}
    </header>
  );
}

export default Header;
