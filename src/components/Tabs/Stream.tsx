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
import RichTextEditor from "../editor/RichTextEditor";
import LewisButton from "../partial/LewisButton";
import { notificationService } from "~/services/notificationService";
import { toast } from "react-toastify";
import { classroomService } from "~/services/classroomService";
import { useParams } from "next/navigation";
import { useAuthStore } from "~/store/authStore";
import Assignment from "~/models/Assignment";

export default function Stream() {
  const { classroom, setClassroom } = useClassroomStore();
  const { user } = useAuthStore();
  const { classroomId } = useParams();
  const [content, setContent] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    number[]
  >([]);

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
      await handleGetClassroomDetail();
      setContent("");
      setSelectedStudentIds([]);
      toast.success("Đã đăng thông báo 🎉");
    }
  };

  const handleDeleteNotification = async () => {
    try {
      console.log("Sẽ xóa các thông báo có ID:", selectedNotificationIds);
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

  return (
    <div className="space-y-6">
      {/* Modal Flowbite */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader className="bg-green-500 text-white">
          Danh sách học viên
        </ModalHeader>
        <ModalBody className="space-y-2 max-h-[400px] overflow-y-auto">
          {classroom?.members?.map((member) => (
            <label
              key={member.id}
              className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-green-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(member.user.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudentIds([
                      ...selectedStudentIds,
                      member.user.id,
                    ]);
                  } else {
                    setSelectedStudentIds(
                      selectedStudentIds.filter((id) => id !== member.user.id)
                    );
                  }
                }}
              />
              <span>{member.user.name}</span>
            </label>
          ))}
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setOpenModal(false)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </ModalFooter>
      </Modal>
      {/* Thumbnail */}
      <div className="w-full h-[320px] relative rounded overflow-hidden shadow">
        {/* Background Image */}
        <Image
          alt="Thumbnail"
          src={
            classroom?.thumnail ||
            "https://cdn-media.sforum.vn/storage/app/media/Bookgrinder2/wuthering-waves-build-zani-9.jpg"
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
        {classroom?.creatorId === user.id && (
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
                onClick={() => alert("Change thumbnail")}
              >
                Đổi ảnh lớp
              </DropdownItem>
            </Dropdown>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Class Info - 3/12 */}
        <div className="col-span-3 space-y-4">
          {/* Block 1: Class Code - nền xám */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Class Code</p>
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
                  Copy
                </DropdownItem>
                {classroom?.creatorId === user.id && (
                  <div>
                    <DropdownItem onClick={() => alert("Change class code")}>
                      Change
                    </DropdownItem>
                    <DropdownItem onClick={() => alert("Disable class code")}>
                      Disable
                    </DropdownItem>
                  </div>
                )}
              </Dropdown>
            </div>
          </div>

          {/* Block 2: Upcoming Items - nền trắng hoặc trong suốt */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-sm text-gray-600 font-medium mb-2">
              Sắp đến hạn
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
        <div className="col-span-9 p-6 bg-white rounded shadow space-y-4">
          {classroom?.creatorId === user.id && (
            <>
              <h2 className="text-xl font-semibold">Tạo bài viết mới</h2>

              <div className="flex items-center space-x-2">
                <input
                  value={classroom?.name}
                  readOnly
                  className="rounded px-2 py-2 bg-gray-100 cursor-default select-none outline-none"
                />

                <LewisButton
                  space={false}
                  className="py-0"
                  onClick={() => setOpenModal(true)}
                >
                  👥{" "}
                  {selectedStudentIds.length === 0
                    ? "Tất cả học viên"
                    : `${selectedStudentIds.length} học viên`}
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
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                  <button>📎</button>
                  <button>📷</button>
                  <button>🔗</button>
                </div>
                <div className="flex space-x-2">
                  <LewisButton lewisSize="small" color="red">
                    Cancel
                  </LewisButton>
                  <LewisButton
                    space={false}
                    lewisSize="small"
                    onClick={handlePostNotification}
                  >
                    Post
                  </LewisButton>
                </div>
              </div>
            </>
          )}
          <>
            <h2 className="text-lg font-semibold">📢 Thông báo gần đây</h2>
            {classroom?.creatorId === user.id && <div className="w-full flex justify-between items-center">
              {classroom?.creatorId === user.id && (
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
                        const allIds = classroom?.notifications.map(
                          (n) => n.id
                        );
                        setSelectedNotificationIds(allIds ?? []);
                      } else {
                        setSelectedNotificationIds([]);
                      }
                    }}
                  />
                  <span className="text-sm">Chọn tất cả</span>
                </div>
              )}
              <span
                onClick={handleDeleteNotification}
                className="text-sm text-red-600 cursor-pointer"
              >
                Xóa
              </span>
            </div>}

            {classroom?.notifications
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((n) => {
                // Kiểm tra xem người dùng có phải là người nhận thông báo này không
                const isRecipient = n.recipients.some(
                  (recipient) =>
                    recipient.userId === user.id ||
                    user.id === classroom.creatorId // currentUserId là id của người dùng hiện tại
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
                      {classroom?.creatorId === user.id && (
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
                      Gửi lúc: {new Date(n.createdAt).toLocaleString("vi-VN")}
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
