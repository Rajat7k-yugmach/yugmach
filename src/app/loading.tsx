import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";

export default function Loading() {
  return (
    <main className="pb-24 md:pb-0">
      <PageLoadingSkeleton />
    </main>
  );
}
