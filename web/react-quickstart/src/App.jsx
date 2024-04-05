import JoinForm from "./JoinForm";
import "./styles.css";
import Conference from "./Conference";
import { useEffect } from "react";
import {
  HMSRoomState,
  selectIsConnectedToRoom,
  selectRoomState,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import Footer from "./Footer";
import { Loader } from "./Loader";

const loadingStates = [HMSRoomState.Connecting, HMSRoomState.Disconnecting];

export default function App() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const roomState = useHMSStore(selectRoomState);
  const hmsActions = useHMSActions();

  useEffect(() => {
    window.onunload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

  if (loadingStates.includes(roomState) || !roomState) {
    return <Loader />;
  }

  return (
    <div className="App">
      {isConnected ? (
        <>
          <Conference />
          <Footer />
        </>
      ) : (
        <JoinForm />
      )}
    </div>
  );
}
