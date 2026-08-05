"use client";

import { useEffect, useState } from "react";
import AlgoTradingCourseAccess from "@/components/course/AlgoTradingCourseAccess";

export default function AlgoTradingCourseProtectedAccessPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    let foundEmail = "";
    let foundName = "";

    cookies.forEach(cookie => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      if (key === 'vyn_user_email') foundEmail = decodeURIComponent(value);
      if (key === 'vyn_user_name') foundName = decodeURIComponent(value);
    });

    if (!foundEmail) {
      window.location.assign("/courses/algo-trading");
    } else {
      setEmail(foundEmail);
      setName(foundName);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading your course access...</div>;
  }

  return (
    <AlgoTradingCourseAccess
      registrationEmail={email}
      registrationFullName={name}
      initialProgress={[]}
    />
  );
}
