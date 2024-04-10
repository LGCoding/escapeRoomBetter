import { Card, ProgressBar } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { type UserType } from "./userShared";

export default function User({
  user,
  max,
  onClick,
}: {
  user: UserType;
  max: Record<string, { count: number; name: string }>;
  onClick?: () => void;
}) {
  return (
    <>
      <Card
        onClick={() => {
          if (onClick) onClick();
        }}
        style={{
          width: "20rem",
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
            <PersonCircle
              color={user.role === "ADMIN" ? "firebrick" : "deepskyblue"}
              size="3rem"
            />
          </div>
          <br />
          {user.name}
        </Card.Header>
        <Card.Body>
          Email: <br />
          {user.email}
          <br />
          Role: {user.role}
          {Object.keys(max).map((el, i) => {
            return (
              <div key={i}>
                <h3>{max[el]?.name}</h3>
                <ProgressBar
                  key={el}
                  label={(user.unlockedLocks[el] ?? 0) + "/" + max[el]?.count}
                  max={max[el]?.count}
                  variant="info"
                  visuallyHidden={false}
                  now={user.unlockedLocks[el] ?? 0}
                />
              </div>
            );
          })}
        </Card.Body>
      </Card>
    </>
  );
}
