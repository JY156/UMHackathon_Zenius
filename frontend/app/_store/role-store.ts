"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "manager" | "worker";

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "manager" as UserRole,
      setRole: (role: UserRole) => set({ role }),
    }),
    {
      name: "zenius-role-storage",
    }
  )
);
