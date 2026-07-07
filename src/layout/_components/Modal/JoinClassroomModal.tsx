import { Modal, ModalHeader, ModalBody, ModalFooter } from "~/components/ui/primitives";
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
    <Modal show={show} onClose={onClose} size="md">
      <ModalHeader className="modal-titlebar">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {t("joinClassroom")}
          </h2>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Enter the code your teacher shared with you.
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="modal-body-pad">
        <LewisTextInput
          name="code"
          placeholder={t("classroomCode")}
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
      </ModalBody>
      <ModalFooter className="modal-footer-actions">
        <LewisButton variant="outlined" onClick={onClose}>
          {t("cancel")}
        </LewisButton>
        <LewisButton onClick={onSubmit}>{t("submit")}</LewisButton>
      </ModalFooter>
    </Modal>
  );
}
