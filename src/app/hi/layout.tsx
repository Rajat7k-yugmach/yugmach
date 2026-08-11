import { ReactNode } from "react";

export default function HiLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="hi" className="font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      {children}
    </div>
  );
}
