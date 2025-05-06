/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  users: any;
  setUsers: (users: any) => void;
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: null,
      setUsers: (users) => set({ users }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
