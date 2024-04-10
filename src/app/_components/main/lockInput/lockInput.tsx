"use client";
import { useEffect, useState } from "react";
import { Button, OverlayTrigger } from "react-bootstrap";
import Popover from "react-bootstrap/esm/Popover";
import Lock from "../locks/lock";
import IconInput from "../iconInput/IconInput";
import { LockType } from "../locks/lockShared";
import { LockFill } from "react-bootstrap-icons";
import styles from "./lock.module.css";

export default function LockInput({
  onChange,
  locks,
  label,
  multiple,
  value,
}: {
  onChange?: (text: string[]) => void;
  locks: LockType[];
  label: string;
  multiple: boolean;
  value?: string[];
}) {
  const [lockIds, setLockIds] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("");
  function openInput() {
    setShow(true);
  }
  useEffect(() => {
    if (value) setLockIds(value);
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
              <IconInput onChange={(text) => setFilter(text)} />
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
              {locks.map((el, i) => {
                const lock = lockIds.findIndex((element) => element === el.id);
                if (el.id && el.title.includes(filter)) {
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (!el.id) return;
                        if (!multiple && lockIds.length) {
                          if (el.id === lockIds[0]) {
                            setLockIds([]);
                            if (onChange) onChange([]);
                          } else {
                            setLockIds([el.id]);
                            if (onChange) onChange([el.id]);
                          }
                          return;
                        }
                        if (lock === -1) {
                          setLockIds([...lockIds, el.id]);
                          if (onChange) onChange([...lockIds, el.id]);
                        } else {
                          setLockIds(lockIds.filter((_, i) => lock !== i));
                          if (onChange)
                            onChange(lockIds.filter((_, i) => lock !== i));
                        }
                      }}
                      className={"relative inline-block " + styles.lock}
                    >
                      <LockFill
                        style={
                          lock === -1 ? {} : { backgroundColor: "lightblue" }
                        }
                        className="absolute"
                        size="5rem"
                      />

                      <div className={"text-light " + styles.title}>
                        {el.title}
                      </div>
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
              height: "5rem",
            }}
            className="form-control"
            onClick={openInput}
          >
            {lockIds.map((id, i) => {
              const lock = locks.find((el) => {
                return el.id === id;
              });
              if (!lock) return <></>;
              return (
                <div
                  key={i}
                  className={"relative inline-block " + styles.lock2}
                >
                  <LockFill className="absolute" size="3rem" />

                  <div className={"text-light " + styles.title2}>
                    {lock.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </OverlayTrigger>
    </>
  );
}
