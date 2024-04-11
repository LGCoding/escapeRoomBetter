"use client";
import LayoutStuff from "./layoutStuff";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutStuff>{children}</LayoutStuff>
    </>
  );
}
