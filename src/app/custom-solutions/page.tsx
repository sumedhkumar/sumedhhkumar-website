import type { Metadata } from "next";
import CustomSolutionsForm from "@/components/home/CustomSolutionsForm";

export const metadata: Metadata = {
  title: "Custom Solutions | Vyntegra",
  description:
    "Request a quotation for tailored websites, software systems, workflow automation, custom trading software, and AI-enabled solutions from Vyntegra.",
};

export default function CustomSolutionsPage() {
  return (
    <main className="custom-solutions-page">
      <CustomSolutionsForm />
    </main>
  );
}
