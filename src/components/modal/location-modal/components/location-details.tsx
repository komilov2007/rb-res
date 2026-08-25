import { Pencil } from "lucide-react";

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
  const inputClassName = isDesktop
    ? "h-10 rounded-xl !gap-0 !border-0 !border-b  "
    : "h-10 rounded-xl !gap-0 !border-0 !border-b ";

  return (
    <div className="flex h-full w-full flex-col bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold text-black">
          Manzil ma&apos;lumotlari
        </h2>
        <XButton size="lg" onClick={onClose} className="bg-gray10" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-b border-gray180 pb-3">
        <div className="min-w-0">
          <span className="block text-xs font-medium text-gray220">
            Yetkazish manzili
          </span>
          <span className="mt-1 block line-clamp-1 text-sm font-semibold text-black">
            {addressName || "Manzilni tanlang"}
          </span>
        </div>
        <Button
          type="button"
          variant="counter"
          size="icon-lg"
          onClick={onEdit}
          disabled={isPending}
        >
          <Pencil size={16} />
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-3 gap-4">
          <Input
            value={entrance}
            onChange={(event) => setEntrance(getDigits(event.target.value))}
            inputMode="numeric"
            placeholder="Kirish yo'lagi"
            wrapperClassName={inputClassName}
          />
          <Input
            value={floor}
            onChange={(event) => setFloor(getDigits(event.target.value))}
            inputMode="numeric"
            placeholder="Qavat"
            wrapperClassName={inputClassName}
          />
          <Input
            value={room}
            onChange={(event) => setRoom(getDigits(event.target.value))}
            inputMode="numeric"
            placeholder="Xona"
            wrapperClassName={inputClassName}
          />
        </div>
        <Input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Kuryer uchun izoh"
          wrapperClassName={inputClassName}
        />
        <Input
          value={addressTitle}
          onChange={(event) => setAddressTitle(event.target.value)}
          placeholder="Manzil nomi"
          wrapperClassName={inputClassName}
        />
      </div>
      <div className="mt-auto pt-6">
        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          disabled={isResolving || isPending || !addressName.trim()}
          onClick={onSubmit}
        >
          Tasdiqlash
        </Button>
      </div>
    </div>
  );
};

export default LocationDetails;
