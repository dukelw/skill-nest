import Image from "next/image";
import { useClassroomStore } from "~/store/classroomStore";
import {
  Dropdown,
  DropdownItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
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
  const [file, setFile] = useState<File | null>(null); // State to hold file
  const [code, setCode] = useState<string | undefined>(classroom?.code); // State to hold file
  const [modalType, setModalType] = useState<
    "student" | "code" | "avatar" | null
  >(null);
  const openModal = modalType !== null;
  const socket = useSocket();
  const [openMeetingModal, setOpenMeetingModal] = useState<ModalType>(null);
  const { t } = useTranslation();

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
      {/* Modal Flowbite */}
      <Modal show={openModal} onClose={() => setModalType(null)}>
        {modalType === "student" && (
          <>
            <ModalHeader className="bg-green-500 text-white">
              {t("streamComponent.studentList")}
            </ModalHeader>
            <ModalBody>
              {classroom?.members?.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-green-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(member.user?.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudentIds([
                          ...selectedStudentIds,
                          member.user?.id,
                        ]);
                      } else {
                        setSelectedStudentIds(
                          selectedStudentIds.filter(
                            (id) => id !== member.user?.id
                          )
                        );
                      }
                    }}
                  />
                  <span>{member.user.name}</span>
                </label>
              ))}
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setModalType(null)}>{t("close")}</button>
            </ModalFooter>
          </>
        )}

        {modalType === "code" && (
          <>
            <ModalHeader className="bg-green-500 text-white">
              {t("streamComponent.changeCode")}
            </ModalHeader>
            <ModalBody>
              <LewisTextInput
                type="text"
                placeholder={t("streamComponent.enterNewCode")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <LewisButton
                color="red"
                lewisSize="small"
                onClick={() => setModalType(null)}
              >
                {t("cancel")}
              </LewisButton>
              <LewisButton onClick={handleChange}>Lưu</LewisButton>
            </ModalFooter>
          </>
        )}

        {modalType === "avatar" && (
          <>
            <ModalHeader className="bg-green-500 text-white">
              {t("streamComponent.changeThumb")}
            </ModalHeader>
            <ModalBody>
              <input
                placeholder={t("thumbnail")}
                name="thumbnail"
                type="file"
                onChange={handleFileChange}
                className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
              />
            </ModalBody>
            <ModalFooter>
              <LewisButton
                color="red"
                lewisSize="small"
                onClick={() => setModalType(null)}
              >
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
      <div className="w-full h-[320px] relative rounded overflow-hidden shadow">
        {/* Background Image */}
        <Image
          alt="Thumbnail"
          src={
            classroom?.thumbnail ||
            "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
          }
          layout="fill"
          objectFit="cover"
        />

        {/* Classroom Name - Bottom Left */}
        <div className="absolute bottom-4 left-4">
          <h2 className="text-xl font-semibold text-white drop-shadow-md">
            {classroom?.name}
          </h2>
        </div>

        {/* Change Thumbnail - Top Right */}
        {classroom?.creatorId === user?.id && (
          <div className="absolute top-4 right-4">
            <Dropdown
              label=""
              renderTrigger={() => (
                <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 shadow">
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Class Info - 3/12 */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          {/* Block 1: Class Code - nền xám */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  {t("streamComponent.classCode")}
                </p>
                <h4 className="text-lg font-semibold">{classroom?.code}</h4>
              </div>
              <Dropdown
                label=""
                renderTrigger={() => (
                  <button className="p-2 rounded hover:bg-gray-100">
                    <HiOutlineDotsVertical className="text-gray-500 w-5 h-5" />
                  </button>
                )}
                placement="bottom-end"
                inline
              >
                <DropdownItem
                  onClick={() =>
                    navigator.clipboard.writeText(classroom?.code || "")
                  }
                >
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
          <div className="bg-gray-50 p-4 rounded shadow">
            <div className="w-full">
              <p className="text-gray-500 text-sm">
                {t("streamComponent.meeting")}
              </p>
              <div className="w-full flex items-center justify-between mt-2">
                {classroom?.creatorId === user?.id ? (
                  <div className="w-full flex items-center justify-around">
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
                  </div>
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
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-sm text-gray-600 font-medium mb-2">
              {t("streamComponent.upcoming")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {filteredAssignments?.map((a) => (
                <li key={a.id}>
                  - {a.title} (
                  {new Date(a.dueDate).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  )
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* New Content - 9/12 */}
        <div className="col-span-12 md:col-span-9 p-6 bg-white rounded shadow space-y-4">
          {classroom?.creatorId === user?.id && (
            <>
              <h2 className="text-xl font-semibold">
                {t("streamComponent.createNew")}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={classroom?.name}
                  readOnly
                  className="rounded px-2 py-2 bg-gray-100 cursor-default select-none outline-none w-full sm:w-auto"
                />

                <LewisButton
                  space={false}
                  className="py-0 sm:ml-auto"
                  onClick={() => setModalType("student")}
                >
                  👥{" "}
                  {selectedStudentIds.length === 0
                    ? t("streamComponent.allMembers")
                    : `${selectedStudentIds.length} ${t(
                        "streamComponent.members"
                      )}`}
                </LewisButton>
              </div>

              <div className="mx-auto mt-2">
                <RichTextEditor content={content} onChange={setContent} />

                {content !== "" && (
                  <h2 className="text-xl font-bold mt-2">Preview:</h2>
                )}
                {content !== "" && (
                  <div
                    className="prose border border-green-500 p-3 mt-2"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )}
              </div>

              {/* Footer actions */}
              <div className="flex justify-end items-center pt-2">
                <div className="flex space-x-2">
                  <LewisButton lewisSize="small" color="red">
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
            </>
          )}
          <>
            <h2 className="text-lg font-semibold">
              📢 {t("streamComponent.allNoti")}
            </h2>
            {classroom?.creatorId === user?.id && (
              <div className="w-full flex justify-between items-center">
                {classroom?.creatorId === user?.id && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={
                        selectedNotificationIds.length ===
                        classroom?.notifications.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allIds = classroom?.notifications?.map(
                            (n) => n.id
                          );
                          setSelectedNotificationIds(allIds ?? []);
                        } else {
                          setSelectedNotificationIds([]);
                        }
                      }}
                    />
                    <span className="text-sm">
                      {t("streamComponent.chooseAll")}
                    </span>
                  </div>
                )}
                <span
                  onClick={handleDeleteNotification}
                  className="text-sm text-red-600 cursor-pointer"
                >
                  {t("delete")}
                </span>
              </div>
            )}

            {classroom?.notifications
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              ?.map((n) => {
                // Kiểm tra xem người dùng có phải là người nhận thông báo này không
                const isRecipient = n.recipients.some(
                  (recipient) =>
                    recipient.userId === user?.id ||
                    user?.id === classroom.creatorId // currentUserId là id của người dùng hiện tại
                );

                if (!isRecipient) return null; // Nếu không phải người nhận, không hiển thị thông báo

                return (
                  <div
                    key={n.id}
                    className="border border-gray-200 p-4 rounded hover:shadow transition"
                  >
                    <div className="flex justify-between items-center"></div>
                    <div className="w-full flex justify-between items-center">
                      <h3 className="text-base font-semibold mb-1">
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
                      className="prose text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: n.content }}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      {t("streamComponent.sendAt")}:{" "}
                      {new Date(n.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                );
              })}
          </>
        </div>
      </div>
    </div>
  );
}
