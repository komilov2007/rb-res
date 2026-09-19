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

// Same endpoint both the first-time signup step and the profile "edit name"
// flow use — POST matches this endpoint's only existing usage (there is no
// PATCH anywhere else in this project to follow instead).
export const signUp = async (data: SignupPayloadProps, shopId: string) => {
  return await request.post<UpdateFirstnameResponse>(
    `webapp/user/auth/update/firstname/${shopId}`,
    data,
  );
};
