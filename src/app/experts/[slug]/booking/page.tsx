import { redirect } from "next/navigation";
import { experts } from "@/data/experts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export default async function ExpertBookingPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/experts/${slug}/checkout`);
}
