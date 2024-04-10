import Link from "next/link";
import React from "react";
import Image from "react-bootstrap/Image";

export default function ForgotPassword() {
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
                <h5>404 Page Not Found</h5>
                <p className="mb-2">
                  The page you navigated to does not exist.
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
