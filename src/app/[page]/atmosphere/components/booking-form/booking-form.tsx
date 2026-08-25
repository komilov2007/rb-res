"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  MessageSquareText,
  Phone,
  Plus,
  X,
  User,
  Users,
} from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFlagUzbek } from "@/icons/flag-uzbek";
import { getDigits } from "@/utils/format-number";

const guestCounts = ["1", "2", "3", "4", "5", "6", "7", "8+"];

const handlePhoneInput = (event: FormEvent<HTMLInputElement>) => {
  event.currentTarget.value = getDigits(event.currentTarget.value, 9);
};

const BookingForm = () => {
  const [showOptionalPhone, setShowOptionalPhone] = useState(false);

  return (
    <div className="p-4 lg:p-10">
      <form className="mx-auto max-w-190">
        <span className="block h-1 w-10 rounded-full bg-primary" />
        <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-primary">
          Bron qilish
        </p>
        <h2 className="mt-2 max-w-107.5 text-2xl font-extrabold leading-tight text-white lg:text-[30px]">
          Stol band qilish uchun ma'lumotlarni to'ldiring
        </h2>
        <Field label="Ism">
          <Input
            IconStart={User}
            placeholder="Ismingiz"
            wrapperClassName="h-13 rounded-xl border-white/30 bg-white/10 focus-within:border-primary focus-within:!bg-white/10 [&_svg]:!text-white/70"
            className="font-semibold text-white placeholder:text-white/70"
          />
        </Field>
        <div className="mt-6 grid gap-3 lg:grid-cols-2 lg:gap-4">
          <Field label="Joy soni">
            <Select defaultValue="2">
              <SelectTrigger className="h-13 w-full rounded-xl border border-white/30 bg-white/10 px-5 text-base font-extrabold text-white outline-none focus:border-primary">
                <Users size={20} className="text-white/65" />
                <SelectValue placeholder="Joy soni" />
              </SelectTrigger>
              <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) rounded-xl border-gray180 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {guestCounts.map((count) => (
                    <SelectItem
                      key={count}
                      value={count}
                      className="rounded-lg px-4 py-3 text-base font-semibold data-[state=checked]:bg-primary10 data-[state=checked]:text-primary"
                    >
                      {count} kishi
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Telefon raqam" required>
            <Input
              inputMode="numeric"
              onInput={handlePhoneInput}
              placeholder="Telefon raqam"
              wrapperClassName="h-13 rounded-xl border-white/30 bg-white/10 focus-within:border-primary focus-within:!bg-white/10 [&_svg]:!text-white/70"
              className="font-semibold text-white placeholder:text-white/70"
              startContent={<PhoneStart />}
            />
          </Field>

          {showOptionalPhone ? (
            <Field
              label="Qo'shimcha telefon"
              badge="ixtiyoriy"
              className="lg:col-span-2"
            >
              <Input
                inputMode="numeric"
                onInput={handlePhoneInput}
                placeholder="Ixtiyoriy telefon raqam"
                wrapperClassName="h-13 rounded-xl border-white/30 bg-white/10 focus-within:border-primary focus-within:!bg-white/10 [&_svg]:!text-white/70"
                className="font-semibold text-white placeholder:text-white/70"
                startContent={<PhoneStart />}
                endContent={
                  <Button
                    type="button"
                    variant="clear"
                    size="clear"
                    onClick={() => setShowOptionalPhone(false)}
                  >
                    <X size={14} strokeWidth={2.4} />
                  </Button>
                }
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowOptionalPhone(true)}
              className="flex w-fit items-center gap-2 text-sm font-extrabold text-white lg:col-span-2"
            >
              <Plus size={17} />
              Qo&apos;shimcha telefon qo&apos;shish
            </button>
          )}

          <Field label="Izoh qoldirish" className="lg:col-span-2">
            <div className="flex min-h-24 rounded-xl border border-white/30 bg-white/10 px-5 py-4 focus-within:border-primary focus-within:bg-white/10 lg:min-h-27">
              <MessageSquareText
                size={20}
                className="mr-3 shrink-0 text-white/65"
              />
              <textarea
                placeholder="Izohingizni yozing..."
                className="min-h-18 w-full resize-none bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/70 lg:min-h-21"
              />
            </div>
          </Field>
        </div>

        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          className="mt-5 h-13 w-full rounded-xl text-base lg:mt-6"
        >
          Bron qilish
          <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
};

const Field = ({
  label,
  badge,
  required,
  className = "",
  children,
}: {
  label: string;
  badge?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center gap-1 text-sm font-bold text-white">
        {label}
        {required && <span className="text-red">*</span>}
        {badge && (
          <span className="ml-auto text-xs font-semibold text-white/60">
            {badge}
          </span>
        )}
      </span>
      {children}
    </label>
  );
};

const PhoneStart = () => {
  return (
    <>
      <Phone size={18} className="shrink-0 text-white/65" />
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
        <IconFlagUzbek />
      </span>
      <span className="shrink-0 text-sm font-bold text-white">+998</span>
    </>
  );
};

export default BookingForm;
