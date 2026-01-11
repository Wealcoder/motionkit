import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";

const DeleteBtn = ({ onDelete = () => {} }) => {
  return (
    <Button
      onClick={() => onDelete()}
      size="icon"
      className="bg-transparent hover:bg-button-cancel border-none outline-none rounded-5 transition-colors duration-200 ease-in-out"
    >
      <HugeiconsIcon
        icon={Delete01Icon}
        color="white"
        size={16}
        strokeWidth={2}
      />
    </Button>
  );
};

export default DeleteBtn;
