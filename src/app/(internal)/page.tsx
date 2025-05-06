"use client";
import { useContext, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { siteOptionsContext, swalContext } from "./layoutStuff";
import markdownit from "markdown-it";
//@ts-expect-error no types
import sup from "markdown-it-sup";
//@ts-expect-error no types
import sub from "markdown-it-sub";
//@ts-expect-error no types
import deflist from "markdown-it-deflist";
//@ts-expect-error no types
import foot from "markdown-it-footnote";
//@ts-expect-error no types
import mark from "markdown-it-mark";
//@ts-expect-error no types
import list from "markdown-it-task-lists";
import { redirect } from "next/navigation";

// Enable everything
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(sup)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(sub)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(deflist)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(foot)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(mark)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(list);

export default function Home() {
  const siteOptions = useContext(siteOptionsContext);
  useEffect(() => {
    if (localStorage.getItem("seenWelcome")) {
      redirect(`/signin`);
    }
  }, []);

  return (
    <>
      <div>
        <Container>
          <Row className="vh-100 d-flex justify-content-center align-items-center">
            <Col md={8} lg={6} xs={12}>
              <Card className="shadow">
                <CardBody>
                  <div className="mt-md-4 mb-3">
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
                    <div className="mb-3">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: md.render(siteOptions.info),
                        }}
                      ></div>
                      <div className="mt-3">
                        <p className="mb-0  text-center">
                          <a
                            onClick={() =>
                              localStorage.setItem("seenWelcome", "true")
                            }
                            href="signin"
                            className="text-info text-primary fw-bold"
                          >
                            Login
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
