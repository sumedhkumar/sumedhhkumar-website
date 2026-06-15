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
      <header className="section section-bg-primary" style={{ paddingBottom: 0 }}>
        <div className="container">
          <h1 className="page-title">Custom Solutions</h1>
          <p className="body-large" style={{ marginTop: 16 }}>
            Custom software, trading systems, websites, dashboards, and automation tools built around your workflow.
          </p>
          <p className="body-standard" style={{ marginTop: 16 }}>
            Vyntegra builds custom solutions for users who need something beyond ready-made agents. This can include trading-related systems, platform-connected workflows, business websites, internal dashboards, automation tools, and custom software products.
          </p>
        </div>
      </header>
      <CustomSolutionsForm />
    </main>
  );
}
