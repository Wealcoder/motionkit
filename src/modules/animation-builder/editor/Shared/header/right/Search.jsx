import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

const Search = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default Search;
