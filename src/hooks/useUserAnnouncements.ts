import { useEffect, useState } from "react";
import useSocket from "~/hooks/useSocket";
import { AnnouncementReceiver } from "~/models/AnnouncementReceiver";
import { useAuthStore } from "~/store/authStore";

export default function useUserAnnouncements() {
  const socket = useSocket();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<AnnouncementReceiver[]>(
    []
  );

  useEffect(() => {
    if (!socket || !user?.id) return;

    const room = `user_${user.id}`;
    socket.emit("joinRoom", room);
    socket.emit("getUserAnnouncements", user.id);

    const refresh = () => socket.emit("getUserAnnouncements", user.id);

    socket.on("userAnnouncements", setAnnouncements);
    socket.on("announcementCreated", refresh);
    socket.on("announcementRead", refresh);
    socket.on("allAnnouncementsRead", refresh);
    socket.on("announcementDeleted", refresh);
    socket.on("allAnnouncementsDeleted", refresh);

    return () => {
      socket.off("userAnnouncements", setAnnouncements);
      socket.off("announcementCreated", refresh);
      socket.off("announcementRead", refresh);
      socket.off("allAnnouncementsRead", refresh);
      socket.off("announcementDeleted", refresh);
      socket.off("allAnnouncementsDeleted", refresh);
    };
  }, [socket, user?.id]);

  return {
    announcements,
    refresh: () => socket?.emit("getUserAnnouncements", user.id),
    markAsRead: (id: number) => socket?.emit("read", id),
    deleteAnnouncement: (id: number) => socket?.emit("delete", id),
    markAllAsRead: () => socket?.emit("read-all", user.id),
    deleteAll: () => socket?.emit("delete-all", user.id),
  };
}
