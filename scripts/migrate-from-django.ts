/**
 * One-time ETL: Django Postgres → Payload (Neon/local Postgres).
 *
 * Usage:
 *   DJANGO_DATABASE_URL=postgres://… POSTGRES_URL=postgres://… \
 *   PAYLOAD_SECRET=… npm run migrate:django
 */
import { getPayload } from "payload";
import pg from "pg";

import config from "../src/payload.config";

const { Client } = pg;

type Row = Record<string, unknown>;

function statusMap(s: unknown): "draft" | "published" | "archived" {
  const v = String(s || "draft").toLowerCase();
  if (v === "published") return "published";
  if (v === "archived") return "archived";
  return "draft";
}

async function main() {
  const djangoUrl =
    process.env.DJANGO_DATABASE_URL ||
    "postgres://localhost:5432/yugmach_dev";
  const django = new Client({ connectionString: djangoUrl });
  await django.connect();
  console.log("Connected to Django DB");

  const payload = await getPayload({ config });
  console.log("Payload ready");

  const idMaps = {
    machineTypes: new Map<string, string | number>(),
    applications: new Map<string, string | number>(),
    industries: new Map<string, string | number>(),
    products: new Map<string, string | number>(),
    blogCategories: new Map<string, string | number>(),
    finderSteps: new Map<string, string | number>(),
  };

  // Machine types
  const machineTypes = (await django.query(`SELECT * FROM machine_type ORDER BY sort_order`))
    .rows as Row[];
  for (const row of machineTypes) {
    const doc = await payload.create({
      collection: "machine-types",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        nameHi: String(row.name_hi || ""),
        description: String(row.description || ""),
        descriptionHi: String(row.description_hi || ""),
        heroImage: String(row.hero_image || ""),
        sortOrder: Number(row.sort_order || 0),
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
    idMaps.machineTypes.set(String(row.id), doc.id);
  }
  console.log(`machine-types: ${machineTypes.length}`);

  // Applications
  const applications = (await django.query(`SELECT * FROM application ORDER BY sort_order`))
    .rows as Row[];
  for (const row of applications) {
    const doc = await payload.create({
      collection: "applications",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        nameHi: String(row.name_hi || ""),
        h1: String(row.h1 || row.name),
        h1Hi: String(row.h1_hi || ""),
        intro: String(row.intro || ""),
        introHi: String(row.intro_hi || ""),
        body: String(row.body || ""),
        bodyHi: String(row.body_hi || ""),
        productChallenges: String(row.product_challenges || ""),
        recommendedFillType: row.recommended_fill_type
          ? (String(row.recommended_fill_type) as
              | "AUGER"
              | "CUP"
              | "MULTI_HEAD"
              | "LINEAR_WEIGH"
              | "LIQUID"
              | "MANUAL")
          : undefined,
        typicalPouchSizes: row.typical_pouch_sizes || [],
        typicalFilmTypes: row.typical_film_types || [],
        heroImage: String(row.hero_image || ""),
        sortOrder: Number(row.sort_order || 0),
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
    idMaps.applications.set(String(row.id), doc.id);
  }
  console.log(`applications: ${applications.length}`);

  // Industries
  const industries = (await django.query(`SELECT * FROM industry ORDER BY name`)).rows as Row[];
  for (const row of industries) {
    const doc = await payload.create({
      collection: "industries",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        nameHi: String(row.name_hi || ""),
        description: String(row.description || ""),
        descriptionHi: String(row.description_hi || ""),
        heroImage: String(row.hero_image || ""),
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
    idMaps.industries.set(String(row.id), doc.id);
  }
  console.log(`industries: ${industries.length}`);

  // Spec fields
  const specFields = (await django.query(`SELECT * FROM spec_field ORDER BY display_order`))
    .rows as Row[];
  for (const row of specFields) {
    await payload.create({
      collection: "spec-fields",
      data: {
        key: String(row.key),
        label: String(row.label),
        labelHi: String(row.label_hi || ""),
        dataType: String(row.data_type || "TEXT") as
          | "INT"
          | "DECIMAL"
          | "TEXT"
          | "BOOL"
          | "ENUM"
          | "RANGE"
          | "MULTI",
        enumOptions: row.enum_options || [],
        group: String(row.group || "CAPACITY") as
          | "CAPACITY"
          | "FILL"
          | "POUCH"
          | "SEAL"
          | "POWER"
          | "PHYSICAL"
          | "CONTROL"
          | "COMMERCIAL",
        displayOrder: Number(row.display_order || 0),
        unit: String(row.unit || ""),
        prefixValue: String(row.prefix_value || ""),
        suffixValue: String(row.suffix_value || ""),
        helpText: String(row.help_text || ""),
        showInSummary: Boolean(row.show_in_summary),
        isFilterable: Boolean(row.is_filterable),
        isComparable: row.is_comparable !== false,
        isRequired: Boolean(row.is_required),
        sheetColumn: String(row.sheet_column || ""),
        isActive: row.is_active !== false,
      },
      overrideAccess: true,
    });
  }
  console.log(`spec-fields: ${specFields.length}`);

  // Products + images + videos
  const products = (await django.query(`SELECT * FROM product ORDER BY sort_order`)).rows as Row[];
  const appLinks = (
    await django.query(`SELECT product_id, application_id FROM application_product`)
  ).rows as Row[];
  const industryLinks = (
    await django.query(
      `SELECT product_id, industry_id FROM product_industries`,
    ).catch(() =>
      django.query(
        `SELECT product_id, industry_id FROM catalogue_product_industries`,
      ),
    )
  ).rows as Row[];

  for (const row of products) {
    const djangoId = String(row.id);
    const appIds = appLinks
      .filter((l) => String(l.product_id) === djangoId)
      .map((l) => idMaps.applications.get(String(l.application_id)))
      .filter(Boolean) as Array<string | number>;
    const indIds = industryLinks
      .filter((l) => String(l.product_id) === djangoId)
      .map((l) => idMaps.industries.get(String(l.industry_id)))
      .filter(Boolean) as Array<string | number>;

    const images = (
      await django.query(
        `SELECT * FROM product_image WHERE product_id = $1 ORDER BY sort_order`,
        [row.id],
      )
    ).rows as Row[];
    const videos = (
      await django.query(
        `SELECT * FROM product_video WHERE product_id = $1 ORDER BY sort_order`,
        [row.id],
      )
    ).rows as Row[];

    const mtId = row.machine_type_id
      ? idMaps.machineTypes.get(String(row.machine_type_id))
      : undefined;

    const doc = await payload.create({
      collection: "products",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        nameHi: String(row.name_hi || ""),
        shortDescription: String(row.short_description || ""),
        shortDescriptionHi: String(row.short_description_hi || ""),
        description: String(row.description || ""),
        descriptionHi: String(row.description_hi || ""),
        pricePaise: row.price_paise != null ? Number(row.price_paise) : undefined,
        priceUnit: String(row.price_unit || "Unit"),
        priceNote: String(row.price_note || ""),
        machineType: mtId,
        applications: appIds,
        industries: indIds,
        specs: (row.specs as Record<string, unknown>) || {},
        features: (row.features as string[]) || [],
        useCases: (row.use_cases as string[]) || [],
        images: images.map((img) => ({
          cloudinaryId: String(img.cloudinary_id || ""),
          url: String(img.url || ""),
          alt: String(img.alt || row.name),
          altHi: String(img.alt_hi || ""),
          width: Number(img.width || 800),
          height: Number(img.height || 600),
          isPrimary: Boolean(img.is_primary),
          sortOrder: Number(img.sort_order || 0),
        })),
        videos: videos.map((v) => ({
          provider: String(v.provider || "youtube"),
          videoId: String(v.video_id),
          title: String(v.title || ""),
          description: String(v.description || ""),
          thumbnailUrl: String(v.thumbnail_url || ""),
          durationSec: v.duration_sec != null ? Number(v.duration_sec) : undefined,
          transcript: String(v.transcript || ""),
          sortOrder: Number(v.sort_order || 0),
        })),
        status: statusMap(row.status),
        isFeatured: Boolean(row.is_featured),
        sortOrder: Number(row.sort_order || 0),
        viewCount: Number(row.view_count || 0),
        indiamartUrl: String(row.indiamart_url || ""),
        legacyId: djangoId,
      },
      overrideAccess: true,
    });
    idMaps.products.set(djangoId, doc.id);
  }
  console.log(`products: ${products.length}`);

  // FAQs
  const faqs = (await django.query(`SELECT * FROM faq ORDER BY sort_order`)).rows as Row[];
  for (const row of faqs) {
    await payload.create({
      collection: "faqs",
      data: {
        question: String(row.question),
        questionHi: String(row.question_hi || ""),
        answer: String(row.answer),
        answerHi: String(row.answer_hi || ""),
        product: row.product_id
          ? idMaps.products.get(String(row.product_id))
          : undefined,
        application: row.application_id
          ? idMaps.applications.get(String(row.application_id))
          : undefined,
        scope: String(row.scope || "product") as "product" | "application" | "general",
        sortOrder: Number(row.sort_order || 0),
      },
      overrideAccess: true,
    });
  }
  console.log(`faqs: ${faqs.length}`);

  // Finder steps
  const finderSteps = (
    await django.query(`SELECT * FROM finder_step ORDER BY sort_order`)
  ).rows as Row[];
  for (const row of finderSteps) {
    const doc = await payload.create({
      collection: "finder-steps",
      data: {
        key: String(row.key),
        label: String(row.label),
        labelHi: String(row.label_hi || ""),
        helpText: String(row.help_text || ""),
        inputType: String(row.input_type || "chip") as "select" | "chip" | "number",
        options: row.options || [],
        source: String(row.source || ""),
        visibleWhen: (row.visible_when as Record<string, unknown>) || {},
        sortOrder: Number(row.sort_order || 0),
        isActive: row.is_active !== false,
      },
      overrideAccess: true,
    });
    idMaps.finderSteps.set(String(row.id), doc.id);
  }
  console.log(`finder-steps: ${finderSteps.length}`);

  // Blog categories + posts
  const blogCategories = (await django.query(`SELECT * FROM blog_category`)).rows as Row[];
  for (const row of blogCategories) {
    const doc = await payload.create({
      collection: "blog-categories",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        nameHi: String(row.name_hi || ""),
      },
      overrideAccess: true,
    });
    idMaps.blogCategories.set(String(row.id), doc.id);
  }
  const blogPosts = (await django.query(`SELECT * FROM blog_post`)).rows as Row[];
  for (const row of blogPosts) {
    await payload.create({
      collection: "blog-posts",
      data: {
        slug: String(row.slug),
        title: String(row.title),
        titleHi: String(row.title_hi || ""),
        excerpt: String(row.excerpt || ""),
        excerptHi: String(row.excerpt_hi || ""),
        content: String(row.content || ""),
        contentHi: String(row.content_hi || ""),
        coverImage: String(row.cover_image || ""),
        coverImageAlt: String(row.cover_image_alt || ""),
        category: row.category_id
          ? idMaps.blogCategories.get(String(row.category_id))
          : undefined,
        tags: (row.tags as string[]) || [],
        authorName: String(row.author_name || "YugMach"),
        readingMins: Number(row.reading_mins || 5),
        status: statusMap(row.status),
        publishedAt: row.published_at
          ? new Date(String(row.published_at)).toISOString()
          : undefined,
      },
      overrideAccess: true,
    });
  }
  console.log(`blog: ${blogCategories.length} categories, ${blogPosts.length} posts`);

  // Case studies
  const caseStudies = (await django.query(`SELECT * FROM case_study`)).rows as Row[];
  for (const row of caseStudies) {
    await payload.create({
      collection: "case-studies",
      data: {
        slug: String(row.slug),
        customerName: String(row.customer_name),
        customerCity: String(row.customer_city || ""),
        industry: String(row.industry || ""),
        challenge: String(row.challenge || ""),
        solution: String(row.solution || ""),
        results: String(row.results || ""),
        metrics: (row.metrics as Record<string, unknown>) || {},
        videoId: String(row.video_id || ""),
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
  }
  console.log(`case-studies: ${caseStudies.length}`);

  // Testimonials
  const testimonials = (await django.query(`SELECT * FROM testimonial`)).rows as Row[];
  for (const row of testimonials) {
    await payload.create({
      collection: "testimonials",
      data: {
        customerName: String(row.customer_name),
        company: String(row.company || ""),
        city: String(row.city || ""),
        rating: Number(row.rating || 5),
        text: String(row.text),
        textHi: String(row.text_hi || ""),
        product: row.product_id
          ? idMaps.products.get(String(row.product_id))
          : undefined,
        source: String(row.source || "direct"),
        sourceUrl: String(row.source_url || ""),
        isVerified: Boolean(row.is_verified),
        isFeatured: Boolean(row.is_featured),
      },
      overrideAccess: true,
    });
  }
  console.log(`testimonials: ${testimonials.length}`);

  // Locations
  const locations = (await django.query(`SELECT * FROM location`)).rows as Row[];
  for (const row of locations) {
    await payload.create({
      collection: "locations",
      data: {
        slug: String(row.slug),
        city: String(row.city),
        state: String(row.state),
        h1: String(row.h1),
        body: String(row.body || ""),
        localCluster: String(row.local_cluster || ""),
        serviceEta: String(row.service_eta || ""),
        installationCount: Number(row.installation_count || 0),
        lat: row.lat != null ? Number(row.lat) : undefined,
        lng: row.lng != null ? Number(row.lng) : undefined,
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
  }
  console.log(`locations: ${locations.length}`);

  // Spare parts
  const spareParts = (await django.query(`SELECT * FROM spare_part`)).rows as Row[];
  for (const row of spareParts) {
    await payload.create({
      collection: "spare-parts",
      data: {
        slug: String(row.slug),
        name: String(row.name),
        sku: String(row.sku || ""),
        description: String(row.description || ""),
        pricePaise: row.price_paise != null ? Number(row.price_paise) : undefined,
        status: statusMap(row.status),
      },
      overrideAccess: true,
    });
  }
  console.log(`spare-parts: ${spareParts.length}`);

  // Redirects
  const redirects = (await django.query(`SELECT * FROM seo_redirect`)).rows as Row[];
  for (const row of redirects) {
    await payload.create({
      collection: "redirects",
      data: {
        source: String(row.source),
        destination: String(row.destination),
        isPermanent: row.is_permanent !== false,
        hits: Number(row.hits || 0),
      },
      overrideAccess: true,
    });
  }
  console.log(`redirects: ${redirects.length}`);

  // Contact channels + site settings
  const channels = (
    await django.query(`SELECT * FROM core_contactchannel ORDER BY sort_order`).catch(() =>
      django.query(`SELECT * FROM contact_channel ORDER BY sort_order`),
    )
  ).rows as Row[];
  for (const row of channels) {
    await payload.create({
      collection: "contact-channels",
      data: {
        channelType: String(row.channel_type) as "whatsapp" | "phone",
        label: String(row.label),
        e164: String(row.e164),
        display: String(row.display),
        isPrimary: Boolean(row.is_primary),
        isActive: row.is_active !== false,
        sortOrder: Number(row.sort_order || 0),
      },
      overrideAccess: true,
    });
  }
  console.log(`contact-channels: ${channels.length}`);

  const settings = (
    await django.query(`SELECT * FROM core_sitesettings WHERE id = 1`).catch(() =>
      django.query(`SELECT * FROM site_settings LIMIT 1`),
    )
  ).rows[0] as Row | undefined;
  if (settings) {
    await payload.updateGlobal({
      slug: "site-settings",
      data: {
        businessHours: String(settings.business_hours || "Mon–Sat, 9am–7pm"),
        gstin: String(settings.gstin || ""),
        showGstin: settings.show_gstin !== false,
        companyEmail: String(settings.company_email || "sales@yugmach.com"),
        companyAddress: String(
          settings.company_address ||
            "Sonkh Road, Mathura, Uttar Pradesh 281004, India",
        ),
      },
      overrideAccess: true,
    });
    console.log("site-settings: updated");
  }

  // Leads
  const leads = (await django.query(`SELECT * FROM lead ORDER BY created_at`)).rows as Row[];
  for (const row of leads) {
    await payload.create({
      collection: "leads",
      data: {
        name: String(row.name),
        phone: String(row.phone),
        email: String(row.email || "") || undefined,
        company: String(row.company || ""),
        city: String(row.city || ""),
        state: String(row.state || ""),
        message: String(row.message || ""),
        productToPack: String(row.product_to_pack || ""),
        requiredPph: row.required_pph != null ? Number(row.required_pph) : undefined,
        pouchSizeRange: String(row.pouch_size_range || ""),
        budgetBand: String(row.budget_band || ""),
        timeline: String(row.timeline || ""),
        needsFinance: Boolean(row.needs_finance),
        needsSubsidyHelp: Boolean(row.needs_subsidy_help),
        product: row.product_id
          ? idMaps.products.get(String(row.product_id))
          : undefined,
        source: (["WEBSITE_FORM","QUOTE_FLOW","WHATSAPP","PHONE","MACHINE_FINDER","SUBSIDY_CALC","EMI_CALC","SPEC_DOWNLOAD","REFERRAL","INDIAMART","OTHER"].includes(String(row.source))
          ? String(row.source)
          : "OTHER") as
          | "WEBSITE_FORM"
          | "QUOTE_FLOW"
          | "WHATSAPP"
          | "PHONE"
          | "MACHINE_FINDER"
          | "SUBSIDY_CALC"
          | "EMI_CALC"
          | "SPEC_DOWNLOAD"
          | "REFERRAL"
          | "INDIAMART"
          | "OTHER",
        sourcePage: String(row.source_page || ""),
        status: (["NEW","CONTACTED","QUALIFIED","QUOTED","NEGOTIATING","WON","LOST","SPAM"].includes(String(row.status))
          ? String(row.status)
          : "NEW") as
          | "NEW"
          | "CONTACTED"
          | "QUALIFIED"
          | "QUOTED"
          | "NEGOTIATING"
          | "WON"
          | "LOST"
          | "SPAM",
        quotedAmountPaise:
          row.quoted_amount_paise != null
            ? Number(row.quoted_amount_paise)
            : undefined,
        lostReason: String(row.lost_reason || ""),
      },
      overrideAccess: true,
    });
  }
  console.log(`leads: ${leads.length}`);

  await django.end();
  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
