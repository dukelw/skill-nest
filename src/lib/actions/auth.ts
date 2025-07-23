"use server";

import { signIn, signOut } from "~/auth";

export const login = async () => {
  await signIn("github", { redirectTo: "/auth-callback" });
};

export const logout = async () => {
  await signOut({ redirect: false });
};
