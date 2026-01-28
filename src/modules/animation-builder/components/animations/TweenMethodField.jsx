import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";

// Devices data
const methods = [
  {
    key: "from",
    label: "From",
  },
  {
    key: "to",
    label: "To",
  },
  {
    key: "fromto",
    label: "FromTo",
  },
];

const TweenMethodField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Label",
    tooltipContent = "Select Method",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [selectedMethod, setSelectedMethod] = useState("from");
  console.log(selectedMethod)

  return (
    <div className="flex items-center justify-between">
      <WCFABLabel title={title} tooltipContent={tooltipContent} />
        <div className="w-[176px] h-7 flex items-center gap-0.5 bg-[#202024] p-0.5 rounded-md ">
        {methods.map((method) => (
          <div
            key={method.key}
            onClick={() => setSelectedMethod(method.key)}
            className={`w-[56px] h-6 flex items-center justify-center rounded-md px-3 py-[5px] text-[11.5px] font-normal leading-4.5 cursor-pointer transition ${
              selectedMethod === method.key
                ? "bg-[#303033] text-[#FAFAFA]"
                : "text-[#A1A1AA] hover:bg-[#303033]"
            }`}
          >
            <span>{method?.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TweenMethodField;
