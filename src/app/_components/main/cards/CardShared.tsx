"use client";

export interface CardType {
  title: string;
  isStart: boolean;
  id?: string;
  pathsId?: string;
  image?: {
    x: number;
    y: number;
    width: number;
    height?: number;
    href: string;
  } | null;
  texts: {
    fontSize: number;
    x: number;
    y: number;
    text: string;
    color: string;
  }[];
}
