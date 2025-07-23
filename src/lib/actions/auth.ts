"use server";

import { signIn, signOut } from "~/auth";

export const loginWithGithub = async () => {
  await signIn("github", { redirectTo: "/auth-callback" });
};

export const loginWithGoogle = async () => {
  await signIn("google", { redirectTo: "/auth-callback" });
};

export const loginWithFacebook = async () => {
  await signIn("facebook", { redirectTo: "/auth-callback" });
};

export const logout = async () => {
  await signOut({ redirect: false });
};
