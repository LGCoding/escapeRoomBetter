"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardText, CardTitle } from "react-bootstrap";
import { api } from "~/trpc/react";
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
export const siteOptionsContext = createContext({
  card: "string;",
  card2: "",
  homeText: "string;",
  icon: "string;",
  title: "string;",
  rerender: () => {
    return;
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gottenSession, setGottenSession] = useState(false);
  const [gottenSiteOptions, setGottenSiteOptions] = useState(false);
  const siteOptionsQuery = api.siteOptions.getSiteOptions.useQuery(undefined, {
    enabled: !gottenSiteOptions,
  });
  const rerender = useMemo(
    () => () => {
      void siteOptionsQuery.refetch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [siteOptions, setSiteOptions] = useState<{
    card: string;
    card2: string;
    homeText: string;
    icon: string;
    title: string;
    rerender: () => void;
  }>({
    card: "",
    card2: "",
    homeText: "",
    icon: "",
    title: "",
    rerender: rerender,
  });
  useEffect(() => {
    if (siteOptionsQuery.data) {
      setGottenSiteOptions(true);
      if (siteOptionsQuery.data.wasError) {
      } else {
        document.title = siteOptionsQuery.data.data.title;
        let link: (Element & { rel: string; href: string }) | null =
          document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = `data:image/svg+xml;base64,${siteOptionsQuery.data.data.icon}`;
        setSiteOptions({
          homeText: siteOptionsQuery.data.data.homeText,
          card: `data:image/svg+xml;base64,${siteOptionsQuery.data.data.card}`,
          card2: `data:image/svg+xml;base64,${siteOptionsQuery.data.data.card2}`,
          icon: `data:image/svg+xml;base64,${siteOptionsQuery.data.data.icon}`,
          title: siteOptionsQuery.data.data.title,
          rerender: rerender,
        });
      }
    }
  }, [siteOptionsQuery.data, rerender]);
  useEffect(() => {
    void (async () => {
      await siteOptionsQuery.refetch();
      if (!localStorage?.getItem("session")) {
        if (pathname.includes("/main")) {
          router.push("/");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    console.log(checkSession.data.valid, pathname.includes("/main"));
    if (!checkSession.data.valid && pathname.includes("/main")) {
      router.push("/");
    }
    if (checkSession.data.valid && !pathname.includes("/main")) {
      router.push("/main");
    }
    if (checkSession.data.valid) {
      setIsAdmin(checkSession.data.isAdmin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <siteOptionsContext.Provider value={siteOptions}>
        <swalContext.Provider value={swal}>
          <sessionContext.Provider value={{ isAdmin }}>
            {gottenSiteOptions ? children : ""}
          </sessionContext.Provider>
        </swalContext.Provider>
      </siteOptionsContext.Provider>
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
