import { redirect } from "next/navigation";

export default function JobAlertRedirect() {
  redirect("/dashboard/alerts");
}
