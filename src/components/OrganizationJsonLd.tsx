import { JsonLd } from "@/components/JsonLd";
import { INDIAMART_REVIEWS_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site";
import type { SiteSettings } from "@/lib/api/siteSettings";
import { primaryPhone, telHref } from "@/lib/api/siteSettings";

export function OrganizationJsonLd({ settings }: { settings?: SiteSettings }) {
  const phone = settings ? primaryPhone(settings) : null;
  const telephone = phone ? telHref(phone) : "+917500399754";
  const email = settings?.companyEmail || "sales@yugmach.com";
  const address = settings?.companyAddress || "Sonkh Road, Mathura, Uttar Pradesh 281004, India";
  const logo = absoluteUrl("/brand-logo.png");
  const site = absoluteUrl("/");

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}#organization`,
        name: "YugMach",
        alternateName: ["Yug Mach", "YugMach Packing Machines"],
        url: site,
        logo: {
          "@type": "ImageObject",
          url: logo,
        },
        image: logo,
        email,
        telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sonkh Road",
          addressLocality: "Mathura",
          addressRegion: "Uttar Pradesh",
          postalCode: "281004",
          addressCountry: "IN",
        },
        sameAs: [INDIAMART_REVIEWS_URL],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${site}#localbusiness`,
        name: "YugMach",
        image: logo,
        url: site,
        telephone,
        email,
        address: {
          "@type": "PostalAddress",
          streetAddress: address,
          addressLocality: "Mathura",
          addressRegion: "Uttar Pradesh",
          postalCode: "281004",
          addressCountry: "IN",
        },
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        priceRange: "₹₹",
        openingHours: settings?.businessHours || "Mo-Sa 09:00-19:00",
        parentOrganization: { "@id": `${site}#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${site}#website`,
        url: site,
        name: "YugMach",
        publisher: { "@id": `${site}#organization` },
        inLanguage: ["en-IN", "hi-IN"],
      },
    ],
  };

  return <JsonLd data={data} />;
}
