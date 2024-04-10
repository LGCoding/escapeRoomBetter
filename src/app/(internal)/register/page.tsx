"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "react-bootstrap/Image";
import { api } from "~/trpc/react";
import { swalContext } from "../layout";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query: string | null = searchParams.get("data");
  const swal = useContext(swalContext);
  const registered = useRef(false);

  const register = api.login.registerUser.useMutation({
    onSuccess: (result) => {
      console.log("in");
      if (result.wasError) {
        swal({
          title: "Error",
          mainText: result.data,
          icon: "error",
          cancelButton: false,
        });
        router.push("/");
      } else {
        localStorage.setItem("session", result.data);
        router.push("/main");
      }
    },
  });
  useEffect(() => {
    if (query && !registered.current) {
      console.log("here");
      registered.current = true;
      register.mutate(query);
    }
  });
  return (
    <div className="d-flex flex-column container">
      <div
        className="row align-items-center justify-content-center
          min-vh-100"
      >
        <div className="col-12 col-md-8 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="fw-bold text-uppercase mb-2 text-center ">
                Escape Room
              </h2>
              <Image
                src="/images/logo.svg"
                alt="Brand"
                style={{
                  width: "5rem",
                  left: "calc(50% - 2.5rem)",
                  position: "relative",
                }}
              />
              <div className="mb-4">
                <h5>Registering Account</h5>
                <p className="mb-2">
                  Wait a second while we register your account. The page will
                  load once done
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
