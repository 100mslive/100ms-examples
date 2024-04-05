import { useState } from "react";
import { useHMSActions } from "@100mslive/react-sdk";
import { ArrowRightIcon } from "@100mslive/react-icons";

function Join() {
  const hmsActions = useHMSActions();
  const [inputValues, setInputValues] = useState({
    name: "",
    token: "",
  });

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userName = "", roomCode = "" } = inputValues;

    // use room code to fetch auth token
    const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });

    try {
      await hmsActions.join({ userName, authToken });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="home">
      <img
        className="logo"
        src="https://www.100ms.live/assets/logo.svg"
        alt="logo"
        height={48}
        width={150}
      />
      <h2 style={{ marginTop: "2rem" }}>Join Room</h2>
      <p>Enter your room code and name before joining</p>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            id="room-code"
            type="text"
            name="roomCode"
            placeholder="Your Room Code"
            onChange={handleInputChange}
          />
        </div>
        <div className="input-container">
          <input
            required
            value={inputValues.name}
            onChange={handleInputChange}
            id="name"
            type="text"
            name="name"
            placeholder="Your Name"
          />
        </div>
        <button className="btn-primary">
          Join Now
          <ArrowRightIcon
            height={16}
            width={16}
            style={{ marginLeft: "0.25rem" }}
          />
        </button>
      </form>
    </div>
  );
}

export default Join;
