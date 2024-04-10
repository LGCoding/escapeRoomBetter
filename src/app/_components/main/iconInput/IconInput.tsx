"use client";
import { useEffect, useState } from "react";
import { Button, OverlayTrigger } from "react-bootstrap";
import Popover from "react-bootstrap/esm/Popover";
import type CSS from "csstype";

const icons = [
  "▲",
  "■",
  "⬟",
  "⬢",
  "●",
  "⧱",
  "⬬",
  "▰",
  "⬧",
  "⨸",
  "𝞹",
  "𝝳",
  "𝞓",
  "♣",
  "¶",
  "♥",
  "☻",
];

export default function IconInput({
  onChange,
  edit,
  initialValue,
  style,
}: {
  onChange?: (text: string) => void;
  edit?: boolean;
  initialValue?: string;
  style?: CSS.Properties;
}) {
  const [value, setValue] = useState<string[]>(initialValue?.split("") ?? []);
  const [editable, setEditable] = useState(edit ?? true);
  const [show, setShow] = useState(false);
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">
        Keyboard{" "}
        <Button
          style={{
            paddingLeft: ".25rem",
            paddingRight: ".25rem",
            paddingTop: "0rem",
            paddingBottom: "0rem",
            float: "right",
            marginTop: "-.25rem",
          }}
          variant="outline-danger"
          onClick={() => setShow(false)}
        >
          X
        </Button>
      </Popover.Header>
      <Popover.Body>
        {icons.map((item) => (
          <Button
            key={item}
            onClick={() => {
              if (value.length < 3) {
                setValue([...value, item]);
                if (onChange) onChange([...value, item].join(""));
              }
            }}
          >
            {item}
          </Button>
        ))}
        <Button
          onClick={() => {
            if (value.length) {
              setValue(value.slice(0, value.length - 1));
              if (onChange) onChange(value.slice(0, value.length - 1).join(""));
            }
          }}
        >
          {"<-"}
        </Button>
      </Popover.Body>
    </Popover>
  );
  useEffect(() => {
    setEditable(edit ?? true);
  }, [edit]);
  return (
    <>
      <OverlayTrigger
        trigger="click"
        placement="auto"
        onToggle={() => {
          if (editable) {
            setShow(!show);
          }
        }}
        show={show}
        overlay={popover}
      >
        <p
          style={{
            fontSize: "1rem",
            width: "4rem",
            height: "2rem",
            padding: ".25rem",
            textAlign: "center",
            textWrap: "nowrap",
            margin: 0,
            ...style,
          }}
          className="form-control"
        >
          {value}
        </p>
      </OverlayTrigger>
    </>
  );
}
