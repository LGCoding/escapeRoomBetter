import "~/styles/globals.scss";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { useRouter } from "next/router";
import { Metadata } from "next";
import { api } from "~/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Escape St. Sebastian's",
  description: "The website for code 1111",
  icons: [{ rel: "icon", url: "/images/logo.svg" }],
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
