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
    } = inputValues;

    // use room code to fetch auth token
    const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });
  
    try { 
      await hmsActions.join({ userName, authToken});
    } catch (e) {
      console.error(e);
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
          placeholder="Room code"
          onChange={handleInputChange}
        />
      </div>
      <button className="btn-primary">Join</button>
    </form>
  );
}

export default Join;
