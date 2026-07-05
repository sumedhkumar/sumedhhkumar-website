"use client";

import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { algoTradingCourse } from "@/data/algo-trading-course";

type AlgoTradingCourseAccessLogoutProps = {
  email?: string;
};

const courseLogoutHref = `/auth/logout?next=${encodeURIComponent(algoTradingCourse.registerRoute)}`;

export default function AlgoTradingCourseAccessLogout({
  email = "",
}: AlgoTradingCourseAccessLogoutProps) {
  return (
    <div className="algo-course-access-logout-panel">
      <p>
        You are logged in{email ? ` as ${email}` : ""}.
      </p>
      <Button
        href={courseLogoutHref}
        variant="secondary"
        className="algo-course-access-logout-button"
      >
        <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
        Log out
      </Button>
    </div>
  );
}
