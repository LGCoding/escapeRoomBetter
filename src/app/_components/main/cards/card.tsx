"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { siteOptionsContext } from "~/app/(internal)/layoutStuff";
import styles from "./cards.module.css";
import { type CardType } from "./CardShared";

interface CardProps {
  cardInput: CardType;
  width?: string;
  onClick?: () => void;
  setFlipCard?: (v: boolean) => void;
  borderColor?: string;
  flipped?: boolean;
  //   parentWidth: number;
}

export default function Cards({
  onClick,
  cardInput,
  width,
  borderColor,
  setFlipCard,
  //   parentWidth,
}: CardProps) {
  const siteOptions = useContext(siteOptionsContext);
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
    <>
      <div
        style={{ width: size }}
        onClick={(e) => {
          if (!onClick) {
            if (!cardInput.flipped) {
              const audio = new Audio("/audio/card.mp3");
              void audio.play();
              if (setFlipCard) setFlipCard(true);
              return;
            }
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
        className={
          styles.flipCard + (cardInput.flipped ? " " + styles.fliped : "")
        }
      >
        <div className={styles.flipCardInner}>
          <Card
            className={styles.cardBase + " " + styles.flipCardFront}
            style={{
              //   width: size,
              width: "100%",
              borderColor: borderColor ?? "black",
              backgroundSize: size,
              backgroundImage: `url(${siteOptions.card2})`,
            }}
          >
            <Card.Body
              ref={card}
              style={{
                padding: 0.03 * test + "px",
                height: "100%",
              }}
            >
              <h1
                style={{
                  fontSize: 0.2 * test + "px",
                  gridArea: "a",
                  margin: 0,
                  top: "30%",
                  position: "relative",
                  transform: "translateY(-50%)",
                }}
                className="text-center"
              >
                {cardInput.title}
              </h1>
            </Card.Body>
          </Card>
          <Card
            className={styles.cardBase + " " + styles.flipCardBack}
            style={{
              //   width: size,
              width: "100%",
              borderColor: borderColor ?? "black",
              backgroundSize: size,
              backgroundImage: `url(${siteOptions.card})`,
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
        </div>
      </div>
    </>
  );
}
