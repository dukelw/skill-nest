import {
  Avatar,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
import { useClassroomStore } from "~/store/classroomStore";
import User from "~/models/User";
import useUserStore from "~/store/userStore";
import { useEffect, useState } from "react";
import { classroomService } from "~/services/classroomService";
import { useParams } from "next/navigation";
import { useAuthStore } from "~/store/authStore";
import { userService } from "~/services/userService";
import Request from "~/models/Request";
import LewisButton from "../Partial/LewisButton";
import { useTranslation } from "react-i18next";
import { Search, UserPlus, UsersRound } from "lucide-react";
import EmptyState from "../EmptyState";

export default function People() {
  const { users, setUsers } = useUserStore();
  const { user } = useAuthStore();
  const { classroom, setClassroom } = useClassroomStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [addMode, setAddMode] = useState<"teacher" | "student">("student");
  const [requests, setRequests] = useState<Request[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const { classroomId } = useParams();
  const { t } = useTranslation();

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

  const teachers = classroom?.members?.filter((m) => m.role === "TEACHER") ?? [];
  const students = classroom?.members?.filter((m) => m.role === "STUDENT") ?? [];
  const filteredUsers =
    users?.filter((u: User) => {
      const keyword = userSearch.trim().toLowerCase();
      if (!keyword) return true;
      return `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(keyword);
    }) ?? [];

  return (
    <div className="space-y-5">
      {/* REQUEST */}
      <section className="detail-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Classroom access
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {t("peopleComponent.request")}
            </h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {requests?.length ?? 0} pending
          </span>
        </div>

        {requests?.length > 0 ? (
          <div className="space-y-3">
            {requests?.map((m: Request, index: number) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  img={
                    m?.user?.avatar ||
                    "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                  }
                  rounded
                  className="w-10 h-10"
                />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">
                      {m?.user?.name || "Guest"}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {m.user.email}
                    </span>
                  </span>
              </div>

                <div className="flex items-center justify-end gap-2">
                <LewisButton
                  lewisSize="small"
                  color="red"
                  onClick={() => handleReject(m.userId)}
                >
                  {t("reject")}
                </LewisButton>
                <LewisButton
                  lewisSize="small"
                  onClick={() => handleAccept(m.userId)}
                >
                  {t("accept")}
                </LewisButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            icon={UsersRound}
            eyebrow="No requests"
            title={t("peopleComponent.norequest")}
            description="New classroom join requests will appear here for quick review."
          />
        )}
      </section>

      {/* TEACHER */}
      <section className="detail-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Teaching team
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {t("peopleComponent.teacher")}
            </h2>
          </div>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => toggleModal("teacher")}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-[#eef7ef] px-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              <UserPlus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>

        {teachers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {teachers.map((m, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] p-3">
              <Avatar
                img={
                  m?.user?.avatar ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                rounded
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {m?.user?.name || "Guest"}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {m.user.email}
                </span>
              </span>
            </div>
            ))}
          </div>
        ) : (
          <EmptyState compact icon={UsersRound} eyebrow="No teachers" title="No teachers yet" />
        )}
      </section>

      {/* STUDENT */}
      <section className="detail-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Learners
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {t("peopleComponent.student")}
            </h2>
          </div>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => toggleModal("student")}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-[#eef7ef] px-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              <UserPlus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>

        {students.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {students.map((m, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] p-3">
              <Avatar
                img={
                  m.user?.avatar ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                rounded
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {m.user?.name || "Guest"}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {m.user.email}
                </span>
              </span>
            </div>
            ))}
          </div>
        ) : (
          <EmptyState compact icon={UsersRound} eyebrow="No students" title="No students yet" />
        )}
      </section>

      {/* MODAL ADD MEMBER */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {t("add")} {addMode === "teacher" ? "Teacher" : "Student"}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Search and select users to add to this classroom.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="modal-body-pad">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users"
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#f7fbf7] pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {filteredUsers?.map((u: User) => (
              <label
                key={u?.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Checkbox
                  checked={selectedUserIds.includes(u?.id)}
                  onChange={() => handleCheckboxChange(u?.id)}
                />
                <Avatar img={u.avatar} rounded />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    {u?.name || "No Name"}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {u.email}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </ModalBody>
        <ModalFooter className="modal-footer-actions">
          <Button color="gray" onClick={() => setIsModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAdd}>{t("add")}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
