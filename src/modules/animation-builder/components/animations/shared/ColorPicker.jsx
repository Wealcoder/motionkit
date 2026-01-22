import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Chrome from "@uiw/react-color-chrome";
import Swatch from "@uiw/react-color-swatch";

const ColorPicker = () => {
  const [color, setColor] = useState("#000000");
  // TODO: work on functionality
  return (
    <div className="flex justify-between items-center gap-[6px]">
      <style>{`
        [data-color-mode*="dark"].w-color-swatch {
          --sketch-swatch-border-top: 1px solid #525252 !important;
        }
        [data-color-mode*="dark"].w-color-github {
          width:100% !important;
          --github-border: none !important;
          --github-background-color: var(--popover) !important;
          --github-box-shadow: none !important;
          --github-arrow-border-color: none !important;
        }
        [data-color-mode*="dark"].w-color-github > div:nth-child(-n + 2) {
          display: none;
        }
        [data-color-mode*="dark"].w-color-github > div:nth-child(4) {
          padding: 10px 4px !important;
        }
        [data-color-mode*="dark"].w-color-github > div:nth-child(5) {
          padding: 10px 4px !important;
        }
        [data-color-mode*="dark"].w-color-github .w-color-editable-input > input {
          background:var(--input-primary-hover)!important;
          min-height: 28px;
          font-family: 'Inter', sans-serif;
          color: var(--foreground) !important;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: normal;
          border: none !important;
          outline: none !important;
          border-radius: 5px;
          cursor: text;
          box-shadow: none !important;
        }
        [data-color-mode*="dark"].w-color-github .w-color-editable-input > input:hover {
          background:var(--input-primary-hover)!important;
        }
        [data-color-mode*="dark"].w-color-github .w-color-editable-input > input:active {
          background:var(--input-primary-hover)!important;
        }
        [data-color-mode*="dark"].w-color-github .w-color-editable-input > span {
          --editable-input-label-color:var(--foreground) !important;
          font-size:11.5px;
          font-weight:600;
        }
        [data-color-mode*="dark"].w-color-github .w-color-saturation{
          border-radius: 5px !important;
        }
        [data-color-mode*="dark"].w-color-github > div:nth-child(5) > div:nth-child(2) {
          background: var(--input-primary-hover) !important;
          border-radius: 5px !important;
          height:28px;
          width:28px;
          display:flex;
          justify-content:center;
          align-items:center;
        }
        [data-color-mode*="dark"].w-color-github > div:nth-child(5) > div:nth-child(2) > svg>path {
          --chrome-arrow-fill:var(--foreground) !important
        }
      `}</style>
      <Popover>
        {/* Trigger */}
        <PopoverTrigger
          className="!h-[22px] !min-w-[22px] p-0 rounded-full border border-neutral-400 cursor-pointer"
          style={{ backgroundColor: color }}
        />

        {/* Popover content */}
        <PopoverContent
          align="end"
          className="p-2 max-w-[230px] flex justify-center items-center"
        >
          <Chrome
            data-color-mode="dark"
            inputType="hexa"
            defaultValue={"#000000"}
            onChange={(color) => {
              console.log(color);
              setColor(color.hexa);
            }}
          />
          <Swatch />
        </PopoverContent>
      </Popover>
      <Input className="wcf-ab-dynamic-field-input" />
    </div>
  );
};

export default ColorPicker;
