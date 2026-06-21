import type { Metadata } from "next";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Request a Consultation | Vyntegra",
  description: "Send a consultation enquiry to the Vyntegra team.",
};

export default async function ExpertCheckoutPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/experts/${slug}#booking-enquiry`);
}
