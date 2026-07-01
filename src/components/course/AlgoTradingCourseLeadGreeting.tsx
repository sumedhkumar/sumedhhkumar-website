"use client";

import { useSyncExternalStore } from "react";

type StoredLead = {
  fullName?: unknown;
};

type AlgoTradingCourseLeadGreetingProps = {
  email?: string;
  fullName?: string;
};

const storageKey = "vyntegra_algo_course_lead";

function subscribeToLeadStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function readStoredLeadName() {
  try {
    const storedLead = window.localStorage.getItem(storageKey);

    if (!storedLead) {
      return "";
    }

    const parsed = JSON.parse(storedLead) as StoredLead;

    return typeof parsed.fullName === "string" ? parsed.fullName.trim() : "";
  } catch {
    return "";
  }
}

function readServerLeadName() {
  return "";
}

export default function AlgoTradingCourseLeadGreeting({
  email = "",
  fullName = "",
}: AlgoTradingCourseLeadGreetingProps) {
  const storedFullName = useSyncExternalStore(
    subscribeToLeadStorage,
    readStoredLeadName,
    readServerLeadName,
  );
  const displayName = fullName.trim() || storedFullName;

  return (
    <p className="body-large algo-course-access-greeting">
      {displayName
        ? `Welcome, ${displayName}.`
        : email
          ? `Welcome, ${email}.`
          : "Welcome to the free access area."}
    </p>
  );
}
