import "~/styles/globals.scss";

import { Inter } from "next/font/google";

import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const data = await api.siteOptions.getSiteOptions();
export const metadata: Metadata = {
  title: data.wasError ? "Default Title" : data.data.title,
  description: "The website for code 1111",
  icons: [
    {
      rel: "icon",
      url: data.wasError
        ? "Default Title"
        : `data:image/svg+xml;base64,${data.data.icon}`,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <div
          style={{
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          {<TRPCReactProvider>{children}</TRPCReactProvider>}
        </div>
      </body>
    </html>
  );
}
