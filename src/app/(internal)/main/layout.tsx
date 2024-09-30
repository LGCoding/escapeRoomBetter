"use client";
import { useContext, useEffect } from "react";
import { ButtonGroup } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { isMobile } from "react-device-detect";
import NavButton from "../../_components/main/navButton";
import {
  sessionContext,
  siteOptionsContext,
  swalContext,
} from "../layoutStuff";
import React from "react";
import moment from "moment";

export default function Layout({ children }: { children: React.ReactNode }) {
  const session = useContext(sessionContext);
  const siteOptions = useContext(siteOptionsContext);
  const swal = useContext(swalContext);
  useEffect(() => {
    if (
      siteOptions.openTime.getTime() > new Date().getTime() &&
      !session.isAdmin
    ) {
      swal({
        cancelButton: false,
        confirmButton: false,
        icon: "info",
        title: "We are not open yet",
        allowClickOut: false,
        allowEscape: false,
        mainText:
          "Come back " +
          moment(siteOptions.openTime).fromNow() +
          " Opens " +
          moment(siteOptions.openTime).format("MMMM Do YYYY, h:mm:ss a"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteOptions.openTime]);
  return (
    <>
      <div
        style={{
          display: "grid",
          height: "100%",
          maxHeight: "100%",
          overflow: "hidden",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "min-content minmax(0, 1fr) min-content",
          gridTemplateAreas: `
                    'a'
                    'b'
                    'c'
                   `,
        }}
      >
        <div
          style={{
            gridArea: "a",
          }}
        >
          <h2 className="fw-bold border-bottom text-uppercase mb-2 pb-2 text-center ">
            <Image
              src={siteOptions.icon}
              alt="Brand"
              style={{
                width: "2.5rem",
                position: "relative",
                display: "inline",
              }}
            />{" "}
            {siteOptions.title}{" "}
            <Image
              src={siteOptions.icon}
              alt="Brand"
              style={{
                width: "2.5rem",
                position: "relative",
                display: "inline",
              }}
            />
          </h2>
        </div>
        <div
          className="overflow-auto"
          style={{
            gridArea: "b",
            padding: ".25rem",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
        <div
          style={{
            gridArea: "c",
            textAlign: "center",
          }}
          className=""
        >
          <ButtonGroup>
            <NavButton href="/main" iconName="HouseDoorFill">
              Home
            </NavButton>
            <NavButton href="/main/qr" iconName="QrCodeScan">
              Qrcode
            </NavButton>
            <NavButton href="/main/cards" iconName="FileLock2Fill">
              Cards
            </NavButton>
            <NavButton href="/main/locks" iconName="LockFill">
              Locks
            </NavButton>
            {session.isAdmin && !isMobile ? (
              <NavButton href="/main/admin" iconName="PersonFillGear">
                Admin
              </NavButton>
            ) : (
              ""
            )}
            <NavButton
              iconName="BoxArrowRight"
              href="/"
              onClick={() => {
                localStorage.removeItem("session");
              }}
            >
              Logout
            </NavButton>
          </ButtonGroup>
        </div>
      </div>
    </>
  );
}
