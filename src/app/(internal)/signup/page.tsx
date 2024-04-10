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
  Image,
} from "react-bootstrap";
import * as yup from "yup";
import { swalContext } from "../layout";
import { api } from "~/trpc/react";

const schema = yup.object({
  name: yup
    .string()
    .required("This field is required")
    .max(10, "Maximum length of 10 characters")
    .min(1, "Minimum length of 1 characters")
    .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
  email: yup.string().email().required("This field is required"),
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

  const register = api.login.sendRegisterEmail.useMutation();

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
                        register.mutate(values, {
                          onSuccess: (result) => {
                            if (!result) {
                              swal({
                                title: "Error",
                                mainText: "That Email is already Registered",
                                icon: "error",
                                cancelButton: false,
                              });
                            } else {
                              void router.push("/email");
                            }
                          },
                        });
                      }}
                      initialValues={{
                        name: "",
                        email: "",
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
                          <FormGroup className="mb-3" controlId="name">
                            <FormLabel className="text-center">Name</FormLabel>
                            <FormControl
                              type="text"
                              placeholder="Enter Name"
                              name="name"
                              value={values.name}
                              onChange={handleChange}
                              isValid={touched.name && !errors.name}
                              isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </FormGroup>

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
                    <div className="mt-3">
                      <p className="mb-0  text-center">
                        Already have an account?{" "}
                        <a href="../" className="text-primary fw-bold">
                          Sign In
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
  );
}
