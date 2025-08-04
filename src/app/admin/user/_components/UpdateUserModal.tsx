import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { Avatar } from "flowbite-react";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { uploadService } from "~/services/uploadService";
import { userService } from "~/services/userService";
import { toast } from "react-toastify";
import User from "~/models/User";
import { fallbackUserAvatar } from "~/constant";
import { useTranslation } from "react-i18next";

interface Props {
  show: boolean;
  onClose: () => void;
  user: User;
  onUpdated?: () => void;
}

export default function UpdateUserModal({
  show,
  onClose,
  user,
  onUpdated,
}: Props) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    avatar: user.avatar || "",
    gender: user.gender || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let fileUrl = form.avatar;
    try {
      if (file) {
        fileUrl = await uploadService.uploadFile(file);
      }

      await userService.updateUser({
        userId: user.id,
        ...form,
        avatar: fileUrl,
      });

      toast.success(t("userModal.updateSuccessfully"));
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error("userModal.updateFailed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        gender: user.gender || "",
      });
      setPreview(user.avatar || "");
    }
  }, [user]);

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <ModalHeader className="bg-green">{t("update")}</ModalHeader>
      <ModalBody>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative w-fit group">
            <Avatar img={preview || fallbackUserAvatar} rounded size="lg" />
            <div className="absolute -bottom-1 -right-1">
              <label className="bg-green text-white rounded-full p-1 text-xs cursor-pointer shadow hover:bg-green-600 transition">
                ✏️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LewisTextInput
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("name")}
          />
          <LewisTextInput
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={t("phone")}
          />
          <LewisTextInput
            name="gender"
            value={form.gender}
            onChange={handleChange}
            placeholder={t("gender")}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button color="green" onClick={handleSave} disabled={loading}>
          {loading ? t("saving") : t("saveChanges")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
