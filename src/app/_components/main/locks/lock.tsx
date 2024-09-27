"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./lock.module.css";
import { characters, type LockType } from "./lockShared";
import Image from "react-bootstrap/Image";

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
  const [lastTried, setLastTried] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [currentTumbler, setCurrentTumbler] = useState(0);
  const [shake, setShake] = useState(false);
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
  useEffect(() => {
    if (shake === true) setTimeout(() => setShake(false), 500);
  }, [shake]);
  return (
    <div
      className={
        "relative inline-block " +
        styles.lock +
        (shake ? " " + styles.shake : "")
      }
    >
      <input
        ref={ref}
        onChange={(e) => {
          const value = e.currentTarget.value.toUpperCase();
          setCurrentTumbler(currentTumbler + 1 === 4 ? 0 : currentTumbler + 1);
          setCurrentComboIndex(
            currentComboIndex.map((v, i) => {
              const index = characters.findIndex((v) => v === value);

              if (i === currentTumbler) return index === -1 ? v : index;
              else return v;
            }),
          );
          e.currentTarget.value = "";
        }}
        style={{ position: "absolute", left: "0", width: 0 }}
      />

      <div
        style={{
          perspective: "1000px",
          float: "none",
        }}
      >
        <Image
          className={`${styles.shackleImage} ${open ? styles.open : ""}`}
          alt="test"
          style={{
            filter: lock.victoryLock
              ? "invert(85%) sepia(25%) saturate(3783%) hue-rotate(347deg) brightness(92%) contrast(85%)"
              : "invert(6%) sepia(6%) saturate(1849%) hue-rotate(191deg) brightness(90%) contrast(86%)",
          }}
          src="/images/lock-fill.svg"
        />
        <Image
          style={{
            width: "10rem",
            position: "absolute",
            filter: lock.victoryLock
              ? "invert(85%) sepia(25%) saturate(3783%) hue-rotate(347deg) brightness(92%) contrast(85%)"
              : "invert(6%) sepia(6%) saturate(1849%) hue-rotate(191deg) brightness(90%) contrast(86%)",
          }}
          alt="test"
          src="/images/lock-fill2.svg"
        />
      </div>

      <div
        className={styles.shackle}
        onClick={() => {
          if (!open) {
            if (onClick) {
              onClick();
              return;
            }
            let password = "";
            for (let i = 0; i < 4; i++) {
              password += characters[currentComboIndex[i] ?? 0];
            }
            if (password == lastTried) {
              if (!shake) setShake(true);
            } else {
              setLastTried(password);
              openCallback(password);
            }
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
            if (ref.current) ref.current.focus();
            setCurrentTumbler(0);
            changeCurrentCombo(0, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[0] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            if (ref.current) ref.current.focus();
            setCurrentTumbler(1);
            changeCurrentCombo(1, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[1] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            if (ref.current) ref.current.focus();
            setCurrentTumbler(2);
            changeCurrentCombo(2, e);
          }}
          className={"bg-light text-primary " + styles.lockNumber}
        >
          {characters[currentComboIndex[2] ?? 0]}
        </span>
        <span
          onClick={(e) => {
            if (ref.current) ref.current.focus();
            setCurrentTumbler(3);
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
