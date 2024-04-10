"use client";
import { ButtonGroup } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import NavButton from "../_components/main/navButton";
import { createContext, useEffect, useState } from "react";
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap";
import { CheckCircle, InfoCircle, XCircle } from "react-bootstrap-icons";
import { api } from "~/trpc/react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface swal {
  title?: string;
  mainText?: string;
  icon?: "error" | "none" | "success" | "info";
  confirmButton?: boolean;
  cancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmCallback?: () => void;
  cancelCallback?: () => void;
}

interface session {
  isAdmin: boolean;
}

export const swalContext = createContext((swalInfo: swal) => {
  console.log(swalInfo);
});

export const sessionContext = createContext<session>({ isAdmin: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gottenSession, setGottenSession] = useState(false);
  const checkSession = api.login.checkSession.useQuery(
    {
      session:
        typeof window !== "undefined"
          ? localStorage?.getItem("session") ?? ""
          : "",
    },
    {
      enabled:
        typeof window !== "undefined" &&
        !!localStorage?.getItem("session") &&
        !gottenSession,
    },
  );
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!checkSession?.data) return;
    setGottenSession(true);
    if (!checkSession.data.valid && pathname.includes("/main")) {
      router.push("/");
    }
    if (checkSession.data.valid && !pathname.includes("/main")) {
      router.push("/main");
    }
    if (checkSession.data.valid) {
      setIsAdmin(checkSession.data.isAdmin);
    }
  }, [checkSession]);

  const [swalInfo, setSwalInfo] = useState<swal>({
    title: "Test",
    mainText: "This is a test",
    icon: "error",
  });
  function handleClose() {
    setShow(false);
  }

  function swal(swalInfo: swal) {
    setSwalInfo({
      title: "",
      mainText: "",
      icon: "none",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      ...swalInfo,
    });
    setAnimating(true);
    setShow(true);
    setTimeout(() => {
      setAnimating(false);
    }, 800);
  }
  return (
    <>
      <swalContext.Provider value={swal}>
        <sessionContext.Provider value={{ isAdmin }}>
          {children}
        </sessionContext.Provider>
      </swalContext.Provider>
      <div
        style={{
          display: show ? "block" : "none",
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 100000000000,
          left: 0,
          top: 0,
          backgroundColor: "rgba(50,50,50,.5)",
        }}
        onClick={handleClose}
      >
        <Card
          style={{
            width: "18rem",
            left: "calc(50% - 9rem)",
            top: "50%",
            translate: "0 -90%",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CardBody style={{ textAlign: "center" }}>
            {swalInfo?.icon === "error" ? (
              <div
                className={
                  styles.circleLoaderRed +
                  (!animating ? " " + styles.loadCompleteRed : "")
                }
              >
                <div
                  style={{ display: "block" }}
                  className={styles.error + " " + styles.draw}
                ></div>
              </div>
            ) : (
              ""
            )}
            {swalInfo?.icon === "success" ? (
              <div
                className={
                  styles.circleLoader +
                  (!animating ? " " + styles.loadComplete : "")
                }
              >
                <div
                  style={{ display: "block" }}
                  className={styles.checkmark + " " + styles.draw}
                ></div>
              </div>
            ) : (
              ""
            )}
            {swalInfo?.icon === "info" ? (
              <div
                className={
                  styles.circleLoaderOrange +
                  (!animating ? " " + styles.loadCompleteOrange : "")
                }
              >
                <div
                  style={{ display: "block" }}
                  className={styles.info + " " + styles.draw}
                ></div>
              </div>
            ) : (
              ""
            )}
            <CardTitle
              style={{
                fontSize: "2rem",
              }}
            >
              {swalInfo?.title ?? ""}
            </CardTitle>
            <CardText
              style={{
                fontSize: "1.5rem",
              }}
            >
              {swalInfo?.mainText ?? ""}
            </CardText>
            <Button
              style={{
                display: swalInfo?.confirmButton ?? true ? "inline" : "none",
                marginRight: ".5rem",
                marginLeft: ".5rem",
              }}
              variant="primary"
              onClick={() => {
                if (swalInfo.confirmCallback) {
                  swalInfo.confirmCallback();
                }
                handleClose();
              }}
            >
              {swalInfo.confirmButtonText}
            </Button>
            <Button
              style={{
                display: swalInfo?.cancelButton ?? true ? "inline" : "none",
                marginRight: ".5rem",
                marginLeft: ".5rem",
              }}
              onClick={() => {
                if (swalInfo.cancelCallback) {
                  swalInfo.cancelCallback();
                }
                handleClose();
              }}
              variant="danger"
            >
              {swalInfo.cancelButtonText}
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
