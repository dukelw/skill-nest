import { FaPlus } from "react-icons/fa";
import {
  Avatar,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useClassroomStore } from "~/store/classroomStore";
import User from "~/models/User";
import useUserStore from "~/store/userStore";
import { useEffect, useState } from "react";
import { classroomService } from "~/services/classroomService";
import { useParams } from "next/navigation";
import { useAuthStore } from "~/store/authStore";
import { userService } from "~/services/userService";
import Request from "~/models/Request";
import LewisButton from "../partial/LewisButton";

export default function People() {
  const { users, setUsers } = useUserStore();
  const { user } = useAuthStore();
  const { classroom, setClassroom } = useClassroomStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [addMode, setAddMode] = useState<"teacher" | "student">("student");
  const [requests, setRequests] = useState<Request[]>([]);
  const { classroomId } = useParams();

  const toggleModal = (mode: "teacher" | "student") => {
    setAddMode(mode);
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGetClassroomDetail = async () => {
    const res = await classroomService.getDetail(Number(classroomId));
    setClassroom(res);
  };

  const handleAdd = async () => {
    const res = await classroomService.addStudents(
      Number(classroomId),
      selectedUserIds
    );
    if (res) {
      handleGetClassroomDetail();
      setIsModalOpen(false);
      setSelectedUserIds([]);
    }
  };

  const handleAccept = async (userId: number) => {
    const res = await classroomService.addStudents(Number(classroomId), [
      userId,
    ]);
    if (res) {
      handleGetClassroomDetail();
      handleGetRequest();
    }
  };

  const handleReject = async (userId: number) => {
    const res = await classroomService.reject(Number(classroomId), userId);
    if (res) {
      handleGetClassroomDetail();
      handleGetRequest();
    }
  };

  const handleGetUser = async () => {
    const res = await userService.getAll();
    setUsers(res);
  };

  const handleGetRequest = async () => {
    const res = await classroomService.getRequest(Number(classroom!.id));
    setRequests(res);
  };

  useEffect(() => {
    handleGetUser();
    handleGetRequest();
  }, []);

  return (
    <div>
      {/* REQUEST */}
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Request</h2>
        </div>

        <div className="w-full h-px bg-gray-700 my-4" />

        {requests?.length > 0 ? (
          requests?.map((m: Request, index: number) => (
            <div
              key={index}
              className="w-full flex justify-between items-center space-x-4 mb-3"
            >
              <div className="flex items-center">
                <Avatar
                  img={
                    m?.user?.avatar ||
                    "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                  }
                  rounded
                  className="w-10 h-10"
                />
                <span className="text-color ml-4">
                  {m?.user?.name + " (" + m.user.email + ")" || "Guest"}
                </span>
              </div>

              <div className="flex items-center">
                <LewisButton
                  lewisSize="small"
                  color="red"
                  onClick={() => handleReject(m.userId)}
                >
                  Reject
                </LewisButton>
                <LewisButton
                  lewisSize="small"
                  onClick={() => handleAccept(m.userId)}
                >
                  Accept
                </LewisButton>
              </div>
            </div>
          ))
        ) : (
          <p className="mb-8">No pending request</p>
        )}
      </div>

      {/* TEACHER */}
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Teacher</h2>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => toggleModal("teacher")}
              className="rounded-full flex items-center justify-center w-10 h-10 text-green bg-transparent hover:bg-green-500/10 transition-colors duration-200"
            >
              <FaPlus />
            </button>
          )}
        </div>

        <div className="w-full h-px bg-gray-700 my-4" />

        {classroom?.members
          ?.filter((m) => m.role === "TEACHER")
          ?.map((m, index) => (
            <div key={index} className="flex items-center space-x-4 mb-3">
              <Avatar
                img={
                  m?.user?.avatar ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                rounded
              />
              <span className="text-color">
                {m?.user?.name + " (" + m.user.email + ")" || "Guest"}
              </span>
            </div>
          ))}
      </div>

      {/* STUDENT */}
      <div className="flex flex-col items-start mt-6">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Student</h2>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => toggleModal("student")}
              className="rounded-full flex items-center justify-center w-10 h-10 text-green bg-transparent hover:bg-green-500/10 transition-colors duration-200"
            >
              <FaPlus />
            </button>
          )}
        </div>

        <div className="w-full h-px bg-gray-700 my-4" />

        {classroom?.members
          ?.filter((m) => m.role === "STUDENT")
          ?.map((m, index) => (
            <div key={index} className="flex items-center space-x-4 mb-3">
              <Avatar
                img={
                  m.user?.avatar ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                rounded
              />
              <span className="text-color">
                {m.user?.name + " (" + m.user.email + ")" || "Guest"}
              </span>
            </div>
          ))}
      </div>

      {/* MODAL ADD MEMBER */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="bg-green">
          Add {addMode === "teacher" ? "Teacher" : "Student"}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {users?.map((u: User) => (
              <label key={u?.id} className="flex items-center gap-2 ml-1">
                <Checkbox
                  checked={selectedUserIds.includes(u?.id)}
                  onChange={() => handleCheckboxChange(u?.id)}
                />
                <Avatar img={u.avatar} rounded />
                <span>{u?.name || "No Name"}</span>
                <span className="text-gray-500">{`(${u.email})`}</span>
              </label>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="bg-green" onClick={handleAdd}>
            Add
          </Button>
          <Button color="gray" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
