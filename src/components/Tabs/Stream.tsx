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

export default function Stream() {
  const { classroom } = useClassroomStore();
  const [content, setContent] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("Tất cả học viên");

  const handleSelect = (student: string) => {
    setSelectedStudent(student);
    setOpenModal(false); // đóng modal sau khi chọn
  };

  return (
    <div className="space-y-6">
      {/* Modal Flowbite */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader className="bg-green-500 text-white">
          Danh sách học viên
        </ModalHeader>
        <ModalBody className="space-y-2">
          {["Học viên A", "Học viên B", "Học viên C"].map((student) => (
            <button
              key={student}
              onClick={() => handleSelect(student)}
              className="w-full text-left px-3 py-2 rounded hover:bg-green-100"
            >
              {student}
            </button>
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
                <DropdownItem onClick={() => alert("Change class code")}>
                  Change
                </DropdownItem>
                <DropdownItem onClick={() => alert("Disable class code")}>
                  Disable
                </DropdownItem>
              </Dropdown>
            </div>
          </div>

          {/* Block 2: Upcoming Items - nền trắng hoặc trong suốt */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-sm text-gray-600 font-medium mb-2">
              Sắp đến hạn
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>- Bài tập Toán (10/05)</li>
              <li>- Bài viết Văn (12/05)</li>
            </ul>
          </div>
        </div>

        {/* New Content - 9/12 */}
        <div className="col-span-9 p-6 bg-white rounded shadow space-y-4">
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
              👥 {selectedStudent}
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
              <LewisButton space={false} lewisSize="small">
                Post
              </LewisButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
