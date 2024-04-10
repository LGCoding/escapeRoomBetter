"use client";
import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { swalContext } from "~/app/(internal)/layout";
import type { CardType } from "~/app/_components/main/cards/CardShared";
import Card from "~/app/_components/main/cards/card";
import CardEdit from "~/app/_components/main/cards/cardEdit";
import { type PathType } from "~/app/_components/main/path/pathShared";
import PathInput from "~/app/_components/main/pathInput/pathInput";
import { api } from "~/trpc/react";
type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

export default function Admin() {
  const swal = useContext(swalContext);
  const [show, setShow] = useState(false);
  const [imageBuffer, setImageBuffer] = useState<{
    buffer: Buffer;
    type: string;
  } | null>();
  const cardsQuery = api.cards.getCardsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const pathQuery = api.paths.getPathsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const cardsAdd = api.cards.createCard.useMutation({
    onSuccess: async (e) => {
      if (e.wasError) {
        swal({
          icon: "error",
          title: "ERROR",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setShow(false);
        await cardsQuery.refetch();
      }
    },
  });
  const cardsModify = api.cards.modifyCard.useMutation({
    onSuccess: async (e) => {
      console.log("sdfdsfnmsdfmn,d");
      if (e.wasError) {
        swal({
          icon: "error",
          title: "ERROR",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setShow(false);
        swal({
          icon: "success",
          title: "Yeah",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await cardsQuery.refetch();
      }
    },
  });
  const cardsRemove = api.cards.deleteCard.useMutation({
    onSuccess: async (e) => {
      if (e.wasError) {
        swal({
          icon: "error",
          title: "ERROR",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setShow(false);
        await cardsQuery.refetch();
      }
    },
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [paths, setPaths] = useState<PathType[]>([]);
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
        setCards(
          cardsQuery.data.data.map((el) => {
            console.log(el);
            if (el.image) {
              const mimeType = el.image.imageType;
              return {
                ...el,
                image: {
                  ...el.image,
                  href: `data:${mimeType};base64,${el.image.image}`,
                },
              } as CardType;
            }
            return { ...el, image: undefined };
          }),
        );
      }
    }
  }, [cardsQuery.data, swal]);
  useEffect(() => {
    if (pathQuery.data) {
      if (pathQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: pathQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setPaths(pathQuery.data.data);
      }
    }
  }, [pathQuery.data, swal]);

  useEffect(() => {
    void (async () => {
      await cardsQuery.refetch();
      await pathQuery.refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleClose = () => setShow(false);
  const [currentCard, setCurrentCard] = useState<CardType>({
    title: "",
    texts: [],
    isStart: false,
  });
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  async function handleImage(e: React.ChangeEvent<FormControlElement>) {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setImageBuffer({
        buffer: Buffer.from(await target.files[0].arrayBuffer()),
        type: target.files[0].type,
      });
      setCurrentCard({
        ...currentCard,
        image: {
          href: URL.createObjectURL(target.files[0]),
          width: 1,
          x: 0,
          y: 0,
        },
      });
    } else {
      setCurrentCard({ ...currentCard, image: undefined });
    }
  }

  function handleSubmit() {
    if (currentIndex === -2) {
      if (imageBuffer && currentCard.image) {
        cardsAdd.mutate({
          isStart: currentCard.isStart,
          title: currentCard.title,
          texts: currentCard.texts,
          pathId: currentCard.pathsId,
          image: {
            ...currentCard.image,
            image: imageBuffer.buffer.toString("base64"),
            imageType: imageBuffer.type,
          },
        });
      } else {
        cardsAdd.mutate({
          isStart: currentCard.isStart,
          title: currentCard.title,
          texts: currentCard.texts,
          pathId: currentCard.pathsId,
        });
      }
    } else {
      if (currentCard.id) {
        if (imageBuffer && currentCard.image) {
          cardsModify.mutate({
            id: currentCard.id,
            isStart: currentCard.isStart,
            title: currentCard.title,
            texts: currentCard.texts,
            pathId: currentCard.pathsId,
            image: {
              ...currentCard.image,
              image: imageBuffer.buffer.toString("base64"),
              imageType: imageBuffer.type,
            },
          });
        } else if (currentCard.image === null) {
          cardsModify.mutate({
            id: currentCard.id,
            isStart: currentCard.isStart,
            title: currentCard.title,
            texts: currentCard.texts,
            pathId: currentCard.pathsId,
            image: null,
          });
        } else {
          cardsModify.mutate({
            id: currentCard.id,
            isStart: currentCard.isStart,
            title: currentCard.title,
            pathId: currentCard.pathsId,
            texts: currentCard.texts,
          });
        }
      }
    }
  }

  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">
        Admin Card{" "}
        <Button
          onClick={() => {
            setCurrentIndex(-2);
            setCurrentCard({
              title: "",
              texts: [],
              isStart: false,
            });
            setShow(true);
          }}
        >
          Create Card
        </Button>
      </h2>
      {cards.map((value, index) => (
        <Card
          key={index + "Cardsd"}
          cardInput={value}
          onClick={() => {
            setCurrentCard(value);
            setCurrentIndex(index);
            setImageBuffer(undefined);
            setShow(true);
          }}
        />
      ))}

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Card Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Default file input example</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImage} />
          </Form.Group>
          <Form.Check
            checked={currentCard.isStart}
            onChange={(e) =>
              setCurrentCard({
                ...currentCard,
                isStart: e.currentTarget.checked,
              })
            }
            type="switch"
            label="Start Card"
          />
          <PathInput
            value={currentCard.pathsId}
            label="Path"
            onChange={(v) => setCurrentCard({ ...currentCard, pathsId: v })}
            paths={paths}
          />
          <Button
            onClick={() => {
              setCurrentCard({
                ...currentCard,
                texts: [
                  ...currentCard.texts,
                  {
                    text: "",
                    fontSize: 1,
                    color: "",
                    x: 0,
                    y: 0,
                  },
                ],
              });
            }}
          >
            Add text
          </Button>
          <br /> <br />
          <CardEdit //TODO ADD the remove image/text option
            key="editCard"
            cardInput={currentCard}
            onChange={(e) => {
              console.log(e);
              setCurrentCard(e);
            }}
            onClick={() => 1}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              display: currentIndex == -2 ? "none" : "block",
            }}
            variant="danger"
            onClick={() => {
              swal({
                cancelButton: true,
                icon: "info",
                confirmButton: true,
                confirmCallback: () => {
                  if (currentCard.id)
                    cardsRemove.mutate({ id: currentCard.id });
                },
                title: "Delete",
                mainText: "Are you sure you want to delete this card",
              });
            }}
          >
            Delete
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
