import { useState, useRef, useEffect } from "react";
import { CloudArrowUpFill } from "react-bootstrap-icons";
import { useSpring, animated } from "react-spring";
import "./DragAndDrop.css";
import NavBar from "../NavBar";
import App from "../../App";

function DragAndDrop() {
  const [showToast, setShowToast] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [invalidJson, setInvalidJson] = useState(false);
  const [lines, setLines] = useState();
  const inputRef = useRef(null);

  const flyingAnimation = useSpring({
    transform: fileUploaded ? "translateY(-100%)" : "translateY(0%)",
  });

  const handleShowToast = () => {
    setShowToast(!showToast);
  };

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFiles(file);
      setFileUploaded(true);
    }
  };

  const handleChange = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFiles(file);
      setFileUploaded(true);
    }
  };

  const onButtonClick = () => {
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const handleFiles = (file) => {
    const fileName = file.name;
    if (fileName.endsWith(".json") || fileName.endsWith(".jsonl")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataObjectsArray = e.target.result.trim().split(/\n(?=\{)/);
          setLines(dataObjectsArray.map((line) => JSON.parse(line)));
        } catch (error) {
          handleShowToast();
          console.error(" :", error);
          setDragActive(false);
          setFileUploaded(false);
          setInvalidJson(false);
        }
      };
      reader.readAsText(file);
    } else {
      console.log("Invalid file:", fileName);
      setInvalidJson(true);
      setTimeout(() => {
        setDragActive(false);
        setFileUploaded(false);
        setInvalidJson(false);
      }, 2500);
    }
  };

  return (
    <div>
      {lines ? (
        <App lines={lines} />
      ) : (
        <div>
          <NavBar />
          <div
            aria-live="polite"
            aria-atomic="true"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10vh",
            }}
          >
            <div
              className={`bg-danger toast ${showToast ? "show" : ""}`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="toast-body d-flex justify-content-between">
                Something went wrong! Make sure you have uploaded a valid json
                file.{" "}
                <button
                  type="button"
                  className="ml-2 mb-1 close"
                  data-dismiss="toast"
                  aria-label="Close"
                  onClick={handleShowToast}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
          </div>
          <div
            className="card-body d-grid justify-content-center"
            style={{
              position: "absolute",
              left: "50%",
              right: "50%",
              top: "12vh",
            }}
          >
            <form
              id="form-file-upload"
              onDragEnter={handleDrag}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                ref={inputRef}
                type="file"
                id="input-file-upload"
                className="d-none"
                accept=".json,.jsonl"
                onChange={handleChange}
              />

              <label
                id="label-file-upload"
                htmlFor="input-file-upload"
                className={dragActive ? "drag-active" : ""}
                style={{ backgroundColor: `${invalidJson ? "#f00b0b39" : ""}` }}
              >
                <div className="text-center">
                  <animated.div style={flyingAnimation}>
                    <CloudArrowUpFill size={80} />
                  </animated.div>
                  <p className="card-text">Drag your local report here!</p>
                  <button className="btn btn-primary" onClick={onButtonClick}>
                    Upload report
                  </button>
                  <h5
                    className={`pt-3 text-danger ${
                      !invalidJson ? "d-none" : ""
                    }`}
                  >
                    Please upload a json file!
                  </h5>
                </div>
              </label>
              {dragActive && (
                <div
                  id="drag-file-element"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                ></div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DragAndDrop;
