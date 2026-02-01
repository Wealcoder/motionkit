import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";

import { Download01Icon, Upload01Icon } from "@hugeicons/core-free-icons";

import { toast } from "sonner";
import { AssetImage } from "../../../../../../../assets/AssetImage";

const ImportExports = () => {
  // close button handler
  const handleCloseClick = () => {
    console.log("close button clicked");
  };

  return (
    <div className="flex flex-col gap-[15px]">
      <ExportSection />
      <ImportSection />
    </div>
  );
};

export default ImportExports;

const ExportSection = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [animationData, setAnimationData] = useState([]);

  useEffect(() => {
    fetch("/animationData.json")
      .then((res) => res.json())
      .then((json) => setAnimationData(json))
      .catch(console.error);
  }, []);

  const allSelected = selectedIds.length === animationData.length;

  // Toggle select all
  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? animationData.map((item) => item.id) : []);
  };

  // Toggle single checkbox
  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Export handler
  const saveJsonFile = async (data, filename) => {
    const jsonData = JSON.stringify(data, null, 2);

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "JSON File",
              accept: { "application/json": [".json"] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(jsonData);
        await writable.close();

        toast.success("Export successful", {
          description: `${filename} saved`,
        });

        return;
      } catch (err) {
        if (err.name === "AbortError") {
          toast.error("Export Cancelled", {
            description: `${filename} exporting cancelled`,
          });
        }
        return;
      }
    }

    // fallback
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) return;

    const dataToExport =
      selectedIds.length === animationData.length
        ? animationData
        : animationData.filter((item) => selectedIds.includes(item.id));

    saveJsonFile(dataToExport, "animations-export.json");
  };

  const handleExportSingle = (item) => {
    saveJsonFile([item], `${item.label}.json`);
  };

  return (
    <div className="p-[15px] bg-background-topbar border-none outline-none rounded-5">
      {/* Header */}
      <div className="w-89 h-7.5 flex items-center justify-between">
        <h2 className="text-[15px] font-normal leading-5 text-white">Export</h2>

        <Button
          size="icon"
          disabled={!selectedIds?.length}
          onClick={handleExportSelected}
          className="max-w-[80px] min-w-[80px] max-h-7 px-[5px] py-[8px] bg-button hover:bg-button-action !text-foreground text-xss leading-4.25 tracking-normal border-none outline-none cursor-pointer"
        >
          <HugeiconsIcon icon={Download01Icon} />
          Export
        </Button>
      </div>

      {/* Select All */}
      <div className="flex items-center gap-1.5 w-27.5 h-4.5">
        <Checkbox
          disabled={!animationData?.length}
          checked={allSelected}
          onCheckedChange={toggleSelectAll}
          className="size-4 rounded-[4px]"
        />
        <p className="text-foreground text-sm font-normal leading-4.5 w-14.5 h-full">
          Select All
        </p>
        <span className="h-[18px] min-w-6 px-[5px] inline-flex items-center justify-center bg-button-action text-foreground text-sm rounded-lg text-center">
          {animationData?.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {animationData.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
                className="size-4 rounded-[4px]"
              />
              <span className="text-sm font-normal leading-4.5">
                {item.label}
              </span>
            </div>

            <button
              onClick={() => handleExportSingle(item)}
              className="bg-[#3F3F46] w-5 h-5 rounded-full p-1 flex items-center justify-center cursor-pointer"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className="w-2.5 h-2.5 text-[#E4E4E7]"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImportSection = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const isValidJson = (file) => file && file.type === "application/json";

  const handleFile = (file) => {
    if (!isValidJson(file)) {
      setError("Only JSON files are allowed");
      setFile(null);
      return;
    }
    setError("");
    setFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log(JSON.parse(e.target.result));
      } catch {
        setError("Invalid JSON structure");
      }
    };
    reader.readAsText(file);
  };

  return (
    <FieldSet
      className={
        "p-[15px] bg-background-topbar border-none outline-none rounded-5 "
      }
    >
      <h3 className="text-foreground text-[13px] font-medium leading-5 tracking-normal my-0">
        Import
      </h3>

      <FieldGroup className="!gap-[15px]">
        {/* Drop Zone */}
        <Field>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="max-h-[155px] p-[15px] flex flex-col items-center justify-center bg-background-sidebar text-center rounded-5 border border-dashed border-[#71717A] "
          >
            <img
              src={AssetImage.globalSettingExportJSONLogo}
              alt="JSON"
              className="size-[60px]"
            />

            {file && <p className="text-xs text-green-400 mb-1">{file.name}</p>}

            <FieldDescription className="!text-foreground-secondary text-xss font-normal leading-4.25 tracking-normal">
              Drag and drop or Upload .json file
            </FieldDescription>

            <input
              ref={inputRef}
              type="file"
              accept=".json"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />

            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="max-w-[85px] min-w-[85px] max-h-7 px-[5px] py-[8px] bg-button hover:bg-button-action !text-foreground text-xss leading-4.25 tracking-normal border-none outline-none cursor-pointer"
            >
              Browse file
            </Button>
          </div>

          {error && (
            <FieldError className="mt-2 text-xss text-red-400">
              {error}
            </FieldError>
          )}
        </Field>

        {/* Footer */}
        <Field className="space-y-2">
          <FieldDescription className="!text-foreground text-xss leading-4.25 tracking-normal">
            Streamlined data export solutions for enhanced accessibility and
            control
          </FieldDescription>
          <Button
            onClick={handleImport}
            disabled={!file}
            className="max-w-[80px] min-w-[80px] max-h-7 px-[5px] py-[8px] bg-button hover:bg-button-action !text-foreground text-xss leading-4.25 tracking-normal border-none outline-none cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={Upload01Icon} />
            import
          </Button>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
};
