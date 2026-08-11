/**
 * Money / finance formatting helpers.
 * Prefer importing from here in pages; implementation lives in money.ts.
 */
export {
  calcEmi,
  calcPmfme,
  formatInrFromPaise,
  formatInrFromRupees,
  paiseToRupees,
  rupeesToPaise,
  teaserEmiFromPaise,
  type PmfmeResult,
} from "@/lib/money";

/** Simple ROI: annual profit / investment. */
export function calcRoi(investmentRupees: number, annualProfitRupees: number): {
  roiPercent: number;
  paybackMonths: number | null;
} {
  if (investmentRupees <= 0) {
    return { roiPercent: 0, paybackMonths: null };
  }
  const roiPercent = (annualProfitRupees / investmentRupees) * 100;
  const monthlyProfit = annualProfitRupees / 12;
  const paybackMonths =
    monthlyProfit > 0 ? Math.ceil(investmentRupees / monthlyProfit) : null;
  return { roiPercent, paybackMonths };
}
