import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Nest | Sign In",
  description: "Đăng nhập vào nền tảng học tập Skill Nest",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
