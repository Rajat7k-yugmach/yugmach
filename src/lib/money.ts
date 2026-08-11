import {
  PMFME_BENEFICIARY_CONTRIBUTION_RATE,
  PMFME_SUBSIDY_CAP_PAISE,
  PMFME_SUBSIDY_RATE,
} from "@/lib/constants";

/** Format integer rupees with Indian grouping: 225000 → ₹2,25,000 */
export function formatInrFromRupees(rupees: number): string {
  const sign = rupees < 0 ? "-" : "";
  const n = Math.abs(Math.trunc(rupees));
  const s = String(n);
  if (s.length <= 3) return `${sign}₹${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${sign}₹${parts.join(",")},${last3}`;
}

export function formatInrFromPaise(paise: number | null | undefined): string | null {
  if (paise == null) return null;
  return formatInrFromRupees(Math.floor(paise / 100));
}

export function paiseToRupees(paise: number): number {
  return Math.floor(paise / 100);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees) * 100;
}

export type PmfmeResult = {
  pricePaise: number;
  subsidyPaise: number;
  effectivePaise: number;
  beneficiaryContributionPaise: number;
  bankLoanPaise: number;
  subsidyDisplay: string;
  effectiveDisplay: string;
};

/** 35% credit-linked subsidy, capped at ₹10 lakh. */
export function calcPmfme(pricePaise: number): PmfmeResult {
  const uncapped = Math.floor(pricePaise * PMFME_SUBSIDY_RATE);
  const subsidyPaise = Math.min(uncapped, PMFME_SUBSIDY_CAP_PAISE);
  const effectivePaise = pricePaise - subsidyPaise;
  const beneficiaryContributionPaise = Math.floor(
    pricePaise * PMFME_BENEFICIARY_CONTRIBUTION_RATE,
  );
  const bankLoanPaise = Math.max(0, pricePaise - subsidyPaise - beneficiaryContributionPaise);
  return {
    pricePaise,
    subsidyPaise,
    effectivePaise,
    beneficiaryContributionPaise,
    bankLoanPaise,
    subsidyDisplay: formatInrFromPaise(subsidyPaise) ?? "₹0",
    effectiveDisplay: formatInrFromPaise(effectivePaise) ?? "₹0",
  };
}

/**
 * Reducing-balance EMI.
 * principalRupees after down payment; annualRatePercent e.g. 12; tenureMonths e.g. 60.
 */
export function calcEmi(
  principalRupees: number,
  annualRatePercent: number,
  tenureMonths: number,
): { emi: number; totalPayment: number; totalInterest: number } {
  if (principalRupees <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0 };
  }
  if (annualRatePercent <= 0) {
    const emi = Math.round(principalRupees / tenureMonths);
    return { emi, totalPayment: emi * tenureMonths, totalInterest: 0 };
  }
  const r = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = Math.round((principalRupees * r * factor) / (factor - 1));
  const totalPayment = emi * tenureMonths;
  return {
    emi,
    totalPayment,
    totalInterest: totalPayment - principalRupees,
  };
}

/** Rough teaser EMI: 20% down, 60 months, 12% p.a. */
export function teaserEmiFromPaise(pricePaise: number): number | null {
  if (!pricePaise) return null;
  const price = paiseToRupees(pricePaise);
  const principal = Math.round(price * 0.8);
  return calcEmi(principal, 12, 60).emi;
}
