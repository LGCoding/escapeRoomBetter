"use client";

export type UserType = {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: "USER" | "ADMIN";
  unlockedLocks: Record<string, number>;
};
