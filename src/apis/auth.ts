import { request } from "@/configs/requests";
import type {
  AuthProps,
  LoginPayloadProps,
  SignupPayloadProps,
} from "@/types/auth";

export const loginUser = async (data: LoginPayloadProps) => {
  return await request.post<AuthProps>("webapp/user/auth/login", data);
};

export const signUp = async (data: SignupPayloadProps, shopId: string) => {
  return await request.post(`webapp/user/auth/update/firstname/${shopId}`, data);
};
