import { IconHelp } from "@/lib/icons";

const InfoCard = ({
  text = "Animation applies only to the selected element.",
}) => {
  return (
    <div className="flex gap-1.5 p-1.5 rounded bg-button-tertiary">
      <IconHelp />
      <p className="text-xs text-text-2">{text}</p>
    </div>
  );
};

export default InfoCard;
