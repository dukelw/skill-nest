import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import { KeyRound, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/Partial/LewisButton";

interface Props {
  show: boolean;
  onClose: () => void;
  onSelect: (type: "create" | "join") => void;
}

export default function SelectActionModal({ show, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        {t("select")}
      </ModalHeader>
      <ModalBody className="flex justify-around gap-4">
        <LewisButton onClick={() => onSelect("create")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {t("createClassroom")}
        </LewisButton>
        <LewisButton onClick={() => onSelect("join")}>
          <KeyRound className="w-4 h-4 mr-2" />
          {t("joinClassroom")}
        </LewisButton>
      </ModalBody>
    </Modal>
  );
}
