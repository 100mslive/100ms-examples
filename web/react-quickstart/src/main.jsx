import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { HMSRoomProvider } from "@100mslive/react-sdk";

import App from "./App.jsx";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <HMSRoomProvider>
      <App />
    </HMSRoomProvider>
  </StrictMode>,
  rootElement
);
