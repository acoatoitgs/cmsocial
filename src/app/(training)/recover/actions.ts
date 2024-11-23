"use server";

import { redirect } from "next/navigation";

import { msg } from "@lingui/macro";
import { recoverPassword as recoverPasswordAPI } from "@olinfo/training-api";

export async function recoverPassword(email: string, code: string) {
  await recoverPasswordAPI(email, code);

  if (code) {
    const messageId = msg`Una password temporanea è stata inviata alla tua email`.id;
    redirect(
      `/login?redirect=${encodeURIComponent("/user/me/edit/password")}&notify=${encodeURIComponent(messageId)}`,
    );
  }
}
