import type { Metadata } from "next";
import Link from "next/link";
import { hreflangAlternatesForHindi } from "@/lib/seo";

export const metadata: Metadata = {
  title: "हमारे बारे में — यगमच",
  description: "यगमच मथुरा में पैकिंग मशीनें बनाता है — प्रकाशित कीमतें, बिना झूठे दावे।",
  alternates: hreflangAlternatesForHindi("/hi/about"),
};

export default function HindiAboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" lang="hi">
      <h1 className="font-display text-3xl font-semibold">यगमच के बारे में</h1>
      <p className="mt-4 text-ink-muted">
        यगमच मथुरा में पैकिंग मशीनें बनाता और सप्लाई करता है। हम प्रकाशित कॉन्फ़िगरेशन कीमतें दिखाते हैं ताकि खरीदार
        बाज़ार की अस्पष्टता से बच सकें। GST अलग है; अंतिम कीमत पाउच साइज़, फिल्म और विकल्पों पर निर्भर करती है।
      </p>
      <p className="mt-4 text-ink-muted">
        हम बिना सबूत के ISO या “150+ क्लाइंट” जैसे दावे नहीं करते। ट्रायल, ड्रॉइंग और स्पेयर लीड-टाइम माँगें।
      </p>
      <p className="mt-6">
        <Link href="/hi/contact" className="underline">संपर्क करें</Link>
        {" · "}
        <Link href="/about" className="underline">English</Link>
      </p>
    </main>
  );
}
