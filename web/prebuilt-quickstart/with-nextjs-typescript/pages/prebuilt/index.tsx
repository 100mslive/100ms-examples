import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { useRouter } from "next/router";

export default function PrebuiltPage() {
  const router = useRouter();
  return (
    <div style={{ height: "100vh" }}>
      {router.query.roomCode && (
        <HMSPrebuilt roomCode={router.query.roomCode as string} />
      )}
    </div>
  );
}
