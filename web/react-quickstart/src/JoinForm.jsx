import { useHMSActions } from "@100mslive/react-sdk";
import { useState } from "react";

function Join() {
  const hmsActions = useHMSActions();
  const [inputValues, setInputValues] = useState({
    name: "",
    token: ""
  });

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { 
      userName = '',
      roomCode = '',
      token = ''
    } = inputValues

    const joinPayload = {}
    joinPayload.userName = userName
  
    // if room code is provided then fetch auth token first
    if (roomCode) {
      const resp = await hmsActions.getAuthTokenByRoomCode({ roomCode })
      joinPayload.authToken = resp.token
    } else {
      // set the token value set by the user
      joinPayload.authToken = token
    }
  
    try { 
      await hmsActions.join(joinPayload);
    } catch (e) {
      console.error(e)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Join Room</h2>
      <div className="input-container">
        <input
          required
          value={inputValues.name}
          onChange={handleInputChange}
          id="name"
          type="text"
          name="name"
          placeholder="Your name"
        />
      </div>
      <div className="input-container">
        <input 
          id="room-code" 
          type="text"
          name="roomCode"
          placeholder="Room Code"
          onChange={handleInputChange}
        />
        <span> OR </span>
        <input
          value={inputValues.token}
          onChange={handleInputChange}
          id="token"
          type="text"
          name="token"
          placeholder="Auth token"
        />
      </div>
      <button className="btn-primary">Join</button>
    </form>
  );
}

export default Join;
