import type { Metadata } from "next";
import CourseRegistrationsAdmin from "@/components/admin/CourseRegistrationsAdmin";

export const metadata: Metadata = {
  title: "Course Registrations Admin | Vyntegra",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CourseRegistrationsAdminPage() {
  return <CourseRegistrationsAdmin />;
}
