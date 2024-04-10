"use client";
import React, { useState } from "react";
import { LockFill, UnlockFill } from "react-bootstrap-icons";
import styles from "./lock.module.css";
import { characters, type LockType } from "./lockShared";

interface LockProps {
  lock: LockType;
  openCallback: (password: string) => void;
  onClick?: () => void;
  open: boolean;
}

export default function Locks({
  lock,
  open,
  openCallback,
  onClick,
}: LockProps) {
  const [currentComboIndex, setCurrentComboIndex] = useState([0, 0, 0, 0]);
  const changeCurrentCombo = (
    index: number,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => {
    let c = currentComboIndex[index] ?? 0;
    if (
      (e.clientY - e.currentTarget.getBoundingClientRect().top) /
        e.currentTarget.getBoundingClientRect().height <
      0.5
    ) {
      if (c + 1 === characters.length) c = 0;
      else c = c + 1;
    } else {
      if (c - 1 === -1) c = characters.length - 1;
      else c = c - 1;
    }
    setCurrentComboIndex(
      currentComboIndex.map((v, i) => {
        if (i === index) return c;
        else return v;
      }),
    );
  };
  return (
    <div className={"relative inline-block " + styles.lock}>
      {open ? (
        <UnlockFill
          style={{ position: "absolute", left: "1.2rem" }}
          className="absolute"
          size="10rem"
        />
      ) : (
        <LockFill
          onClick={() => {
            if (onClick) {
              onClick();
              return;
            }
          }}
          className="absolute"
          size="10rem"
        />
      )}
      <div
        className={styles.shackle}
        onClick={() => {
          if (!open) {
            let password = "";
            for (let i = 0; i < 4; i++) {
              password += characters[currentComboIndex[i] ?? 0];
            }
            if (onClick) {
              onClick();
              return;
            }
            console.log(password);
            openCallback(password);
          }
        }}
      ></div>

      <div className={"text-light " + styles.title}>{lock.title}</div>
      <div
        className={"text-light " + styles.lockNumbers}
        onClick={() => {
          if (onClick) {
            onClick();
            return;
          }
        }}
      >
        <span
          onClick={(e) => {
            changeCurrentCombo(0, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[0] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            changeCurrentCombo(1, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[1] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            changeCurrentCombo(2, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[2] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            changeCurrentCombo(3, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[3] ?? 0]}
        </span>
      </div>
    </div>
  );
}
