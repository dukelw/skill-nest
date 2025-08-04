import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";

interface Props {
  show: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  form: { name: string; code: string; thumbnail: string };
}

export default function CreateClassroomModal({
  show,
  onClose,
  onChange,
  onFileChange,
  onSubmit,
  form,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        {t("createClassroom")}
      </ModalHeader>
      <ModalBody>
        <LewisTextInput
          name="name"
          placeholder={t("classroomName")}
          value={form.name}
          onChange={onChange}
          className="mb-4"
        />
        <LewisTextInput
          name="code"
          placeholder={t("classroomCode")}
          value={form.code}
          onChange={onChange}
        />
        <input
          name="thumbnail"
          type="file"
          onChange={onFileChange}
          className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
        />
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={onSubmit}>{t("create")}</LewisButton>
        <LewisButton variant="outlined" onClick={onClose}>
          {t("cancel")}
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
