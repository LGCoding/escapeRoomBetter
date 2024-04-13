"use client";
import { QrScanner } from "@yudiel/react-qr-scanner";
import React, { useContext, useState } from "react";
import { api } from "~/trpc/react";
import { swalContext } from "../../layoutStuff";
import dynamic from "next/dynamic";

function QrNoSSR() {
  const swal = useContext(swalContext);
  const [id, setId] = useState("");
  const usersRemove = api.qrs.unlockQr.useMutation({
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
      }
    },
  });
  return (
    <>
      <h2 className="fw-bold text-uppercase mb-2 text-center ">QR-Code</h2>
      <QrScanner
        onDecode={(result) => {
          if (result !== id) {
            setId(result);
            usersRemove.mutate({
              id: result,
            });
          }
        }}
        audio={true}
        onError={(error) => console.log(error?.message)}
      />
    </>
  );
}
// export it with SSR disabled
const Qr = dynamic(() => Promise.resolve(QrNoSSR), {
  ssr: false,
});

export default Qr;
