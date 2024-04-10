"use client";
import { Formik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
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
  Image,
} from "react-bootstrap";
import * as yup from "yup";
import { swalContext } from "../layout";
import { api } from "~/trpc/react";

const schema = yup.object({
  password: yup
    .string()
    .required("This field is required")
    .min(6, "Minimum length of 6 characters")
    .max(20, "Maximum length of 20 characters"),
  password2: yup
    .string()
    .required("This field is required")
    .min(6, "Minimum length of 6 characters")
    .max(20, "Maximum length of 20 characters")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export default function SignUp({}) {
  const router = useRouter();
  const swal = useContext(swalContext);
  const searchParams = useSearchParams();
  const query: string | null = searchParams.get("data");

  const reset = api.login.resetPassword.useMutation();

  return (
    <div>
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xs={12}>
            <Card className="px-4">
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
                  <div className="mb-3">
                    <Formik
                      validationSchema={schema}
                      onSubmit={async (values, _) => {
                        reset.mutate(
                          { data: query ?? "", password: values.password },
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
                                  mainText: "Password Reset",
                                  cancelButton: false,
                                });
                                void router.push("/");
                              }
                            },
                          },
                        );
                      }}
                      initialValues={{
                        password: "",
                        password2: "",
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
                          <FormGroup className="mb-3" controlId="password">
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
                          <FormGroup className="mb-3" controlId="password2">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl
                              type="password"
                              placeholder="Password"
                              name="password2"
                              value={values.password2}
                              onChange={handleChange}
                              isValid={touched.password2 && !errors.password2}
                              isInvalid={!!errors.password2}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.password2}
                            </Form.Control.Feedback>
                          </FormGroup>
                          <FormGroup
                            className="mb-3"
                            controlId="formBasicCheckbox"
                          ></FormGroup>
                          <div className="d-grid">
                            <Button variant="primary" type="submit">
                              Create Account
                            </Button>
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
