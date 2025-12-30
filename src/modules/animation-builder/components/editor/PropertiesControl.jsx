import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputWithShape } from "@/components/ui/input-with-shape";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconPlus2 } from "../../../../assets/icons";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const easeConfig = [
  "power2.out",
  "power2.in",
  "power2.inOut",
  "power3.out",
  "power3.in",
  "power3.inOut",
  "power4.out",
  "power4.in",
  "power4.inOut",
  "back",
  "bounce",
  "circ",
  "elastic",
  "expo",
  "sine",
  "steps",
  "rough",
  "slow",
];

const PropertiesControl = ({
  properties,
  selectedProperties,
  addProperties,
  updateProperties,
  deleteProperties,
}) => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const generateField = (item) => {
    if (item.type === "boolean") {
      return (
        <Select
          value={item.value}
          onValueChange={(value) => updateProperties(value, item)}
        >
          <SelectTrigger className="min-w-[90px]">
            <SelectValue placeholder="Option" className="line-clamp-1" />
          </SelectTrigger>
          <SelectContent className="min-w-[90px]">
            <SelectGroup>
              <SelectItem value={"true"}>True</SelectItem>
              <SelectItem value={"false"}>False</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    } else if (item.type === "number") {
      if (item?.unit === "s") {
        return (
          <InputWithShape
            value={item?.value}
            onChange={(e) => updateProperties(e.target.value, item)}
            placeholder="add value"
          />
        );
      } else {
        return (
          <Input
            value={item?.value}
            type="number"
            onChange={(e) => updateProperties(Number(e.target.value), item)}
            placeholder="add value"
            className="no-spinner"
          />
        );
      }
    } else if (item.type === "string") {
      return (
        <Input
          value={item?.value}
          onChange={(e) => updateProperties(e.target.value, item)}
          placeholder="add value"
        />
      );
    } else if (item.type === "ease") {
      return (
        <Select
          value={item.value}
          onValueChange={(value) => updateProperties(value, item)}
        >
          <SelectTrigger className="min-w-[90px]">
            <SelectValue placeholder="Option" />
          </SelectTrigger>
          <SelectContent className="min-w-[90px]">
            <SelectGroup>
              {easeConfig?.map((el) => (
                <SelectItem key={el} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    } else if (item.type === "color") {
      return (
        <div className="flex items-center gap-1">
          <Input
            type="color"
            className="w-[28px] p-0 px-[2px]"
            value={item?.value}
            onChange={(e) => updateProperties(e.target.value, item)}
          />
          <Input
            value={item?.value}
            onChange={(e) => updateProperties(e.target.value, item)}
            placeholder="add value"
          />
        </div>
      );
    } else if (item.type === "pinType") {
      return (
        <Select
          defaultValue="transform"
          value={item.value}
          onValueChange={(value) => updateProperties(value, item)}
        >
          <SelectTrigger className="min-w-[90px]">
            <SelectValue placeholder="Option" />
          </SelectTrigger>
          <SelectContent className="min-w-[90px]">
            <SelectItem value="transform">transform</SelectItem>
            <SelectItem value="fixed">fixed</SelectItem>
          </SelectContent>
        </Select>
      );
    } else {
      <></>;
    }
  };

  // new system with groups
  const selectableProperties = properties?.map((group) => {
    const finalItems = group?.items?.filter((item) => {
      const isAlreadySelected = selectedProperties?.some(
        (el) => el.name === item.name && el.type === item.type
      );
      return !isAlreadySelected;
    });

    return {
      ...group,
      items: finalItems,
    };
  });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center gap-1.5">
        <h3>Add Properties</h3>
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="cursor-pointer flex justify-center items-center">
                <IconPlus2 size="14" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[180px]" align="end">
              <Command>
                <CommandInput placeholder="Search Properties" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>

                  {selectableProperties?.map((prop, i) => (
                    <>
                      <CommandGroup
                        heading={prop.name}
                        key={`group-${i}-${prop.name}`}
                        className="[&_[cmdk-group-heading]]:border-b [&_[cmdk-group-heading]]:border-text-2/10"
                      >
                        {prop?.items?.map((el, i) => (
                          <CommandItem
                            key={`properties-${el?.name}-${i}`}
                            value={el?.name}
                            className={cn("px-0", !el.info && "pl-6")}
                            onSelect={(value) => {
                              const selectedItem =
                                selectableProperties
                                  ?.flatMap((group) => group.items || [])
                                  ?.find((item) => item.name === value) || null;

                              addProperties(selectedItem);
                              setOpen(false);
                            }}
                          >
                            {el?.info ? <ToolTipWrapper text={el?.info} /> : ""}
                            {el?.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {selectedProperties?.length ? (
        <div className="flex flex-col gap-2">
          {selectedProperties?.map((item) => (
            <div key={item?.id}>
              {item.type === "custom" ? (
                <div className="flex flex-col gap-2">
                  <div className="w-[86px] mr-2 flex items-center gap-1">
                    <h3 className="text-xs text-text-2 line-clamp-1 capitalize">
                      {item?.name}
                    </h3>
                    {item?.info ? <ToolTipWrapper text={item?.info} /> : ""}
                  </div>
                  <div className="flex justify-between">
                    <div className="flex-1 mr-1.5">
                      <Textarea
                        value={item?.value}
                        onChange={(e) => updateProperties(e.target.value, item)}
                        placeholder="x:1, y:2"
                        className="resize-none"
                      />
                    </div>

                    <DeleteConfirmDialog
                      className="flex justify-center items-center cursor-pointer"
                      deleteFn={deleteProperties}
                      id={item?.id}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 justify-between items-center">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs text-text-2 capitalize">
                      {item?.name}
                    </h3>
                    {item?.info ? <ToolTipWrapper text={item?.info} /> : ""}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1">{generateField(item)}</div>

                    <DeleteConfirmDialog
                      className="flex justify-center items-center cursor-pointer"
                      deleteFn={deleteProperties}
                      id={item?.id}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
      {selectedProperties?.length ? (
        <div>
          <Popover open={open2} onOpenChange={setOpen2}>
            <PopoverTrigger asChild>
              <Button
                variant="tertiary"
                size="tertiary"
                className="[&_svg]:size-2.5"
              >
                <IconPlus className={"fill-text"} /> Add New
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px]" align="start">
              <Command>
                <CommandInput placeholder="Search Properties" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>

                  {selectableProperties?.map((prop, i) => (
                    <>
                      <CommandGroup
                        heading={prop.name}
                        key={`group-${i}-${prop.name}`}
                        className="[&_[cmdk-group-heading]]:border-b [&_[cmdk-group-heading]]:border-text-2/10"
                      >
                        {prop?.items?.map((el, i) => (
                          <CommandItem
                            key={`properties-${el?.name}-${i}`}
                            className={cn("px-0", !el.info && "pl-6")}
                            value={el?.name}
                            onSelect={(value) => {
                              const selectedItem =
                                selectableProperties
                                  ?.flatMap((group) => group.items || [])
                                  ?.find((item) => item.name === value) || null;

                              addProperties(selectedItem);
                              setOpen(false);
                            }}
                          >
                            {el?.info ? <ToolTipWrapper text={el?.info} /> : ""}
                            {el?.name}{" "}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PropertiesControl;
