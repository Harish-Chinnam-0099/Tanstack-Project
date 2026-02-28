import type { LoginInput,AuthUser } from "#/types";
import { ENV } from "#/config/env";

export async function login( 
  data: LoginInput
): Promise<AuthUser> {
  const res = await fetch(`${ENV.BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
 const result=await res.json()
  if (!res.ok) {
    throw new Error(result.message);
  }

  return result;
}