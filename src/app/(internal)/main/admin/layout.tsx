"use client";
import { useContext } from "react";
import { ButtonGroup } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import NavButton from "~/app/_components/main/navButton";
import { sessionContext } from "../../layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const session = useContext(sessionContext);
  if (session.isAdmin) {
    return (
      <>
        <div
          style={{
            display: "grid",
            height: "100%",
            maxHeight: "100%",
            overflow: "hidden",
            gridTemplateColumns: "1fr",
            gridTemplateRows: "min-content minmax(0, 1fr)",
            gridTemplateAreas: `
                    'e'
                    'd'
                   `,
          }}
        >
          <div
            style={{
              gridArea: "e",
              textAlign: "center",
            }}
            className="bg-secondary"
          >
            <ButtonGroup>
              <NavButton href="/main/admin/" iconName="HouseDoorFill">
                Home
              </NavButton>
              <NavButton href="/main/admin/cards" iconName="FileLock2Fill">
                Cards
              </NavButton>
              <NavButton href="/main/admin/locks" iconName="LockFill">
                Locks
              </NavButton>
              <NavButton href="/main/admin/qrcode" iconName="QrCodeScan">
                {" "}
                Qr{" "}
              </NavButton>
              <NavButton href="/main/admin/paths" iconName="Shuffle">
                Paths
              </NavButton>
            </ButtonGroup>
          </div>
          <div
            className="overflow-auto"
            style={{
              padding: "0px",
              width: "102%",
              gridArea: "d",
            }}
          >
            {children}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="d-flex flex-column container">
        <div
          className="row align-items-center justify-content-center
        min-vh-100"
        >
          <div className="col-12 col-md-8 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="fw-bold text-uppercase mb-2 text-center ">
                  Escape Room
                </h2>
                <Image
                  src="/images/logo.svg"
                  alt="Brand"
                  style={{
                    width: "5rem",
                    left: "calc(50% - 2.5rem)",
                    position: "relative",
                  }}
                />
                <div className="mb-4">
                  <h5>You do not have permission</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
