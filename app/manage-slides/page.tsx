import { redirect } from "next/navigation";

/**
 * Manage Slides Page
 * 
 * This route is deprecated and does not have real persistence.
 * Users are redirected to the CMS Dashboard where they can navigate to
 * individual slides via /edit-slide/[slideId] which has proper persistence.
 */
export default function ManageSlidesPage() {
  redirect("/");
}
