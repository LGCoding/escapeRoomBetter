"use client";
import React, { useContext } from "react";
import { siteOptionsContext } from "../layoutStuff";
import markdownit from "markdown-it";
//@ts-expect-error no types
import sup from "markdown-it-sup";
//@ts-expect-error no types
import sub from "markdown-it-sub";
//@ts-expect-error no types
import deflist from "markdown-it-deflist";
//@ts-expect-error no types
import foot from "markdown-it-footnote";
//@ts-expect-error no types
import mark from "markdown-it-mark";

// Enable everything
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(sup)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(sub)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(deflist)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(foot)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(mark);
//   .use(table);

export default function Main() {
  const siteOptions = useContext(siteOptionsContext);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: md.render(siteOptions.homeText) }}
    ></div>
  );
}
