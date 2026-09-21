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

// Mounted only once the user is logged in (see booking.tsx's access guard),
// so the auth store is already populated when the defaults are read.
export const usePage = () => {
  const auth = useAuthStore((state) => state.auth);
  const { data: general } = useGeneral();

  const form = useForm<BookingFormValues, BookingSchemaContext>({
    mode: "onChange",
    resolver: yupResolver(bookingSchema),
    // The shop's schedule, read by the schema's day-off / working-hours
    // tests; RHF passes the latest value on every validation.
    context: { workingTime: general?.data?.working_time },
    defaultValues: bookingSchema.cast(
      {
        name: auth?.firstname ?? "",
        phone: getLocalPhone(auth?.phone),
      },
      { assert: false },
    ),
  });

  // TODO: there is no booking endpoint yet. Once the backend provides one,
  // add createBooking() to src/apis/booking.ts and call it from a
  // useMutation here (success toast + navigation live in its onSuccess).
  const onSubmit: SubmitHandler<BookingFormValues> = () => {};

  return { form, onSubmit };
};
