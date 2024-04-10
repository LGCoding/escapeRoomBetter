import { Card } from "react-bootstrap";
import { CheckCircle, XCircle, Shuffle } from "react-bootstrap-icons";
import { type PathType } from "./pathShared";

export default function Path({
  path,
  onClick,
}: {
  path: PathType;
  onClick?: () => void;
}) {
  return (
    <>
      <Card
        onClick={() => {
          if (onClick) onClick();
        }}
        style={{
          width: "10rem",
          display: "inline-block",
          margin: ".25rem",
        }}
      >
        <Card.Header
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
            }}
          >
            <Shuffle color={path.color} size="3rem" />
          </div>
          <br />
          {path.name}
        </Card.Header>
        <Card.Body>
          Is start:{" "}
          {path.isStart ? (
            <CheckCircle
              style={{ marginTop: "-.25rem", display: "inline-block" }}
              color={"green"}
              size="1rem"
            />
          ) : (
            <XCircle
              style={{ marginTop: "-.25rem", display: "inline-block" }}
              color={"red"}
              size="1rem"
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
}
