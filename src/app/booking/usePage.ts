"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useGeneral } from "@/hooks/useGeneral";
import { useAuthStore } from "@/stores/auth";
import { getLocalPhone } from "@/utils/format-number";

import {
  bookingSchema,
  type BookingFormValues,
  type BookingSchemaContext,
} from "./schema";

export const usePage = () => {
  const auth = useAuthStore((state) => state.auth);
  const { data: general } = useGeneral();

  const form = useForm<BookingFormValues, BookingSchemaContext>({
    mode: "onChange",
    resolver: yupResolver(bookingSchema),
    context: { workingTime: general?.data?.working_time },
    defaultValues: bookingSchema.cast(
      {
        name: auth?.firstname ?? "",
        phone: getLocalPhone(auth?.phone),
      },
      { assert: false },
    ),
  });

  const onSubmit: SubmitHandler<BookingFormValues> = () => {};

  return { form, onSubmit };
};
