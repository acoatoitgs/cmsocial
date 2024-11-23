"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { msg } from "@lingui/macro";
import { changeSchool as changeSchoolAPI } from "@olinfo/training-api";

export async function changeSchool(username: string, institute: string) {
  await changeSchoolAPI(institute);
  revalidatePath(`/user/${username}`);

  const messageId = msg`Scuola cambiata con successo`.id;
  redirect(`/user/${username}?notify=${encodeURIComponent(messageId)}`);
}
