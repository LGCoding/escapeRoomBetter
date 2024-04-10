"use client";
import { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import * as yup from "yup";
import { swalContext } from "~/app/(internal)/layout";
import CardInput from "~/app/_components/main/cardInput/cardInput";
import PathInput from "~/app/_components/main/pathInput/pathInput";
import { type CardType } from "~/app/_components/main/cards/CardShared";
import IconInput from "~/app/_components/main/iconInput/IconInput";
import Locks from "~/app/_components/main/locks/lock";
import { type LockType } from "~/app/_components/main/locks/lockShared";
import { type PathType } from "~/app/_components/main/path/pathShared";
import { api } from "~/trpc/react";

export default function Admin() {
  const swal = useContext(swalContext);
  const cardsQuery = api.cards.getCardsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const locksQuery = api.locks.getLocksAdmin.useQuery(undefined, {
    enabled: false,
  });
  const pathQuery = api.paths.getPathsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const locksAdd = api.locks.createLock.useMutation({
    onSuccess: async (e) => {
      if (e.wasError) {
        swal({
          icon: "error",
          mainText: e.data,
          title: "ERROR",
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        swal({
          icon: "success",
          title: "Success",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await locksQuery.refetch();
      }
    },
  });
  const locksRemove = api.locks.deleteLock.useMutation({
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
        swal({
          icon: "success",
          title: "Success",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await locksQuery.refetch();
      }
    },
  });
  const locksModify = api.locks.modifyLock.useMutation({
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
        swal({
          icon: "success",
          title: "Success",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await locksQuery.refetch();
      }
    },
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [locks, setLocks] = useState<LockType[]>([]);
  const [paths, setPaths] = useState<PathType[]>([]);
  useEffect(() => {
    if (cardsQuery.data) {
      if (cardsQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: cardsQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setCards(
          cardsQuery.data.data.map((el) => {
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
    if (locksQuery.data) {
      if (locksQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: locksQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setLocks(locksQuery.data.data);
      }
    }
  }, [locksQuery.data, swal]);
  useEffect(() => {
    void (async () => {
      await cardsQuery.refetch();
      await locksQuery.refetch();
      await pathQuery.refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [show, setShow] = useState(false);
  const [currentLock, setCurrentLock] = useState<LockType>({
    combination: "",
    title: "",
    cardAddIds: [],
    cardRemoveIds: [],
  });
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [comboErrors, setComboErrors] = useState<string | null>("Empty");
  function openModal(combo: string) {
    setShow(true);
    const schema = yup
      .string()
      .required("This field is required")
      .max(4, "Maximum length of 4 characters")
      .min(4, "Minimum length of 4 characters")
      .matches(
        /^[aA-zZ0-9]+$/,
        "Only letters and numbers are allowed for this field ",
      );
    setComboErrors(null);
    schema.validate(combo).catch((err: number) => {
      setComboErrors(err.toString());
    });
  }

  function handleSubmit() {
    if (comboErrors) {
      swal({
        icon: "error",
        mainText: "You have errors in your combination",
        title: "ERROR",
        cancelButton: false,
        confirmButtonText: "ok",
      });
      return;
    }
    setShow(false);
    if (currentIndex === -2) {
      locksAdd.mutate(currentLock);
    } else if (currentLock.id) {
      locksModify.mutate({ ...currentLock, id: currentLock.id });
    }
  }
  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">Admin Lock</h2>
      <Button
        onClick={() => {
          setCurrentIndex(-2);
          setCurrentLock({
            cardAddIds: [],
            cardRemoveIds: [],
            combination: "0000",
            title: "",
          });
          openModal("0000");
        }}
      >
        Create Lock
      </Button>
      <br />
      <br />
      {locks.map((el, i) => {
        return (
          <Locks
            lock={el}
            open={false}
            key={"lock" + i}
            openCallback={() => ""}
            onClick={() => {
              setCurrentIndex(i);
              setCurrentLock(el);
              openModal(el.combination);
            }}
          />
        );
      })}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Lock Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Title:</Form.Label>
          <IconInput
            initialValue={currentLock.title}
            onChange={(v) => setCurrentLock({ ...currentLock, title: v })}
          />
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="text-center">Combination:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              name="name"
              maxLength={4}
              value={currentLock.combination}
              onChange={(e) => {
                const schema = yup
                  .string()
                  .required("This field is required")
                  .max(4, "Maximum length of 4 characters")
                  .min(4, "Minimum length of 4 characters")
                  .matches(
                    /^[aA-zZ0-9]+$/,
                    "Only letters and numbers are allowed for this field ",
                  );
                setCurrentLock({
                  ...currentLock,
                  combination: e.currentTarget.value,
                });
                setComboErrors(null);
                schema.validate(e.currentTarget.value).catch((err: number) => {
                  setComboErrors(err.toString());
                });
              }}
              isValid={!comboErrors}
              isInvalid={!!comboErrors}
            />
            <Form.Control.Feedback type="invalid">
              {comboErrors?.toString()}
            </Form.Control.Feedback>
          </Form.Group>
          <CardInput
            label="Reward Card"
            multiple={true}
            value={currentLock.cardAddIds}
            onChange={(v) => setCurrentLock({ ...currentLock, cardAddIds: v })}
            cards={cards}
          />
          <CardInput
            value={currentLock.cardRemoveIds}
            label="Cards to remove"
            onChange={(v) =>
              setCurrentLock({ ...currentLock, cardRemoveIds: v })
            }
            multiple={true}
            cards={cards}
          />
          <PathInput
            value={currentLock.pathId}
            label="Path"
            onChange={(v) => setCurrentLock({ ...currentLock, pathId: v })}
            paths={paths}
          />
          <PathInput
            value={currentLock.unlockPathsId}
            label="Path that is unlocked by opening lock"
            onChange={(v) =>
              setCurrentLock({ ...currentLock, unlockPathsId: v })
            }
            paths={paths}
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
                  if (currentLock.id) {
                    setShow(false);
                    locksRemove.mutate({ id: currentLock.id });
                  }
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
