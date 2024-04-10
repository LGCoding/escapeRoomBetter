"use client";
import React, { useContext, useEffect, useState } from "react";
import Lock from "~/app/_components/main/locks/lock";
import { type LockType } from "~/app/_components/main/locks/lockShared";
import { api } from "~/trpc/react";
import { swalContext } from "../../layout";
import { Accordion } from "react-bootstrap";

export default function Locks() {
  const swal = useContext(swalContext);
  const locksQuery = api.locks.getLocks.useQuery(undefined, {
    enabled: false,
  });
  const openLock = api.locks.unlockLock.useMutation({
    onSuccess: async (e) => {
      if (e.wasError) {
        swal({
          icon: "error",
          mainText: "Wrong Code",
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        swal({
          icon: "success",
          title: "Locked Open",
          cancelButton: false,
          confirmButtonText: "ok",
        });
        await locksQuery.refetch();
      }
    },
  });
  const [locks, setLocks] = useState<Record<string, LockType[]>>({});

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
        const sorted: Record<string, LockType[]> = {};

        for (const i of locksQuery.data.data) {
          const record = sorted[i.path.id];
          if (record) {
            record.push({
              ...i,
              pathId: i.path.name,
              cardAddIds: [],
              cardRemoveIds: [],
              combination: "WOW YOU REALLY TRIED THAT",
            });
          } else {
            sorted[i.path.id] = [
              {
                ...i,
                pathId: i.path.name,
                cardAddIds: [],
                cardRemoveIds: [],
                combination: "WOW YOU REALLY TRIED THAT",
              },
            ];
          }
        }
        setLocks(sorted);
      }
    }
  }, [locksQuery.data, swal]);

  useEffect(() => {
    void (async () => {
      await locksQuery.refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h2 className="fw-bold text-uppercase mb-2 text-center ">Locks</h2>
      <Accordion defaultActiveKey="0">
        {Object.keys(locks).map((el, i) => {
          const record = locks[el];
          return (
            <Accordion.Item key={i} eventKey={i + ""}>
              <Accordion.Header>
                {(record?.[0]?.pathId ?? "No Path") + " Path"}
              </Accordion.Header>
              <Accordion.Body>
                <>
                  {record?.map((el, j) => {
                    return (
                      <Lock
                        key={j}
                        open={el.open ?? false}
                        openCallback={(password) => {
                          if (el.id)
                            openLock.mutate({
                              id: el.id,
                              combination: password,
                            });
                        }}
                        lock={el}
                      />
                    );
                  })}
                </>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </>
  );
}
