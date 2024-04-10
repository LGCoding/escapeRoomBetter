"use client";
import { useContext, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
} from "react-bootstrap";
import { swalContext } from "~/app/(internal)/layout";
import CardInput from "~/app/_components/main/cardInput/cardInput";
import { type CardType } from "~/app/_components/main/cards/CardShared";
import LockInput from "~/app/_components/main/lockInput/lockInput";
import { type LockType } from "~/app/_components/main/locks/lockShared";
import { type PathType } from "~/app/_components/main/path/pathShared";
import PathInput from "~/app/_components/main/pathInput/pathInput";
import Qrs from "~/app/_components/main/qrs/qr";
import { type QrType } from "~/app/_components/main/qrs/qrShared";
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
  const qrsQuery = api.qrs.getQrsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const qrsAdd = api.qrs.createQr.useMutation({
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
        await qrsQuery.refetch();
      }
    },
  });
  const qrsRemove = api.qrs.deleteQr.useMutation({
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
        await qrsQuery.refetch();
      }
    },
  });
  const qrsModify = api.qrs.modifyQr.useMutation({
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
        await qrsQuery.refetch();
      }
    },
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [locks, setLocks] = useState<LockType[]>([]);
  const [qrs, setQrs] = useState<QrType[]>([]);
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
    if (qrsQuery.data) {
      if (qrsQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: qrsQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setQrs(qrsQuery.data.data);
      }
    }
  }, [qrsQuery.data, swal]);
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
        console.log("ji");
        setLocks(locksQuery.data.data);
      }
    }
  }, [locksQuery.data, swal]);
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
      await qrsQuery.refetch();
      await locksQuery.refetch();
      await pathQuery.refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [show, setShow] = useState(false);
  const [currentQr, setCurrentQr] = useState<QrType>({
    title: "",
    cardAddIds: [],
    cardRemoveIds: [],
    locks: [],
  });
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  function openModal() {
    setShow(true);
  }

  function handleSubmit() {
    setShow(false);
    if (currentIndex === -2) {
      qrsAdd.mutate(currentQr);
    } else if (currentQr.id) {
      qrsModify.mutate({ ...currentQr, id: currentQr.id });
    }
  }

  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">Admin Qr</h2>
      <Button
        onClick={() => {
          setCurrentIndex(-2);
          setCurrentQr({
            cardAddIds: [],
            cardRemoveIds: [],
            locks: [],
            title: "",
          });
          openModal();
        }}
      >
        Create Qr
      </Button>
      <br />
      {qrs.map((el, i) => {
        return (
          <Qrs
            qr={el}
            key={"qr" + i}
            openCallback={() => ""}
            onClick={() => {
              setCurrentIndex(i);
              setCurrentQr(el);
              openModal();
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
          <Modal.Title>Card Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup className="mb-3" controlId="formBasicEmail">
            <FormLabel className="text-center">Title</FormLabel>
            <FormControl
              type="text"
              placeholder="Enter a title"
              value={currentQr.title}
              onChange={(v) =>
                setCurrentQr({ ...currentQr, title: v.currentTarget.value })
              }
            />
          </FormGroup>
          <CardInput
            label="Reward Card"
            multiple={true}
            value={currentQr.cardAddIds}
            onChange={(v) => setCurrentQr({ ...currentQr, cardAddIds: v })}
            cards={cards}
          />
          <CardInput
            value={currentQr.cardRemoveIds}
            label="Cards to remove"
            onChange={(v) => setCurrentQr({ ...currentQr, cardRemoveIds: v })}
            multiple={false}
            cards={cards}
          />{" "}
          <LockInput
            value={currentQr.locks}
            label="Required Locks"
            onChange={(v) => setCurrentQr({ ...currentQr, locks: v })}
            multiple={true}
            locks={locks}
          />
          <PathInput
            value={currentQr.unlockPathId}
            label="Path that is unlocked by opening lock"
            onChange={(v) => setCurrentQr({ ...currentQr, unlockPathId: v })}
            paths={paths}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              display: currentIndex == -2 ? "none" : "bqr",
            }}
            variant="danger"
            onClick={() => {
              swal({
                cancelButton: true,
                icon: "info",
                confirmButton: true,
                confirmCallback: () => {
                  if (currentQr.id) {
                    setShow(false);
                    qrsRemove.mutate({ id: currentQr.id });
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
