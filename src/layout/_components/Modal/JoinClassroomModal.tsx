import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";

interface Props {
  show: boolean;
  onClose: () => void;
  joinCode: string;
  setJoinCode: (value: string) => void;
  onSubmit: () => void;
}

export default function JoinClassroomModal({
  show,
  onClose,
  joinCode,
  setJoinCode,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        {t("joinClassroom")}
      </ModalHeader>
      <ModalBody>
        <LewisTextInput
          name="code"
          placeholder={t("classroomCode")}
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={onSubmit}>{t("submit")}</LewisButton>
        <LewisButton variant="outlined" onClick={onClose}>
          {t("cancel")}
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
