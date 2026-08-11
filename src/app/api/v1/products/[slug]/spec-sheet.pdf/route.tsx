import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { getProduct } from "@/lib/api/catalogue";
import { getSiteSettings } from "@/lib/api/getSiteSettings";
import { primaryPhone, primaryWhatsApp } from "@/lib/api/siteSettings";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  title: { fontSize: 18, marginBottom: 6, color: "#b45309" },
  subtitle: { fontSize: 11, marginBottom: 16, color: "#475569" },
  section: { marginTop: 14, marginBottom: 6, fontSize: 13, color: "#b45309" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: "40%", color: "#64748b" },
  value: { width: "60%" },
  footer: { marginTop: 24, fontSize: 10, color: "#64748b" },
});

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const settings = await getSiteSettings();
  const wa = primaryWhatsApp(settings);
  const phone = primaryPhone(settings);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>
          {product.shortDescription || "YugMach packaging machine spec sheet"}
        </Text>
        {product.priceDisplay ? (
          <Text>Price: {product.priceDisplay} (+GST)</Text>
        ) : (
          <Text>Price: On request</Text>
        )}

        {product.specGroups.map((group) => (
          <View key={group.group}>
            <Text style={styles.section}>{group.label}</Text>
            {group.fields.map((field) => (
              <View key={field.key} style={styles.row}>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.value}>{field.displayValue}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          YugMach · {settings.companyAddress}
          {"\n"}
          WhatsApp: {wa.display} · Phone: {phone.display} · {settings.companyEmail}
        </Text>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}-spec-sheet.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
