import {
  Building2,
  DoorOpen,
  Home,
  MapPinned,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import XButton from "@/components/ui/x-button";
import { getDigits } from "@/utils/format-number";

type LocationDetailsProps = {
  isDesktop: boolean;
  addressName: string;
  addressTitle: string;
  comment: string;
  entrance: string;
  floor: string;
  room: string;
  isPending: boolean;
  isResolving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSubmit: () => void;
  setAddressTitle: (value: string) => void;
  setComment: (value: string) => void;
  setEntrance: (value: string) => void;
  setFloor: (value: string) => void;
  setRoom: (value: string) => void;
};

const LocationDetails = ({
  isDesktop,
  addressName,
  addressTitle,
  comment,
  entrance,
  floor,
  room,
  isPending,
  isResolving,
  onClose,
  onEdit,
  onSubmit,
  setAddressTitle,
  setComment,
  setEntrance,
  setFloor,
  setRoom,
}: LocationDetailsProps) => {
  const t = useTranslations();
  const inputClassName = isDesktop
    ? "h-11 rounded-xl !border-0 !border-b !border-gray180 !bg-transparent px-0 focus-within:!border-black focus-within:!bg-transparent hover:!border-transparent"
    : "h-12 rounded-xl !border-0 !border-b !border-gray180 !bg-transparent px-0 focus-within:!border-black focus-within:!bg-transparent hover:!border-transparent";

  return (
    <div className="flex h-full w-full flex-col bg-white px-5 pb-5 pt-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[21px] font-bold leading-7 text-black">
          {t("location.address_details")}
        </h2>
        <XButton size="lg" onClick={onClose} className="bg-gray10" />
      </div>

      <div className="mt-5 flex items-start justify-between gap-3 border-b border-gray180 pb-4">
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray220">
            <MapPinned size={14} className="text-gray220" />
            {t("delivery_address")}
          </span>
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-black">
            {addressName || t("select_address")}
          </p>
        </div>
        <Button
          type="button"
          variant="counter"
          size="icon-lg"
          className="shrink-0 text-gray220"
          onClick={onEdit}
          disabled={isPending}
        >
          <Pencil size={16} />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Input
          IconStart={DoorOpen}
          value={entrance}
          onChange={(event) => setEntrance(getDigits(event.target.value))}
          inputMode="numeric"
          placeholder={t("entrance")}
          wrapperClassName={inputClassName}
          className="text-xs placeholder:text-xs"
        />
        <Input
          IconStart={Building2}
          value={floor}
          onChange={(event) => setFloor(getDigits(event.target.value))}
          inputMode="numeric"
          placeholder={t("floor")}
          wrapperClassName={inputClassName}
          className="text-xs placeholder:text-xs"
        />
        <Input
          IconStart={Home}
          value={room}
          onChange={(event) => setRoom(getDigits(event.target.value))}
          inputMode="numeric"
          placeholder={t("room")}
          wrapperClassName={inputClassName}
          className="text-xs placeholder:text-xs"
        />
      </div>

      <div className="mt-4 grid gap-4">
        <Input
          IconStart={MessageSquare}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("location.courier_comment")}
          wrapperClassName={inputClassName}
        />
        <Input
          IconStart={Home}
          value={addressTitle}
          onChange={(event) => setAddressTitle(event.target.value)}
          placeholder={t("location.address_name")}
          wrapperClassName={inputClassName}
        />
      </div>

      <div className="mt-auto pt-5">
        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          disabled={isResolving || isPending || !addressName.trim()}
          onClick={onSubmit}
        >
          {t("common.confirm")}
        </Button>
      </div>
    </div>
  );
};

export default LocationDetails;



