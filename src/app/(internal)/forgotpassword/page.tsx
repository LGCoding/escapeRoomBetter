"use client";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
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
import { api } from "~/trpc/react";
import { siteOptionsContext, swalContext } from "../layoutStuff";

const schema = yup.object({
  email: yup.string().email().required("This field is required"),
});

export default function ForgotPassword() {
  const siteOptions = useContext(siteOptionsContext);

  const router = useRouter();
  const swal = useContext(swalContext);
  const resetPasswordEmail = api.login.resetPasswordEmail.useMutation({
    onSuccess: (result) => {
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
  return (
    <div>
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xs={12}>
            <Card className="px-4">
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
                    <Formik
                      validationSchema={schema}
                      onSubmit={async (values, _) => {
                        resetPasswordEmail.mutate(
                          { email: values.email },
                          {
                            onSuccess: (result) => {
                              if (result.wasError) {
                                swal({
                                  title: "Error",
                                  mainText: result.data,
                                  icon: "error",
                                  cancelButton: false,
                                });
                                void router.push("/");
                              } else {
                                swal({
                                  icon: "success",
                                  title: "Email",
                                  mainText:
                                    "Sent an Email with Password Reset Link",
                                  cancelButton: false,
                                });
                                void router.push("/");
                              }
                            },
                          },
                        );
                      }}
                      initialValues={{
                        email: "",
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
                          <div className="d-grid">
                            <FormGroup className="mb-3" controlId="email">
                              <FormLabel className="text-center">
                                Email address
                              </FormLabel>
                              <FormControl
                                type="email"
                                placeholder="Enter email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                isValid={touched.email && !errors.email}
                                isInvalid={!!errors.email}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.email}
                              </Form.Control.Feedback>
                            </FormGroup>
                            <Button variant="primary" type="submit">
                              Create Account
                            </Button>
                          </div>
                          <div className="mt-3">
                            <p className="mb-0  text-center">
                              Remember your password?{" "}
                              <a href="../" className="text-primary fw-bold">
                                Sign In
                              </a>
                            </p>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
