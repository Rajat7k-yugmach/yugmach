type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Renders JSON-LD as a script tag for crawlers. */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
