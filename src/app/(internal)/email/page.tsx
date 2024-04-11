"use client";
import Link from "next/link";
import React, { useContext } from "react";
import Image from "react-bootstrap/Image";
import { siteOptionsContext } from "../layoutStuff";

export default function ForgotPassword() {
  const siteOptions = useContext(siteOptionsContext);

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
                {siteOptions.title}
              </h2>
              <Image
                src={siteOptions.icon}
                alt="Brand"
                style={{
                  width: "5rem",
                  left: "calc(50% - 2.5rem)",
                  position: "relative",
                }}
              />
              <div className="mb-4">
                <h5>Check your Email</h5>
                <p className="mb-2">
                  Please Check your email to register if you can not find the
                  email check your spam
                  <br />
                  <Link href="/">Back to main page</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
