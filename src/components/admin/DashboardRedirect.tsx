import { redirect } from "next/navigation";

/** YugMach admin home → go straight to Products (sidebar has everything else). */
export default function DashboardRedirect() {
  redirect("/admin/collections/products");
}
