"use client";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
} from "react-bootstrap";
import { siteOptionsContext, swalContext } from "~/app/(internal)/layoutStuff";
import { api } from "~/trpc/react";
type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

export default function Admin() {
  const swal = useContext(swalContext);
  const siteOptions = useContext(siteOptionsContext);
  const refIcon = useRef<HTMLInputElement>(null);
  const refCard = useRef<HTMLInputElement>(null);

  const [imageBufferIcon, setImageBufferIcon] = useState<{
    buffer: Buffer;
    type: string;
  } | null>();
  const [imageBufferCard, setImageBufferCard] = useState<{
    buffer: Buffer;
    type: string;
  } | null>();
  const [imageBufferCard2, setImageBufferCard2] = useState<{
    buffer: Buffer;
    type: string;
  } | null>();
  const siteOptionsModify = api.siteOptions.modifySiteOptions.useMutation({
    onSuccess: async (e) => {
      if (e.wasError) {
        swal({
          icon: "error",
          title: "ERROR",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      } else {
        siteOptions.rerender();
        if (refIcon.current && refCard.current) {
          refIcon.current.value = "";
          refCard.current.value = "";
        }
        swal({
          icon: "success",
          title: "Yeah",
          mainText: e.data,
          cancelButton: false,
          confirmButtonText: "ok",
        });
      }
    },
  });
  const [info, setInfo] = useState({
    title: "",
    homeText: "",
    info: "",
  });
  useEffect(() => {
    setInfo({
      title: siteOptions.title,
      homeText: siteOptions.homeText,
      info: siteOptions.info,
    });
  }, [siteOptions]);
  async function handleImageIcon(e: React.ChangeEvent<FormControlElement>) {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setImageBufferIcon({
        buffer: Buffer.from(await target.files[0].arrayBuffer()),
        type: target.files[0].type,
      });
    } else {
      setImageBufferIcon(null);
    }
  }
  async function handleImageCard(e: React.ChangeEvent<FormControlElement>) {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      const image = await imageSize(
        `data:image/svg+xml;base64,${Buffer.from(await target.files[0].arrayBuffer()).toString("base64")}`,
      );
      if (image > 0.74 && image < 0.78) {
        setImageBufferCard({
          buffer: Buffer.from(await target.files[0].arrayBuffer()),
          type: target.files[0].type,
        });
      } else {
        swal({
          cancelButton: false,
          confirmButton: true,
          icon: "error",
          mainText: "The image needs to be 3/4 aspect ratio",
          title: "Error",
          confirmButtonText: "Ok",
        });
        target.value = "";
        setImageBufferCard(null);
      }
    } else {
      setImageBufferCard(null);
    }
  }
  async function handleImageCard2(e: React.ChangeEvent<FormControlElement>) {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      const image = await imageSize(
        `data:image/svg+xml;base64,${Buffer.from(await target.files[0].arrayBuffer()).toString("base64")}`,
      );
      if (image > 0.74 && image < 0.78) {
        setImageBufferCard2({
          buffer: Buffer.from(await target.files[0].arrayBuffer()),
          type: target.files[0].type,
        });
      } else {
        swal({
          cancelButton: false,
          confirmButton: true,
          icon: "error",
          mainText: "The image needs to be 3/4 aspect ratio",
          title: "Error",
          confirmButtonText: "Ok",
        });
        target.value = "";
        setImageBufferCard2(null);
      }
    } else {
      setImageBufferCard2(null);
    }
  }

  return (
    <>
      <h2 className="fw-bold text-uppercase text-center ">
        Admin Site Options
      </h2>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Website Icon</Form.Label>
        <Form.Control
          ref={refIcon}
          style={{
            width: "98%",
          }}
          type="file"
          accept="image/svg+xml"
          onChange={handleImageIcon}
        />
      </Form.Group>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Back Card Image</Form.Label>
        <Form.Control
          ref={refCard}
          style={{
            width: "98%",
          }}
          type="file"
          accept="image/svg+xml"
          onChange={handleImageCard}
        />
      </Form.Group>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Front Card Image</Form.Label>
        <Form.Control
          ref={refCard}
          style={{
            width: "98%",
          }}
          type="file"
          accept="image/svg+xml"
          onChange={handleImageCard2}
        />
      </Form.Group>
      <FormGroup className="mb-3" controlId="formBasicEmail">
        <FormLabel className="text-center">Title</FormLabel>
        <FormControl
          style={{
            width: "98%",
          }}
          type="text"
          placeholder="Enter a title"
          value={info.title}
          onChange={(v) => setInfo({ ...info, title: v.currentTarget.value })}
        />
      </FormGroup>
      <FormGroup
        style={{
          width: "98%",
        }}
        className="mb-3"
        controlId="formBasicEmail"
      >
        <FormLabel className="text-center">
          Main Page Text{" "}
          <a href="https://www.markdownguide.org/cheat-sheet/">
            Works with markdown
          </a>
        </FormLabel>
        <FormControl
          type="text"
          placeholder="Enter a description"
          as="textarea"
          value={info.homeText}
          rows={10}
          onChange={(v) =>
            setInfo({ ...info, homeText: v.currentTarget.value })
          }
        />
      </FormGroup>
      <FormGroup
        style={{
          width: "98%",
        }}
        className="mb-3"
        controlId="formBasicEmail"
      >
        <FormLabel className="text-center">
          Info Page Text{" "}
          <a href="https://www.markdownguide.org/cheat-sheet/">
            Works with markdown
          </a>
        </FormLabel>
        <FormControl
          type="text"
          placeholder="Enter a description"
          as="textarea"
          value={info.info}
          rows={10}
          onChange={(v) => setInfo({ ...info, info: v.currentTarget.value })}
        />
      </FormGroup>
      <Button
        onClick={() => {
          siteOptionsModify.mutate({
            homeText:
              info.homeText !== siteOptions.homeText
                ? info.homeText
                : undefined,
            title: info.title !== siteOptions.title ? info.title : undefined,
            info: info.info !== siteOptions.info ? info.info : undefined,
            card: imageBufferCard
              ? imageBufferCard?.buffer.toString("base64")
              : undefined,
            card2: imageBufferCard2
              ? imageBufferCard2?.buffer.toString("base64")
              : undefined,
            icon: imageBufferIcon
              ? imageBufferIcon?.buffer.toString("base64")
              : undefined,
          });
        }}
      >
        Submit
      </Button>
    </>
  );
}

function imageSize(url: string): Promise<number> {
  const img = document.createElement("img");

  const promise = new Promise<number>((resolve, reject) => {
    img.onload = () => {
      // Natural size is the actual image size regardless of rendering.
      // The 'normal' `width`/`height` are for the **rendered** size.
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Resolve promise with the width and height
      resolve(width / height);
    };

    // Reject promise on error
    img.onerror = reject;
  });

  // Setting the source makes it start downloading and eventually call `onload`
  img.src = url;

  return promise;
}
