"use client";

import { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Path from "~/app/_components/main/path/path";
import { type PathType } from "~/app/_components/main/path/pathShared";
import { api } from "~/trpc/react";
import { swalContext } from "../../../layout";

export default function Admin() {
  const swal = useContext(swalContext);
  const [show, setShow] = useState(false);

  const pathsQuery = api.paths.getPathsAdmin.useQuery(undefined, {
    enabled: false,
  });
  const pathsAdd = api.paths.createPath.useMutation({
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
          mainText: e.data,
          title: "Success",
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await pathsQuery.refetch();
      }
    },
  });
  const pathsRemove = api.paths.deletePath.useMutation({
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
        await pathsQuery.refetch();
      }
    },
  });
  const pathsModify = api.paths.modifyPath.useMutation({
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
        await pathsQuery.refetch();
      }
    },
  });
  const [paths, setPaths] = useState<PathType[]>([]);
  useEffect(() => {
    if (pathsQuery.data) {
      if (pathsQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: pathsQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setPaths(pathsQuery.data.data);
      }
    }
  }, [pathsQuery.data, swal]);
  useEffect(() => {
    void pathsQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [currentPath, setCurrentPath] = useState<PathType>({
    color: "#333333",
    isStart: false,
    name: "Lorem",
  });
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  function handleSubmit() {
    setShow(false);
    if (currentIndex === -2) {
      pathsAdd.mutate(currentPath);
    } else if (currentPath.id) {
      console.log("hi");
      pathsModify.mutate({ ...currentPath, id: currentPath.id });
    }
  }
  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">
        Admin Path{"    "}
        <Button
          onClick={() => {
            setCurrentIndex(-2);
            setCurrentPath({
              color: "#333333",
              isStart: false,
              name: "Lorem",
            });
            setShow(true);
          }}
        >
          Create Path
        </Button>
      </h2>
      {paths.map((el, i) => {
        return (
          <Path
            onClick={() => {
              console.log(el);
              setCurrentPath(el);
              setCurrentIndex(i);
              setShow(true);
            }}
            key={i}
            path={el}
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
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="text-center">Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a name"
              value={currentPath.name}
              onChange={(v) =>
                setCurrentPath({ ...currentPath, name: v.currentTarget.value })
              }
            />
          </Form.Group>
          <Form.Check
            checked={currentPath.isStart}
            onChange={(e) =>
              setCurrentPath({
                ...currentPath,
                isStart: e.currentTarget.checked,
              })
            }
            type="switch"
            label="Start"
          />
          <Form.Group>
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={currentPath.color}
              onChange={(e) => {
                setCurrentPath({
                  ...currentPath,
                  color: e.currentTarget.value,
                });
              }}
            />
          </Form.Group>
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
                  if (currentPath.id) {
                    setShow(false);
                    pathsRemove.mutate({ id: currentPath.id });
                  }
                },
                title: "Delete",
                mainText: "Are you sure you want to delete this user",
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
