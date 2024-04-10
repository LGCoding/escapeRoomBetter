"use client";
import { useEffect, useState } from "react";
import { Button, OverlayTrigger } from "react-bootstrap";
import Popover from "react-bootstrap/esm/Popover";
import IconInput from "../iconInput/IconInput";
import { Shuffle } from "react-bootstrap-icons";
import styles from "./path.module.css";
import { type PathType } from "../path/pathShared";

export default function PathInput({
  onChange,
  paths,
  label,
  value,
}: {
  onChange?: (text: string | undefined) => void;
  paths: PathType[];
  label: string;
  value?: string;
}) {
  const [pathId, setPathId] = useState<string>();
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("");
  function openInput() {
    setShow(true);
  }
  useEffect(() => {
    if (value) setPathId(value);
  }, [value]);
  return (
    <>
      <OverlayTrigger
        placement={"auto"}
        show={show}
        overlay={
          <Popover
            key="imagePopover"
            style={{
              maxWidth: "40rem",
            }}
          >
            <Popover.Header as="h3">
              Image Size
              <Button
                style={{
                  paddingLeft: ".25rem",
                  paddingRight: ".25rem",
                  paddingTop: "0rem",
                  paddingBottom: "0rem",
                  position: "absolute",
                  marginTop: "-.25rem",
                  right: ".25rem",
                  top: ".5rem",
                }}
                variant="outline-danger"
                onClick={() => setShow(false)}
              >
                X
              </Button>
            </Popover.Header>
            <Popover.Body
              style={{
                maxHeight: "10rem",
                maxWidth: "40rem",
                overflow: "auto",
              }}
              key="imageBody"
            >
              {paths.map((el, i) => {
                if (el.id) {
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (!el.id) return;
                        console.log();
                        if (el.id === pathId) {
                          setPathId(undefined);
                          if (onChange) onChange(undefined);
                        } else {
                          setPathId(el.id);
                          if (onChange) onChange(el.id);
                        }
                      }}
                      className={"relative inline-block " + styles.lock}
                    >
                      <Shuffle
                        style={
                          el.id === pathId
                            ? { backgroundColor: "lightblue" }
                            : {}
                        }
                        color={el.color}
                        className="absolute"
                        size="3rem"
                      />

                      <div className={styles.title}>{el.name}</div>
                    </div>
                  );
                }
              })}
            </Popover.Body>
          </Popover>
        }
      >
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">{label}</label>
          <div
            style={{
              height: "4rem",
            }}
            className="form-control"
            onClick={openInput}
          >
            {pathId ? (
              <div className={"relative inline-block " + styles.lock2}>
                <Shuffle
                  color={paths.find((e) => e.id === pathId)?.color}
                  className="absolute"
                  size="2rem"
                />

                <div className={styles.title2}>
                  {paths.find((e) => e.id === pathId)?.name}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </OverlayTrigger>
    </>
  );
}
