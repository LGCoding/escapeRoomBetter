"use client";

import { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import User from "~/app/_components/main/users/user";
import { type UserType } from "~/app/_components/main/users/userShared";
import { swalContext } from "../../layout";
import { api } from "~/trpc/react";

export default function Admin() {
  const swal = useContext(swalContext);
  const [show, setShow] = useState(false);
  const usersQuery = api.users.getUsersAdmin.useQuery(undefined, {
    enabled: false,
  });
  const lockNumber = api.locks.getLockNumber.useQuery(undefined, {
    enabled: false,
  });

  const usersRemove = api.users.deleteUser.useMutation({
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
        await usersQuery.refetch();
      }
    },
  });
  const usersReset = api.users.resetUser.useMutation({
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
        await usersQuery.refetch();
      }
    },
  });
  const usersModify = api.users.modifyUser.useMutation({
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
        await usersQuery.refetch();
      }
    },
  });
  const [users, setUsers] = useState<UserType[]>([]);
  useEffect(() => {
    if (usersQuery.data) {
      if (usersQuery.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: usersQuery.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setUsers(usersQuery.data.data);
      }
    }
  }, [usersQuery.data, swal]);
  const [max, setMax] =
    useState<Record<string, { count: number; name: string }>>();
  useEffect(() => {
    if (lockNumber.data) {
      if (lockNumber.data.wasError) {
        swal({
          icon: "error",
          mainText: "ERROR",
          title: lockNumber.data.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        setMax(lockNumber.data.data);
      }
    }
  }, [lockNumber.data, swal]);
  useEffect(() => {
    void (async () => {
      await usersQuery.refetch();
      await lockNumber.refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [currentUser, setCurrentUser] = useState<UserType>({
    email: "",
    id: "",
    name: "",
    role: "USER",
    password: "",
    unlockedLocks: {},
  });
  function handleSubmit() {
    setShow(false);
    usersModify.mutate(currentUser);
  }
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">Admin</h2>
      {users.map((el, i) => {
        return (
          <User
            onClick={() => {
              setCurrentUser(el);
              setCurrentIndex(i);
              setShow(true);
            }}
            key={i}
            max={max ?? {}}
            user={el}
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
              value={currentUser.name}
              onChange={(v) =>
                setCurrentUser({ ...currentUser, name: v.currentTarget.value })
              }
            />
          </Form.Group>
          <Form.Check
            checked={currentUser.role === "ADMIN"}
            onChange={(e) =>
              setCurrentUser({
                ...currentUser,
                role: e.currentTarget.checked ? "ADMIN" : "USER",
              })
            }
            type="switch"
            label="Admin"
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
                  if (currentUser.id) {
                    setShow(false);
                    usersRemove.mutate({ id: currentUser.id });
                  }
                },
                title: "Delete",
                mainText: "Are you sure you want to delete this user",
              });
            }}
          >
            Delete
          </Button>
          <Button
            style={{
              display: currentIndex == -2 ? "none" : "bqr",
            }}
            variant="warning"
            onClick={() => {
              swal({
                cancelButton: true,
                icon: "info",
                confirmButton: true,
                confirmCallback: () => {
                  if (currentUser.id) {
                    setShow(false);
                    usersReset.mutate({ id: currentUser.id });
                  }
                },
                title: "Reset",
                mainText: "Are you sure you want to Reset this User",
              });
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
