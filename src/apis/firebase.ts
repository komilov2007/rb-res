import { request } from "@/configs/requests";

// Same backend contract as rb-webapp src/api/firebase.ts
export const postFcmToken = async (data: {
  fb_token: string;
  customer: number;
}) => {
  return await request.post("firebase/generate/fb-token", data, {
    skipErrorToast: true,
  });
};
