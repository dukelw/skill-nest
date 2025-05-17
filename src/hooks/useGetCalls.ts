import { useEffect, useMemo, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useAuthStore } from "~/store/authStore";

export const useGetCalls = () => {
  const { user } = useAuthStore();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !user?.id) return;

      setIsLoading(true);

      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        const { calls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions: {
            starts_at: { $exists: true },
            $or: [
              { created_by_user_id: user.id.toString() },
              { members: { $in: [user.id.toString()] } },
            ],
          },
        });

        setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?.id]);

  const now = new Date();

  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });

  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  const nearestMeeting = useMemo(() => {
    if (!upcomingCalls) return null;
    return [...upcomingCalls].sort(
      (a, b) =>
        new Date(a.state.startsAt!).getTime() -
        new Date(b.state.startsAt!).getTime()
    )[0];
  }, [upcomingCalls]);

  return {
    endedCalls,
    upcomingCalls,
    callRecordings: calls,
    isLoading,
    nearestMeeting,
  };
};
