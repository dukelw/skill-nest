import { Modal, ModalHeader, ModalBody, ModalFooter } from "~/components/ui/primitives";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LoadingButton from "~/components/Partial/LoadingButton";

interface Props {
  show: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  form: { name: string; code: string; thumbnail: string };
  loading?: boolean;
}

export default function CreateClassroomModal({
  show,
  onClose,
  onChange,
  onFileChange,
  onSubmit,
  form,
  loading = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={() => !loading && onClose()} size="lg">
      <ModalHeader className="modal-titlebar">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {t("createClassroom")}
          </h2>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Set up the name, class code, and cover image.
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="modal-body-pad">
        <LewisTextInput
          name="name"
          placeholder={t("classroomName")}
          value={form.name}
          onChange={onChange}
          className="mb-4"
          disabled={loading}
        />
        <LewisTextInput
          name="code"
          placeholder={t("classroomCode")}
          value={form.code}
          onChange={onChange}
          disabled={loading}
        />
        <label className="file-input-card">
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
              <Upload className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-medium text-slate-800">
                Choose cover image
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
            onChange={onFileChange}
            className="sr-only"
            disabled={loading}
          />
        </label>
      </ModalBody>
      <ModalFooter className="modal-footer-actions">
        <LewisButton variant="outlined" onClick={onClose} disabled={loading}>
          {t("cancel")}
        </LewisButton>
        <LoadingButton onClick={onSubmit} loading={loading} loadingText="Creating...">
          {t("create")}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  );
}
