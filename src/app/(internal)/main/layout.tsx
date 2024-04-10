"use client";
import { useContext } from "react";
import { ButtonGroup } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { isMobile } from "react-device-detect";
import NavButton from "../../_components/main/navButton";
import { sessionContext } from "../layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const session = useContext(sessionContext);
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
          className="bg-secondary"
          style={{
            gridArea: "a",
          }}
        >
          <h2 className="fw-bold text-light text-uppercase mb-2 text-center ">
            <Image
              src="/images/logo.svg"
              alt="Brand"
              style={{
                width: "2.5rem",
                position: "relative",
                display: "inline",
              }}
            />{" "}
            Cipher Society{" "}
            <Image
              src="/images/logo.svg"
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
          className="bg-secondary"
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
