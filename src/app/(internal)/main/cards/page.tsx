"use client";
import { useContext, useEffect, useState } from "react";
import Card from "~/app/_components/main/cards/card";
import type { CardType } from "~/app/_components/main/cards/CardShared";
import { api } from "~/trpc/react";
import { swalContext } from "../../layoutStuff";
import { Accordion } from "react-bootstrap";

export default function Cards() {
  const swal = useContext(swalContext);
  const cardsQuery = api.cards.getCards.useQuery(undefined, {
    enabled: false,
  });
  const [cards, setCards] = useState<Record<string, CardType[]>>({});
  const [flipped, setFlip] = useState<Record<string, boolean>>({});
  function setFlipped(v: Record<string, boolean>) {
    setFlip(v);
    localStorage.setItem("flipped", JSON.stringify(v));
  }
  useEffect(() => {
    if (cardsQuery.data) {
      if (cardsQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: cardsQuery.data.data,
          title: "ERROR",
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        const sorted: Record<string, CardType[]> = {};

        for (const i of cardsQuery.data.data) {
          const record = sorted[i.path.id];
          if (record) {
            if (i.image) {
              const mimeType = i.image.imageType;
              record.push({
                ...i,
                flipped: false,
                pathsId: i.path.name,
                image: {
                  ...i.image,
                  href: `data:${mimeType};base64,${i.image.image}`,
                },
              } as CardType);
            } else {
              record.push({
                ...i,
                flipped: false,
                pathsId: i.path.name,
                image: undefined,
              });
            }
          } else {
            if (i.image) {
              const mimeType = i.image.imageType;
              sorted[i.path.id] = [
                {
                  ...i,
                  pathsId: i.path.name,
                  image: {
                    ...i.image,
                    href: `data:${mimeType};base64,${i.image.image}`,
                  },
                  flipped: false,
                } as CardType,
              ];
            } else {
              sorted[i.path.id] = [
                {
                  ...i,
                  flipped: false,
                  pathsId: i.path.name,
                  image: undefined,
                },
              ];
            }
          }
        }
        setCards(
          sorted,
          //   cardsQuery.data.data.map((el) => {
          //     if (el.image) {
          //       const mimeType = el.image.imageType;
          //       return {
          //         ...el,
          //         image: {
          //           ...el.image,
          //           href: `data:${mimeType};base64,${el.image.image}`,
          //         },
          //       } as CardType;
          //     }
          //     return { ...el, image: undefined };
          //   }),
        );
      }
    }
  }, [cardsQuery.data, swal]);
  useEffect(() => {
    void (async () => {
      await cardsQuery.refetch();
    })();
    try {
      const flip = JSON.parse(
        localStorage.getItem("flipped") ?? "{}",
      ) as Record<string, boolean>;
      setFlip(flip);
    } catch (error) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [keyAdd, setKeyAdd] = useState(0);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2 className="fw-bold text-uppercase mb-2 text-center ">Cards</h2>
      <Accordion
        onSelect={() => {
          setTimeout(() => setKeyAdd(keyAdd + 1), 100);
        }}
        defaultActiveKey={"0"}
      >
        {Object.keys(cards).map((el, i) => {
          const record = cards[el]?.sort((a, b) => {
            if (a.title < b.title) {
              return -1;
            }
            if (a.title > b.title) {
              return 1;
            }

            // names must be equal
            return 0;
          });

          return (
            <Accordion.Item key={i} eventKey={i + ""}>
              <Accordion.Header>
                {(record?.[0]?.pathsId ?? "No Path") + " Path"}
              </Accordion.Header>
              <Accordion.Body style={{ padding: ".3rem" }}>
                {record?.map((value, index) => {
                  return (
                    <Card
                      setFlipCard={(v) => {
                        setFlipped({ ...flipped, [value.id ?? ""]: v });
                      }}
                      key={index + "Card" + keyAdd}
                      cardInput={{
                        ...value,
                        flipped: flipped[value.id ?? ""] ?? false,
                      }}
                    />
                  );
                })}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}
