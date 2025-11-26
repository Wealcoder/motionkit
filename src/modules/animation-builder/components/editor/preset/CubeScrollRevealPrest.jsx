import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RiUploadCloud2Line } from "react-icons/ri";

const CubeScrollRevealPreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    endSectionClass: data?.endSectionClass || "",
    cubeMinWidth: data?.cubeMinWidth || "200px",
    cubeMaxWidth: data?.cubeMaxWidth || "600px",
    cubeMaxHeight: data?.cubeMaxHeight || "400px",
    position: data?.position || "",
    expandFace: data?.expandFace || "front",
    scale: data?.scale || "2.2",
    frontMedia: data?.frontMedia || {
      type: "video",
      url: "",
    },
    backMedia: data?.backMedia || {
      type: "image",
      url: "",
    },
    leftMedia: data?.leftMedia || {
      type: "image",
      url: "",
    },
    rightMedia: data?.rightMedia || {
      type: "image",
      url: "",
    },
    topMedia: data?.topMedia || {
      type: "image",
      url: "",
    },
    bottomMedia: data?.bottomMedia || {
      type: "image",
      url: "",
    },
    cubeAnimStart: data?.cubeAnimStart || "top top",
    cubeAnimCStart: data?.cubeAnimCStart || "",
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  function getImageUrl(sKey, mType) {
    const customUploader = wp
      .media({
        title: "Insert image",
        library: {
          type: mType ?? "image",
        },
        button: {
          text: "Use this image",
        },
        multiple: false,
      })
      .on("select", function () {
        const attachment = customUploader
          .state()
          .get("selection")
          .first()
          .toJSON();

        setFullConfig((prev) => ({
          ...prev,
          [sKey]: { ...prev[sKey], url: attachment.url ?? "" },
        }));
      });
    customUploader.on("open", function () {});
    customUploader.open();
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      {/* item class  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Item Class</h3>
          <ToolTipWrapper text={"Add the class name of the element"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.itemClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  itemClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      {/* end section class  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">End Section Class</h3>
          <ToolTipWrapper text={"Add the class name for end animation"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.endSectionClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  endSectionClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="csrp-item-1"
          className="py-3 border-b border-border"
        >
          <AccordionTrigger>Style</AccordionTrigger>
          <AccordionContent className="pb-0 mt-5 flex flex-col gap-4">
            {/* cube min width  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">
                  Cube Min Width
                </h3>
                <ToolTipWrapper text={"Add cube width when start"} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.cubeMinWidth}
                    onChange={(e) => {
                      setFullConfig((prev) => ({
                        ...prev,
                        cubeMinWidth: e.target.value,
                      }));
                    }}
                    placeholder="add value"
                  />
                </div>
              </div>
            </div>

            {/* cube max width  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">
                  Cube Max Width
                </h3>
                <ToolTipWrapper text={"Add cube width when finished"} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.cubeMaxWidth}
                    onChange={(e) => {
                      setFullConfig((prev) => ({
                        ...prev,
                        cubeMaxWidth: e.target.value,
                      }));
                    }}
                    placeholder="add value"
                  />
                </div>
              </div>
            </div>

            {/* cube max height  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">
                  Cube Max Height
                </h3>
                <ToolTipWrapper
                  text={"Add cube height when finished (optional)"}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.cubeMaxHeight}
                    onChange={(e) => {
                      setFullConfig((prev) => ({
                        ...prev,
                        cubeMaxHeight: e.target.value,
                      }));
                    }}
                    placeholder="add value"
                  />
                </div>
              </div>
            </div>

            {/* position  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Position X</h3>
                <ToolTipWrapper text={"Add position in x axis"} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.position}
                    onChange={(e) => {
                      setFullConfig((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }));
                    }}
                    placeholder="add value"
                  />
                </div>
              </div>
            </div>

            {/* expandFace  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">
                  Expanded Face
                </h3>
                <ToolTipWrapper
                  text={
                    "Choose which face of the cube will expand during the animation"
                  }
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 flex flex-col gap-2">
                  <Select
                    value={fullConfig.expandFace}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        expandFace: value,
                      }))
                    }
                  >
                    <SelectTrigger className="min-w-[90px]">
                      <SelectValue
                        placeholder="select face"
                        className="line-clamp-1"
                      />
                    </SelectTrigger>
                    <SelectContent className="min-w-[90px]">
                      <SelectGroup>
                        <SelectItem value={"front"}>Front</SelectItem>
                        <SelectItem value={"back"}>Back</SelectItem>
                        <SelectItem value={"left"}>Left</SelectItem>
                        <SelectItem value={"right"}>Right</SelectItem>
                        <SelectItem value={"top"}>Top</SelectItem>
                        <SelectItem value={"bottom"}>Bottom</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* scale  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Scale</h3>
                <ToolTipWrapper text={"Add scale value"} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.scale}
                    onChange={(e) => {
                      setFullConfig((prev) => ({
                        ...prev,
                        scale: e.target.value,
                      }));
                    }}
                    placeholder="add value"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="csrp-item-2"
          className="py-3 border-b border-border"
        >
          <AccordionTrigger>Assets</AccordionTrigger>
          <AccordionContent className="pb-0 mt-5 flex flex-col gap-4">
            {/* front  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Front Media</h3>
                <ToolTipWrapper text={"Add front media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.frontMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        frontMedia: { ...prev.frontMedia, url: e.target.value },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.frontMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        frontMedia: { ...prev.frontMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("frontMedia", fullConfig.frontMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>

            {/* back  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Back Media</h3>
                <ToolTipWrapper text={"Add back media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.backMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        backMedia: { ...prev.backMedia, url: e.target.value },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.backMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        backMedia: { ...prev.backMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("backMedia", fullConfig.backMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>

            {/* left  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Left Media</h3>
                <ToolTipWrapper text={"Add left media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.leftMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        leftMedia: { ...prev.leftMedia, url: e.target.value },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.leftMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        leftMedia: { ...prev.leftMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("leftMedia", fullConfig.leftMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>

            {/* right  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Right Media</h3>
                <ToolTipWrapper text={"Add right media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.rightMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        rightMedia: { ...prev.rightMedia, url: e.target.value },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.rightMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        rightMedia: { ...prev.rightMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("rightMedia", fullConfig.rightMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>

            {/* top  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Top Media</h3>
                <ToolTipWrapper text={"Add top media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.topMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        topMedia: { ...prev.topMedia, url: e.target.value },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.topMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        topMedia: { ...prev.topMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("topMedia", fullConfig.topMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>

            {/* bottom  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">Bottom Media</h3>
                <ToolTipWrapper text={"Add bottom media url"} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex-1">
                  <Input
                    value={fullConfig?.bottomMedia?.url}
                    onChange={(e) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        bottomMedia: {
                          ...prev.bottomMedia,
                          url: e.target.value,
                        },
                      }))
                    }
                    placeholder="add url"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={fullConfig.bottomMedia?.type}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        bottomMedia: { ...prev.bottomMedia, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[90px] min-w-[90px]">
                      <SelectValue placeholder="Media Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      getImageUrl("bottomMedia", fullConfig.bottomMedia?.type)
                    }
                    className="px-[5px]"
                  >
                    <RiUploadCloud2Line size="20" />
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="csrp-item-3" className="py-3">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent className="pb-0 mt-5 flex flex-col gap-4">
            {/* cube animation start  */}
            <div className="grid grid-cols-2 gap-2 justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text-2 capitalize">
                  Cube Animation Start
                </h3>
                <ToolTipWrapper
                  text={
                    "Select the direction where the animation will move (Left, Right, Top, or Bottom)"
                  }
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 flex flex-col gap-2">
                  <Select
                    value={fullConfig.cubeAnimStart}
                    onValueChange={(value) =>
                      setFullConfig((prev) => ({
                        ...prev,
                        cubeAnimStart: value,
                      }))
                    }
                  >
                    <SelectTrigger className="min-w-[90px]">
                      <SelectValue
                        placeholder="Top Top"
                        className="line-clamp-1"
                      />
                    </SelectTrigger>
                    <SelectContent className="min-w-[90px]">
                      <SelectGroup>
                        <SelectItem value={"top top"}>Top Top</SelectItem>
                        <SelectItem value={"top center"}>Top Center</SelectItem>
                        <SelectItem value={"top bottom"}>Top Bottom</SelectItem>
                        <SelectItem value={"bottom top"}>Bottom Top</SelectItem>
                        <SelectItem value={"bottom center"}>
                          Bottom Center
                        </SelectItem>
                        <SelectItem value={"bottom bottom"}>
                          Bottom Bottom
                        </SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fullConfig.cubeAnimStart === "custom" ? (
                    <Input
                      placeholder="top top+=100"
                      value={fullConfig.cubeAnimCStart}
                      onChange={(e) =>
                        setFullConfig((prev) => ({
                          ...prev,
                          cubeAnimCStart: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CubeScrollRevealPreset;
