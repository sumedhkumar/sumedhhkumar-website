import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Consultation Confirmed | Vyntegra",
  description: "Review consultation confirmation details.",
};

export default async function ExpertConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert) {
    notFound();
  }

  const token = typeof query.token === "string" ? query.token : "";

  if (!token) {
    return (
      <main className="listing-page">
        <div className="listing-container">
          <EmptyState
            heading="Booking access unavailable."
            copy="Complete a verified consultation payment before selecting a slot."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="listing-page">
      <div className="listing-container">
        <EmptyState
          heading="Confirmation details are pending."
          copy="Please contact Vyntegra support with your payment confirmation."
        />
      </div>
    </main>
  );
}
