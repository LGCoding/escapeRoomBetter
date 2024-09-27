"use client";
import * as htmlToImage from "html-to-image";
import { useContext, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { type QrType } from "./qrShared";
import { siteOptionsContext } from "~/app/(internal)/layoutStuff";

interface QrProps {
  qr: QrType;
  openCallback: () => void;
  onClick?: () => void;
}

export default function Qr({ qr, onClick }: QrProps) {
  const siteOptions = useContext(siteOptionsContext);
  const handleImageDownload = async () => {
    setBig(true);
    setTimeout(() => {
      const element = document.getElementById("print" + qr.id);
      if (!element) return;
      htmlToImage
        .toPng(element)
        .then(function (dataUrl) {
          const aElement = document.createElement("a");
          aElement.setAttribute("download", qr.title + "qrcode");
          aElement.href = dataUrl;
          aElement.setAttribute("target", "_blank");
          aElement.click();
          setBig(false);
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
    }, 1000);
  };
  const [big, setBig] = useState(false);
  return (
    <div
      style={{
        display: "inline-block",
        margin: ".25rem",
        borderStyle: "solid",
        borderWidth: ".25rem",
        borderColor: "#555555",
        borderRadius: ".25rem",
      }}
      onClick={() => {
        if (onClick) onClick();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        void handleImageDownload();
      }}
    >
      <h2 style={{ textAlign: "center" }}>{qr.title || "___"}</h2>
      <QRCode
        size={big ? 1000 : 200}
        logoWidth={big ? 400 : 50}
        logoImage={siteOptions.icon}
        id={"print" + qr.id}
        ecLevel="H"
        value={qr.id ?? ""}
      />
    </div>
  );
}
