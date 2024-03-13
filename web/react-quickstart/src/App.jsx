import JoinForm from "./JoinForm";
import Header from "./Header";
import "./styles.css";
import Conference from "./Conference";
import { useEffect, useState } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore
} from "@100mslive/react-sdk";
import Footer from "./Footer";

export default function App() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    window.onunload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

  return (
    <div className="App">
      <Header />
      {isConnected ? (
        <>
          <Conference isSharing={isSharing} setIsSharing={setIsSharing}/>
          <Footer isSharing={isSharing} setIsSharing={setIsSharing} />
        </>
      ) : (
        <JoinForm />
      )}
    </div>
  );
}
