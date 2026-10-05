import { request } from "@/configs/requests";
import type {
  AuthProps,
  LoginPayloadProps,
  SignupPayloadProps,
  UpdateFirstnameResponse,
} from "@/types/auth";

export const loginUser = async (data: LoginPayloadProps) => {
  return await request.post<AuthProps>("webapp/user/auth/login", data);
};

export const loginUserClick = async (webSession: string, shop: string) => {
  return await request.post<AuthProps>("click/profile", {
    web_session: webSession,
    shop,
  });
};

export const signUp = async (data: SignupPayloadProps, shopId: string) => {
  return await request.post<UpdateFirstnameResponse>(
    `webapp/user/auth/update/firstname/${shopId}`,
    data,
  );
};
