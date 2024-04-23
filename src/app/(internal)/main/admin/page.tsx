"use client";

import { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import User from "~/app/_components/main/users/user";
import { type UserType } from "~/app/_components/main/users/userShared";
import { swalContext } from "../../layoutStuff";
import { api } from "~/trpc/react";

export default function Admin() {
  const swal = useContext(swalContext);
  const [show, setShow] = useState(false);
  const [sortMode, setSortMode] = useState("name");
  const [sortPath, setSortPath] = useState("all");
  const [reverseOrder, setReverseOrder] = useState(false);
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
      <Form.Check
        inline
        label="Name"
        name="group1"
        type="radio"
        checked={sortMode === "name"}
        onChange={(e) => {
          if (e.currentTarget.checked) setSortMode("name");
        }}
        id={`inline-1`}
      />
      <Form.Check
        inline
        label="Progress"
        name="group1"
        type="radio"
        checked={sortMode === "progress"}
        onChange={(e) => {
          if (e.currentTarget.checked) setSortMode("progress");
        }}
        id={`inline-2`}
      />
      <Form.Check
        inline
        label="Admin"
        name="group1"
        type="radio"
        checked={sortMode === "admin"}
        onChange={(e) => {
          if (e.currentTarget.checked) setSortMode("admin");
        }}
        id={`inline-3`}
      />

      <Form.Check
        inline
        label="Reverse"
        name="group"
        type="checkbox"
        checked={reverseOrder}
        onChange={(e) => {
          setReverseOrder(e.currentTarget.checked);
        }}
        id={`inline`}
      />
      {sortMode === "progress" ? (
        <Form.Select
          value={sortPath}
          onChange={(e) => {
            setSortPath(e.currentTarget.value);
          }}
          aria-label="Default select example"
        >
          <option value="all">All Paths</option>
          {max
            ? Object.keys(max).map((key) => {
                return (
                  <option value={key} key={key}>
                    {max[key]?.name}
                  </option>
                );
              })
            : ""}
        </Form.Select>
      ) : (
        ""
      )}
      <br />
      {users
        .sort((a, b) => {
          if (sortMode === "name") {
            if (a.name < b.name) {
              return -1 * (reverseOrder ? -1 : 1);
            }
            if (a.name > b.name) {
              return 1 * (reverseOrder ? -1 : 1);
            }
          } else if (sortMode === "progress") {
            if (sortPath === "all") {
              if (
                Object.values(a.unlockedLocks).reduce(
                  (total, num) => total + Math.round(num),
                  0,
                ) <
                Object.values(b.unlockedLocks).reduce(
                  (total, num) => total + Math.round(num),
                  0,
                )
              ) {
                return 1 * (reverseOrder ? -1 : 1);
              }
              if (
                Object.values(a.unlockedLocks).reduce(
                  (total, num) => total + Math.round(num),
                  0,
                ) >
                Object.values(b.unlockedLocks).reduce(
                  (total, num) => total + Math.round(num),
                  0,
                )
              ) {
                return -1 * (reverseOrder ? -1 : 1);
              }
            } else {
              if (
                (a.unlockedLocks[sortPath] ?? 0) <
                (b.unlockedLocks[sortPath] ?? 0)
              ) {
                return 1 * (reverseOrder ? -1 : 1);
              }
              if (
                (a.unlockedLocks[sortPath] ?? 0) >
                (b.unlockedLocks[sortPath] ?? 0)
              ) {
                return -1 * (reverseOrder ? -1 : 1);
              }
            }
          } else if (sortMode === "admin") {
            if (a.role < b.role) {
              return 1 * (reverseOrder ? 1 : -1);
            }
            if (a.role > b.role) {
              return -1 * (reverseOrder ? 1 : -1);
            }
          }
          return 0;
        })
        .map((el, i) => {
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
      <Modal show={show} onHide={() => setShow(false)} enforceFocus={false}>
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
