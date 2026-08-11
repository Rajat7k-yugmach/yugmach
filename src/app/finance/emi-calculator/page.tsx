import { redirect } from "next/navigation";

/** EMI calculator removed from buyer persona — send people to ROI instead. */
export default function EmiCalculatorRedirect() {
  redirect("/finance/roi-calculator");
}
