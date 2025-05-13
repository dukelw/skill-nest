import { useEffect } from "react";
import useSocket from "~/hooks/useSocket";
import { classroomService } from "~/services/classroomService";

export default function useComments(classroomId: number) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !classroomId) return;
    socket.emit("joinAssignmentRoom", classroomId);
  }, [socket, classroomId]);

  return {
    refresh: async () => {
      await classroomService.getDetail(classroomId);
    },
    createComment: (data: {
      content: string;
      userId: number;
      assignmentId: number;
      parentId?: number;
      classroomId: number;
    }) => socket?.emit("createComment", data),
    updateComment: (data: {
      id: number;
      userId: number;
      content: string;
      classroomId: number;
    }) => socket?.emit("updateComment", data),
    deleteComment: (data: {
      id: number;
      userId: number;
      classroomId: number;
    }) => socket?.emit("deleteComment", data),
  };
}
