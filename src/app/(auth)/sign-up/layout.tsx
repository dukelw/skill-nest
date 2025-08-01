import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Nest | Sign Up",
  description: "Đăng nhập vào nền tảng học tập Skill Nest",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
