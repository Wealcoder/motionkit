import { Badge } from "@@/components/ui/badge";
import { Switch } from "@@/components/ui/switch";
import { cn } from "@@/lib/utils";
import { Settings01Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";

const PresetCard = ({
  preset,
  slug,
  className,
  updateActiveItem,
  isDisable = false,
  preview = true,
}) => {
  const { is_upcoming, icon, label, doc_url, demo_url, is_active } =
    preset || {};

  const setCheck = (value, slug) => {
    if (updateActiveItem) {
      updateActiveItem({ value, slug });
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-[15px] bg-background rounded-lg  box-border shadow-common-2",
          className,
        )}
        id={slug || ""}
      >
        {preset ? (
          <>
            <div
              className={cn(
                "flex items-center gap-3",
                is_upcoming ? "opacity-50 pointer-events-none" : "",
              )}
            >
              <div
                className={cn(
                  "border rounded-full h-11 w-11 flex justify-center items-center shadow-common text-[20px]",
                )}
              >
                <HugeiconsIcon icon={Settings01Icon} size={18} />
              </div>
              {/* <div
                className={cn(
                  "border rounded-full h-11 w-11 flex justify-center items-center shadow-common text-[20px]",
                  icon
                )}
              /> */}

              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <h2 className="text-[15px] leading-6 font-medium">{label}</h2>
                  {is_upcoming ? (
                    <>
                      <div
                        className="w-4 h-4 bg-white rounded-full"
                        strokeWidth={4}
                      />

                      <Badge variant="pro">COMING</Badge>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex items-center">
                  <a
                    href={doc_url}
                    target="_blank"
                    className={cn(
                      "text-sm",
                      doc_url
                        ? "text-xs hover:text-text"
                        : "pointer-events-none text-[#CACFD8]",
                    )}
                  >
                    Documentation
                  </a>

                  {preview && (
                    <>
                      <div
                        className="w-4 h-4 bg-white rounded-full"
                        strokeWidth={4}
                      />
                      <a
                        href={demo_url}
                        target="_blank"
                        className={cn(
                          "text-sm",
                          demo_url
                            ? "text-xs hover:text-text"
                            : "pointer-events-none text-[#CACFD8]",
                        )}
                      >
                        Preview
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              {is_upcoming ? (
                ""
              ) : (
                <div>
                  <Switch
                    disabled={isDisable}
                    checked={is_active}
                    onCheckedChange={(value) => setCheck(value, slug)}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default PresetCard;
