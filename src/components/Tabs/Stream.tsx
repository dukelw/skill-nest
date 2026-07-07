import Image from "next/image";
import { useClassroomStore } from "~/store/classroomStore";
import {
  Dropdown,
  DropdownItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useState } from "react";
import RichTextEditor from "../Editor/RichTextEditor";
import LewisButton from "../Partial/LewisButton";
import { notificationService } from "~/services/notificationService";
import { classroomService } from "~/services/classroomService";
import { useParams } from "next/navigation";
import { useAuthStore } from "~/store/authStore";
import Assignment from "~/models/Assignment";
import LewisTextInput from "../Partial/LewisTextInput";
import { uploadService } from "~/services/uploadService";
import useSocket from "~/hooks/useSocket";
import MeetingModal from "../Meeting/MeetingModal";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarClock,
  Check,
  CheckCheck,
  Copy,
  Hash,
  Inbox,
  MegaphoneIcon,
  Search,
  Trash2,
  Upload,
  UsersIcon,
  Video,
} from "lucide-react";

type ModalType = "new" | "join" | "schedule" | null;

export default function Stream() {
  const { classroom, setClassroom } = useClassroomStore();
  const { user } = useAuthStore();
  const { classroomId } = useParams();
  const [content, setContent] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    number[]
  >([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [file, setFile] = useState<File | null>(null); // State to hold file
  const [code, setCode] = useState<string | undefined>(classroom?.code); // State to hold file
  const [modalType, setModalType] = useState<
    "student" | "code" | "avatar" | null
  >(null);
  const openModal = modalType !== null;
  const socket = useSocket();
  const [openMeetingModal, setOpenMeetingModal] = useState<ModalType>(null);
  const { t } = useTranslation();

  const studentMembers =
    classroom?.members?.filter((member) => member.role === "STUDENT") ?? [];
  const filteredStudentMembers = studentMembers.filter((member) => {
    const keyword = memberSearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${member.user?.name ?? ""} ${member.user?.email ?? ""}`
      .toLowerCase()
      .includes(keyword);
  });
  const visibleNotifications =
    classroom?.notifications
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((n) =>
        n.recipients.some(
          (recipient) =>
            recipient.userId === user?.id || user?.id === classroom.creatorId
        )
      ) ?? [];
  const selectedStudents = studentMembers.filter((member) =>
    selectedStudentIds.includes(member.userId)
  );

  const handleGetClassroomDetail = async () => {
    const res = await classroomService.getDetail(Number(classroomId));
    setClassroom(res);
  };

  const handlePostNotification = async () => {
    if (!classroom) return;

    const res = await notificationService.createNotification({
      title: "Thông báo mới",
      content,
      classroomId: classroom.id,
      recipientIds:
        selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
    });

    if (res) {
      const memberIds = classroom.members
        .filter((member) => member.userId !== user?.id)
        ?.map((member) => member.userId);
      const plainContent = content.replace(/<[^>]+>/g, "");

      socket?.emit("createAnnouncement", {
        title: "Thông báo lớp học",
        content: `Lớp học "${classroom.name}" có thông báo mới: ${plainContent}`,
        senderId: user?.id,
        href: `/teaching/${classroom.id}`,
        userIds: selectedStudentIds.length > 0 ? selectedStudentIds : memberIds,
      });

      await handleGetClassroomDetail();
      setContent("");
      setSelectedStudentIds([]);
    }
  };

  const handleCopyClassCode = async () => {
    if (!classroom?.code) return;
    await navigator.clipboard.writeText(classroom.code);
    setCopiedCode(true);
    toast.success("Copied");
    window.setTimeout(() => setCopiedCode(false), 1600);
  };

  const handleDeleteNotification = async () => {
    try {
      await notificationService.deleteNotifications(selectedNotificationIds);
      await handleGetClassroomDetail();
      setSelectedNotificationIds([]);
    } catch (err) {
      console.error("Lỗi khi xóa thông báo:", err);
    }
  };

  const today = new Date();
  const filteredAssignments = classroom?.assignments
    .filter((a) => new Date(a.dueDate) > today && a.type !== "DOCUMENT")
    .sort(
      (a: Assignment, b: Assignment) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // Set the selected file
    }
  };

  const handleChange = async () => {
    if (modalType === "avatar") {
      let fileUrl = "";

      if (file) {
        fileUrl = await uploadService.uploadFile(file);
        await classroomService.update(classroom!.id, { thumbnail: fileUrl });
      }
    } else if (modalType === "code") {
      await classroomService.update(classroom!.id, { code });
    }
    handleGetClassroomDetail();
    setModalType(null);
  };

  return (
    <div className="space-y-6">
      {/* Classroom modal */}
      <Modal show={openModal} onClose={() => setModalType(null)} size="md">
        {modalType === "student" && (
          <>
            <ModalHeader className="modal-titlebar">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Chọn người nhận
                </h2>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Thông báo sẽ gửi tới toàn bộ lớp hoặc nhóm học sinh được chọn.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="modal-body-pad">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                      selectedStudentIds.length === 0
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-[#f7fbf7] text-slate-700 hover:border-emerald-200"
                    }`}
                  >
                    <span className="block text-sm font-bold">Tất cả học sinh</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Gửi cho {studentMembers.length} thành viên trong lớp.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudentIds.length === 0 && studentMembers[0]) {
                        setSelectedStudentIds([studentMembers[0].userId]);
                      }
                    }}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                      selectedStudentIds.length > 0
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-[#f7fbf7] text-slate-700 hover:border-emerald-200"
                    }`}
                  >
                    <span className="block text-sm font-bold">Chọn học sinh</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Đã chọn {selectedStudentIds.length} người nhận.
                    </span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-[#f7fbf7] pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {filteredStudentMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
                        checked={selectedStudentIds.includes(member.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds((prev) => [
                              ...new Set([...prev, member.userId]),
                            ]);
                          } else {
                            setSelectedStudentIds((prev) =>
                              prev.filter((id) => id !== member.userId)
                            );
                          }
                        }}
                      />
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                        {(member.user?.name || member.user?.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {member.user?.name || "No Name"}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {member.user?.email}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="modal-footer-actions">
              <LewisButton
                variant="outlined"
                onClick={() => setSelectedStudentIds([])}
              >
                Chọn tất cả
              </LewisButton>
              <LewisButton variant="outlined" onClick={() => setModalType(null)}>
                Xong
              </LewisButton>
            </ModalFooter>
          </>
        )}

        {modalType === "code" && (
          <>
            <ModalHeader className="modal-titlebar">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  {t("streamComponent.changeCode")}
                </h2>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Update the code students use to request access.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="modal-body-pad">
              <LewisTextInput
                type="text"
                placeholder={t("streamComponent.enterNewCode")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </ModalBody>
            <ModalFooter className="modal-footer-actions">
              <LewisButton variant="outlined" onClick={() => setModalType(null)}>
                {t("cancel")}
              </LewisButton>
              <LewisButton onClick={handleChange}>Lưu</LewisButton>
            </ModalFooter>
          </>
        )}

        {modalType === "avatar" && (
          <>
            <ModalHeader className="modal-titlebar">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  {t("streamComponent.changeThumb")}
                </h2>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Choose a new classroom cover image.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="modal-body-pad">
              <label className="file-input-card">
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                    <Upload className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-medium text-slate-800">
                      {file?.name || t("thumbnail")}
                    </span>
                    <span className="text-xs text-slate-500">PNG, JPG, or WEBP</span>
                  </span>
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Browse
                </span>
                <input
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </ModalBody>
            <ModalFooter className="modal-footer-actions">
              <LewisButton variant="outlined" onClick={() => setModalType(null)}>
                {t("cancel")}
              </LewisButton>
              <LewisButton onClick={handleChange}>Cập nhật</LewisButton>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Meeting Modal */}
      <MeetingModal
        openModal={openMeetingModal}
        setOpenModal={setOpenMeetingModal}
      />

      {/* Thumbnail */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        {/* Background Image */}
        <Image
          alt="Thumbnail"
          src={classroom?.thumbnail || "/logo-big.png"}
          fill
          className={classroom?.thumbnail ? "object-cover" : "object-contain p-8"}
        />
        <div
          className={`absolute inset-0 ${
            classroom?.thumbnail ? "bg-black/25" : "bg-emerald-950/10"
          }`}
        />

        {/* Classroom Name - Bottom Left */}
        <div className="absolute bottom-5 left-5 right-5">
          <p className="mb-2 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {classroom?.code}
          </p>
          <h2 className="text-2xl font-semibold text-white drop-shadow-md">
            {classroom?.name}
          </h2>
        </div>

        {/* Change Thumbnail - Top Right */}
        {classroom?.creatorId === user?.id && (
          <div className="absolute top-4 right-4">
            <Dropdown
              label=""
              renderTrigger={() => (
                <button className="rounded-full bg-white/95 p-2 shadow-sm transition hover:bg-white hover:shadow-md">
                  <HiOutlineDotsVertical className="text-gray-700 w-5 h-5" />
                </button>
              )}
              placement="bottom-end"
              inline
            >
              <DropdownItem
                className="w-max"
                onClick={() => setModalType("avatar")}
              >
                {t("streamComponent.changeThumb")}
              </DropdownItem>
            </Dropdown>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Class Info - 3/12 */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          {/* Block 1: Class Code - nền xám */}
          <div className="detail-panel p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Hash className="h-4 w-4" />
                </span>
                <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t("streamComponent.classCode")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-950">
                    {classroom?.code}
                  </h4>
                  {copiedCode && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" />
                      Copied
                    </span>
                  )}
                </div>
                </div>
              </div>
              <Dropdown
                label=""
                renderTrigger={() => (
                  <button className="rounded-lg p-2 transition hover:bg-slate-100">
                    <HiOutlineDotsVertical className="text-gray-500 w-5 h-5" />
                  </button>
                )}
                placement="bottom-end"
                inline
              >
                <DropdownItem onClick={handleCopyClassCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("streamComponent.copy")}
                </DropdownItem>
                {classroom?.creatorId === user?.id && (
                  <div>
                    <DropdownItem
                      onClick={() => {
                        setCode(classroom?.code);
                        setModalType("code");
                      }}
                    >
                      {t("streamComponent.change")}
                    </DropdownItem>
                  </div>
                )}
              </Dropdown>
            </div>
          </div>
          <div className="detail-panel p-4">
            <div className="w-full">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Video className="h-4 w-4" />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t("streamComponent.meeting")}
                </p>
              </div>
              <div className="mt-3 flex w-full items-center justify-end gap-2">
                {classroom?.creatorId === user?.id ? (
                  <>
                    <LewisButton
                      lewisSize="small"
                      space={false}
                      onClick={() => setOpenMeetingModal("new")}
                    >
                      {t("streamComponent.new")}
                    </LewisButton>
                    <LewisButton
                      lewisSize="small"
                      space={false}
                      onClick={() => setOpenMeetingModal("schedule")}
                    >
                      {t("streamComponent.schedule")}
                    </LewisButton>
                  </>
                ) : (
                  <LewisButton
                    lewisSize="full"
                    space={false}
                    onClick={() => setOpenMeetingModal("join")}
                  >
                    {t("streamComponent.join")}
                  </LewisButton>
                )}
              </div>
            </div>
          </div>

          {/* Block 2: Upcoming Items - nền trắng hoặc trong suốt */}
          <div className="detail-panel p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarClock className="h-4 w-4 text-emerald-700" />
              {t("streamComponent.upcoming")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {filteredAssignments?.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                  {new Date(a.dueDate).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  </p>
                </li>
              ))}
              {filteredAssignments?.length === 0 && (
                <li className="text-sm text-slate-500">No upcoming items.</li>
              )}
            </ul>
          </div>
        </div>

        {/* New Content - 9/12 */}
        <div className="col-span-12 space-y-4 md:col-span-9">
          {classroom?.creatorId === user?.id && (
            <section className="detail-panel space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {t("streamComponent.createNew")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gửi thông báo cho lớp {classroom?.name} hoặc nhóm học sinh được chọn.
                  </p>
                </div>
                <LewisButton
                  space={false}
                  lewisSize="small"
                  className="sm:ml-auto"
                  onClick={() => setModalType("student")}
                >
                  <UsersIcon className="mr-2 h-4 w-4 text-white" />
                  {selectedStudentIds.length === 0
                    ? "Tất cả học sinh"
                    : `${selectedStudentIds.length} học sinh`}
                </LewisButton>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-[#eef7ef] p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Lớp nhận thông báo
                </p>
                <p className="mt-1 text-base font-bold text-slate-950">
                  {classroom?.name}
                </p>
                {selectedStudents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedStudents.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-800"
                      >
                        {member.user?.name || member.user?.email}
                      </span>
                    ))}
                    {selectedStudents.length > 5 && (
                      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-800">
                        +{selectedStudents.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mx-auto mt-2">
                <RichTextEditor content={content} onChange={setContent} />

                {content !== "" && (
                  <h2 className="mt-4 text-sm font-semibold text-slate-700">Preview</h2>
                )}
                {content !== "" && (
                  <div
                    className="prose mt-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )}
              </div>

              {/* Footer actions */}
              <div className="flex justify-end items-center pt-2">
                <div className="flex gap-2">
                  <LewisButton lewisSize="small" variant="outlined">
                    {t("cancel")}
                  </LewisButton>
                  <LewisButton
                    space={false}
                    lewisSize="small"
                    onClick={handlePostNotification}
                  >
                    {t("post")}
                  </LewisButton>
                </div>
              </div>
            </section>
          )}
          <section className="detail-panel space-y-4 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <MegaphoneIcon className="h-5 w-5 text-emerald-700" />
              Thông báo của lớp {classroom?.name}
            </h2>
            {classroom?.creatorId === user?.id && visibleNotifications.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#f7fbf7] px-3 py-2">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => {
                    if (selectedNotificationIds.length === visibleNotifications.length) {
                      setSelectedNotificationIds([]);
                    } else {
                      setSelectedNotificationIds(
                        visibleNotifications.map((n) => n.id)
                      );
                    }
                  }}
                >
                  <CheckCheck className="h-4 w-4" />
                  {selectedNotificationIds.length === visibleNotifications.length
                    ? "Bỏ chọn"
                    : "Chọn tất cả"}
                </button>
                <button
                  type="button"
                  disabled={selectedNotificationIds.length === 0}
                  onClick={handleDeleteNotification}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa đã chọn
                </button>
              </div>
            )}

            {visibleNotifications.length === 0 && (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-[#eef7ef] px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Inbox className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">
                  Chưa có thông báo nào
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Khi có cập nhật mới cho lớp {classroom?.name}, nội dung sẽ
                  xuất hiện ở đây theo thời gian mới nhất.
                </p>
              </div>
            )}

            {visibleNotifications.map((n) => {
                // Kiểm tra xem người dùng có phải là người nhận thông báo này không
                const isRecipient = n.recipients.some(
                  (recipient) =>
                    recipient.userId === user?.id ||
                    user?.id === classroom?.creatorId // currentUserId là id của người dùng hiện tại
                );

                if (!isRecipient) return null; // Nếu không phải người nhận, không hiển thị thông báo

                return (
                  <div
                    key={n.id}
                    className="rounded-xl border border-slate-200 bg-[#f7fbf7] p-4 transition hover:border-emerald-200 hover:shadow-sm"
                  >
                    <div className="flex justify-between items-center"></div>
                    <div className="w-full flex justify-between items-center">
                      <h3 className="mb-1 text-base font-semibold text-slate-950">
                        {n.title}
                      </h3>
                      {/* Checkbox và nút xóa chỉ hiển thị nếu người tạo lớp */}
                      {classroom?.creatorId === user?.id && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={selectedNotificationIds.includes(n.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotificationIds((prev) => [
                                  ...prev,
                                  n.id,
                                ]);
                              } else {
                                setSelectedNotificationIds((prev) =>
                                  prev.filter((id) => id !== n.id)
                                );
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div
                      className="prose text-sm text-slate-700"
                      dangerouslySetInnerHTML={{ __html: n.content }}
                    />
                    <p className="mt-3 text-xs text-slate-400">
                      {t("streamComponent.sendAt")}:{" "}
                      {new Date(n.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                );
              })}
          </section>
        </div>
      </div>
    </div>
  );
}
