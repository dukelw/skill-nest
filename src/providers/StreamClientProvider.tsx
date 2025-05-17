// StreamVideoProvider.tsx
import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";

import { useAuthStore } from "~/store/authStore";
import Loader from "~/components/partial/Loader";

const fetchToken = async (userId: string) => {
  const res = await fetch(`/api/stream/token?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch token");
  return data.token;
};

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    if (!API_KEY) throw new Error("Stream API key is missing");

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id.toString(),
        name: user.name || user.email,
        image: user.avatar,
      },
      tokenProvider: () => fetchToken(user.id.toString()),
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(undefined);
    };
  }, [user]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
