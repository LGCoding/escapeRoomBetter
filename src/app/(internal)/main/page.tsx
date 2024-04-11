"use client";
import React, { useContext } from "react";
import { siteOptionsContext } from "../layoutStuff";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Main() {
  const siteOptions = useContext(siteOptionsContext);

  return (
    <>
      <Markdown remarkPlugins={[remarkGfm]}>{siteOptions.homeText}</Markdown>
    </>
  );
}
