"use client";

export type QrType = {
  title: string;
  id?: string;
  cardAddIds: string[];
  cardRemoveIds: string[];
  locks: string[];
  unlockPathId?: string;
};
