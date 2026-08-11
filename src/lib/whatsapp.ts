import { WHATSAPP_E164 } from "@/lib/constants";

export type WaPlacement =
  | "hero"
  | "spec_table"
  | "price"
  | "faq"
  | "sticky"
  | "header"
  | "product_card"
  | "finder"
  | "footer"
  | "generic";

export function whatsappUrl(message: string, e164?: string): string {
  const num = (e164 || WHATSAPP_E164).replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function waMessageForProduct(name: string, slug?: string): string {
  return `Hi, mujhe ${name} ka price aur configuration chahiye${slug ? ` (/products/${slug})` : ""}.`;
}

export function waMessageForApplication(name: string): string {
  return `Hi, mujhe ${name} packing machine chahiye. Price aur video bhej sakte ho?`;
}

export function waMessageGeneric(): string {
  return "Hi, mujhe packing machine ke baare mein baat karni hai.";
}
