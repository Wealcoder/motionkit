import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

const Search = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default Search;
