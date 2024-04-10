"use client";
import { Formik } from "formik";
import { useContext } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
} from "react-bootstrap";
import Image from "react-bootstrap/Image";
import * as yup from "yup";
// import { swalContext } from "./layout";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { swalContext } from "./layout";

const schema = yup.object({
  email: yup.string().email().required("This field is required"),
  password: yup
    .string()
    .required("This field is required")
    .min(6, "Minimum length of 6 characters")
    .max(20, "Maximum length of 20 characters"),
});

export default function Home() {
  const login = api.login.loginUser.useMutation();
  const swal = useContext(swalContext);
  const router = useRouter();

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
                      Escape Room
                    </h2>
                    <Image
                      src="./images/logo.svg"
                      alt="Brand"
                      style={{
                        width: "5rem",
                        left: "calc(50% - 2.5rem)",
                        position: "relative",
                      }}
                    />
                    <p className=" mb-5">
                      Please enter your login and password!
                    </p>
                    <div className="mb-3">
                      <Formik
                        validationSchema={schema}
                        onSubmit={(values, _) => {
                          console.log("test");
                          login.mutate(values, {
                            onSuccess: (result) => {
                              if (result.wasError) {
                                swal({
                                  title: "Error",
                                  mainText: result.data,
                                  icon: "error",
                                  cancelButton: false,
                                });
                              } else {
                                localStorage.setItem("session", result.data);
                                router.push("/main");
                              }
                            },
                          });
                        }}
                        initialValues={{
                          email: "",
                          password: "",
                        }}
                      >
                        {({
                          handleSubmit,
                          handleChange,
                          values,
                          touched,
                          errors,
                        }) => (
                          <Form noValidate onSubmit={handleSubmit}>
                            <FormGroup
                              className="mb-3"
                              controlId="formBasicEmail"
                            >
                              <FormLabel className="text-center">
                                Email address
                              </FormLabel>
                              <FormControl
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={values.email}
                                onChange={handleChange}
                                isValid={touched.email && !errors.email}
                                isInvalid={!!errors.email}
                              />

                              <Form.Control.Feedback type="invalid">
                                {errors.email}
                              </Form.Control.Feedback>
                            </FormGroup>

                            <FormGroup
                              className="mb-3"
                              controlId="formBasicPassword"
                            >
                              <FormLabel>Password</FormLabel>
                              <FormControl
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                isValid={touched.password && !errors.password}
                                isInvalid={!!errors.password}
                              />

                              <Form.Control.Feedback type="invalid">
                                {errors.password}
                              </Form.Control.Feedback>
                            </FormGroup>
                            <FormGroup
                              className="mb-3"
                              controlId="formBasicCheckbox"
                            >
                              <p className="small">
                                <a
                                  className="text-primary"
                                  href="forgotpassword"
                                >
                                  Forgot password?
                                </a>
                              </p>
                            </FormGroup>
                            <div className="d-grid">
                              <Button variant="primary" type="submit">
                                Login
                              </Button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                      <div className="mt-3">
                        <p className="mb-0  text-center">
                          {"Don't have an account? "}
                          <a href="signup" className="text-primary fw-bold">
                            Sign Up
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
