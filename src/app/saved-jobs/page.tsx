import { redirect } from "next/navigation";

export default function SavedJobsRedirect() {
  redirect("/dashboard/saved-jobs");
}
