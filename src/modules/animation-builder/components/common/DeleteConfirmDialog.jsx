import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconDelete } from "@/lib/icons";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const DeleteConfirmDialog = ({ className, deleteFn, id, text, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <div className={cn(className)}>
            <IconDelete />
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={"hidden"}>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-sm">{text ?? "Do you want to delete this"}</p>
        </div>
        <DialogFooter className={"sm:justify-start"}>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => deleteFn(id)}>
              Confirm
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
