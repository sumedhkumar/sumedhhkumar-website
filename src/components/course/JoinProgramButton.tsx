"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import CoursePaymentPopup from "@/components/course/CoursePaymentPopup";

export default function JoinProgramButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Button 
        variant="primary" 
        className="algo-course-upgrade-btn"
        onClick={() => setIsPopupOpen(true)}
      >
        Join Program
        <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
      </Button>
      <CoursePaymentPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
}
