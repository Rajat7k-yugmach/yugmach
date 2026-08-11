import type { GlobalConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { revalidateContent } from "@/lib/payload/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: "businessHours",
      type: "text",
      defaultValue: "Mon–Sat, 9am–7pm",
    },
    { name: "gstin", type: "text" },
    { name: "showGstin", type: "checkbox", defaultValue: true },
    {
      name: "companyEmail",
      type: "email",
      defaultValue: "sales@yugmach.com",
    },
    {
      name: "companyAddress",
      type: "textarea",
      defaultValue: "Sonkh Road, Mathura, Uttar Pradesh 281004, India",
    },
  ],
  hooks: {
    afterChange: [() => revalidateContent(["site-settings"])],
  },
};
