import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { CloudArrowUpFill } from "react-bootstrap-icons";
import { useLocation } from "react-router-dom";

import { DialectReportView } from "../../DialectReportView";
import { ReportData, parseReportData } from "../../data/parseReportData";
import styles from "./DragAndDrop.module.css";

export const DragAndDrop = () => {
  const location = useLocation();

  const [dragActive, setDragActive] = useState(false);
  const [invalidFile, setInvalidFile] = useState(false);
  const [lines, setLines] = useState<ReportData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLines(null);
    setDragActive(false);
    setInvalidFile(false);
  }, [location.key]);

  const handleDragEnter = function (e: DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = function (e: DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = function (e: DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      const file = e.dataTransfer.files[0];
      handleFiles(file);
    }
  };

  const handleChange = function (e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target?.files?.[0]) {
      const file = e.target.files[0];
      handleFiles(file);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleFiles = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      try {
        const dataObjectsArray = result.trim().split(/\r?\n/);
        const lines = dataObjectsArray.map(
          (line) => JSON.parse(line) as Record<string, unknown>
        );
        setLines(parseReportData(lines));
      } catch (error) {
        setInvalidFile(true);
        setTimeout(() => {
          setDragActive(false);
          setInvalidFile(false);
        }, 4000);
        console.error("Error :", error);
      }
    };
    reader.readAsText(file);
  };

  if (lines) {
    return <DialectReportView reportData={lines} allImplementationsData={{}} />;
  }

  return (
    <div>
      <div aria-live="polite" aria-atomic="true"></div>

      <div className="card-body d-grid justify-content-center">
        <form
          className={styles["form-file-upload"]}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            id="input-file-upload"
            className="d-none"
            onChange={handleChange}
          />

          <div
            id={styles["label-file-upload"]}
            className={dragActive ? styles["drag-active"] : ""}
            style={{ backgroundColor: `${invalidFile ? "#f00b0b39" : ""}` }}
          >
            <div className={`${styles["flex-div"]} text-center`}>
              <p>
                You can generate a report by running{" "}
                <a href="https://docs.bowtie.report/en/stable/cli/">
                  Bowtie&apos;s CLI
                </a>{" "}
                via e.g.:
              </p>
              <p>
                <pre>
                  <kbd>
                    bowtie suite -i lua-jsonschema
                    https://github.com/json-schema-org/JSON-Schema-Test-Suite/tree/main/tests/draft7/refRemote.json
                    &gt;output
                  </kbd>
                </pre>
              </p>
              <p>
                which will run the <code>refRemote.json</code> test file from
                the official suite against the specified implementation,
                emitting a file called &apos;output&apos; which you can then
                upload here!
              </p>
            </div>
            <div className={`${styles["flex-div"]} text-center`}>
              <CloudArrowUpFill size={80} />
              {invalidFile ? (
                <h5 className={"pt-3 text-danger"}>
                  That doesn&apos;t look like a Bowtie report.
                </h5>
              ) : (
                <>
                  <p className="card-text">
                    Drag and drop the JSON report file generated by Bowtie in
                    your local repository!
                  </p>
                  <button className="btn btn-primary" onClick={onButtonClick}>
                    Upload report
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
