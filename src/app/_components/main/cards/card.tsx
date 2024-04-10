"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import styles from "./cards.module.css";
import { type CardType } from "./CardShared";

interface CardProps {
  cardInput: CardType;
  width?: string;
  onClick?: () => void;
  borderColor?: string;
  //   parentWidth: number;
}

export default function Cards({
  onClick,
  cardInput,
  width,
  borderColor,
  //   parentWidth,
}: CardProps) {
  const [size, setSize] = useState(width ?? "10rem");
  const [expanded, setExpanded] = useState(false);
  const card = useRef<HTMLDivElement | null>(null);
  const [test, setTest] = useState(100 / 160);

  useEffect(() => {
    if (expanded) {
      card.current?.scrollIntoView({ behavior: "smooth" });
    }
    setTest(card.current?.getBoundingClientRect().width ?? 0);
  }, [expanded]);

  return (
    <Card
      className={styles.cardBase}
      style={{
        width: size,
        borderColor: borderColor ?? "black",
        backgroundSize: size,
      }}
      onClick={(e) => {
        if (!onClick) {
          if (expanded) {
            setSize(width ?? "10rem");
            setExpanded(false);
          } else {
            setSize("100%");
            setExpanded(true);
            e.currentTarget.scrollIntoView(false);
          }
        } else {
          onClick();
        }
      }}
    >
      <Card.Body
        ref={card}
        className={styles.cardBody}
        style={{
          padding: 0.03 * test + "px",
        }}
      >
        <h1
          style={{
            fontSize: 0.2 * test + "px",
            gridArea: "a",
            margin: 0,
          }}
          className="text-center"
        >
          {cardInput.title}
        </h1>
        <div style={{ gridArea: "b", position: "relative" }}>
          {cardInput.texts.map((object, i) => {
            return (
              <div
                key={i + "textDiv"}
                style={{
                  display: "block",
                  position: "absolute",
                  width: "fit-content",
                  blockSize: "fit-content",
                  float: "none",
                }}
              >
                <p
                  style={{
                    left: object.x * test * 0.2 + "px",
                    top: object.y * test * 0.2 + "px",
                    position: "relative",
                    whiteSpace: "pre-line",
                    fontSize: object.fontSize * test * 0.1 + "px",
                    color: object.color ?? "black",
                  }}
                  key={i + "cardText" + "title"}
                >
                  {object.text}
                </p>
              </div>
            );
          })}
          {cardInput.image ? (
            <Image
              alt="image"
              src={cardInput.image?.href ?? ""}
              style={{
                left: cardInput.image.x * test * 0.2 + "px",
                top: cardInput.image.y * test * 0.2 + "px",
                position: "absolute",
                width: cardInput.image.width * test * 0.2 + "px",
                height: cardInput.image.height
                  ? cardInput.image.height * test * 0.2 + "px"
                  : "auto",
              }}
            />
          ) : (
            ""
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
