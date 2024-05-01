import { ChangeEventHandler, useCallback, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");

  const handleRoomCodeChange: ChangeEventHandler = useCallback((e) => {
    const roomCodeValue = ((e.target as HTMLInputElement).value || "").trim();
    setRoomCode(roomCodeValue);
  }, []);

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Enter room code to join room
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={handleRoomCodeChange}
            placeholder="xxx-xxxx-xxx"
            required
          />
        </div>
        <div className="flex items-end">
          <Link href={`/prebuilt?roomCode=${roomCode}`}>
            <button
              type="submit"
              disabled={!roomCode}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Join Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
