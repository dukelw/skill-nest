import { Modal, ModalHeader, ModalBody } from "~/components/ui/primitives";
import { KeyRound, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  show: boolean;
  onClose: () => void;
  onSelect: (type: "create" | "join") => void;
}

export default function SelectActionModal({ show, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={onClose} size="md">
      <ModalHeader className="modal-titlebar">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {t("select")}
          </h2>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Choose how you want to start working with a classroom.
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="grid gap-3 p-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("create")}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <PlusCircle className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">
              {t("createClassroom")}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Create a managed teaching space.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("join")}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-sky-200 hover:bg-sky-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <KeyRound className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">
              {t("joinClassroom")}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Enter a code shared by your teacher.
            </span>
          </span>
        </button>
      </ModalBody>
    </Modal>
  );
}
