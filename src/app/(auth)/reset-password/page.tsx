"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { authService } from "~/services/authService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await authService.requestResetPassword(email);
      toast.success(t("resetPasswordPage.otpSent"));
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.warning(t("resetPasswordPage.otpRequired"));
      return;
    }
    setStep(3);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const res = await authService.verifyResetPassword(email, otp, password);
      if (res.message === "Password has been reset") {
        toast.success(t("resetPasswordPage.passwordResetSuccess"));
        router.push("/sign-in");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-stage w-full min-h-screen flex items-center justify-center px-4 py-10">
      <div className="glass-panel max-w-md w-full rounded-2xl p-7 space-y-5">
        <div className="text-center">
          <p className="section-kicker">Account recovery</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#10201d]">
            {t("resetPasswordPage.resetPassword")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify your email and create a fresh password securely.
          </p>
        </div>

        {step === 1 && (
          <>
            <LewisTextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("resetPasswordPage.enterEmail")}
              required
            />
            <LewisButton
              onClick={handleRequestOtp}
              lewisSize="full"
              disabled={loading}
            >
              {t("resetPasswordPage.sendOtp")}
            </LewisButton>
          </>
        )}

        {step === 2 && (
          <>
            <LewisTextInput
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t("resetPasswordPage.enterOtp")}
              required
            />
            <LewisButton
              onClick={handleVerifyOtp}
              lewisSize="full"
              disabled={loading}
            >
              {t("resetPasswordPage.verifyOtp")}
            </LewisButton>
          </>
        )}

        {step === 3 && (
          <>
            <LewisTextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("resetPasswordPage.newPassword")}
              required
            />
            <LewisButton
              onClick={handleChangePassword}
              lewisSize="full"
              disabled={loading}
            >
              {t("resetPasswordPage.resetPassword")}
            </LewisButton>
          </>
        )}
      </div>
    </div>
  );
}
