"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Copy,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

type AccessStatus = "free_access" | "paid" | "blocked";
type PaymentStatus = "unpaid" | "paid" | "manual_verification";
type LoginProvider = "google" | "email_password";

type CourseRegistrationAdminRow = {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug: string;
  accessStatus: AccessStatus;
  paymentStatus: PaymentStatus;
  loginProvider: LoginProvider;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  lastLoginAt: string | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  ok?: boolean;
  message?: string;
  registrations?: CourseRegistrationAdminRow[];
  total?: number;
  limit?: number;
  offset?: number;
};

type PatchResponse = {
  ok?: boolean;
  message?: string;
  registration?: CourseRegistrationAdminRow;
};

type Filters = {
  search: string;
  accessStatus: "" | AccessStatus;
  paymentStatus: "" | PaymentStatus;
  loginProvider: "" | LoginProvider;
  courseSlug: string;
};

const tokenStorageKey = "vyntegra_admin_course_registrations_token";
const defaultLimit = 50;

/** On static Hostinger hosting the Next.js API routes don't exist.
 *  We fall back to the PHP proxy endpoint. */
function isStaticHosting() {
  return typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1');
}

function adminApiUrl(path: string, params?: Record<string, string>) {
  if (isStaticHosting()) {
    // Use PHP proxy
    const base = '/api/admin-registrations.php';
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return base + qs;
  }
  return path;
}

const initialFilters: Filters = {
  search: "",
  accessStatus: "",
  paymentStatus: "",
  loginProvider: "",
  courseSlug: "algo-trading",
};

const accessStatusLabels: Record<AccessStatus, string> = {
  free_access: "Free access",
  paid: "Paid access",
  blocked: "Blocked",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  manual_verification: "Manual verification",
};

const loginProviderLabels: Record<LoginProvider, string> = {
  google: "Google",
  email_password: "Email/password",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeWhatsappNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || !/^[+\d\s().-]+$/.test(trimmedValue)) {
    return "";
  }

  const digits = trimmedValue.replace(/\D/g, "");

  return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

function buildQuery(filters: Filters, offset: number) {
  const params = new URLSearchParams({
    limit: String(defaultLimit),
    offset: String(offset),
  });

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.accessStatus) {
    params.set("accessStatus", filters.accessStatus);
  }

  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.loginProvider) {
    params.set("loginProvider", filters.loginProvider);
  }

  if (filters.courseSlug.trim()) {
    params.set("courseSlug", filters.courseSlug.trim());
  }

  return params.toString();
}

function statusClass(value: string) {
  return `admin-course-status admin-course-status-${value.replace(/_/g, "-")}`;
}

export default function CourseRegistrationsAdmin() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [registrations, setRegistrations] = useState<
    CourseRegistrationAdminRow[]
  >([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const currentPage = Math.floor(offset / defaultLimit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / defaultLimit));
  const hasToken = Boolean(token);

  const totalsCopy = useMemo(() => {
    if (!hasToken || !lastRefreshedAt) {
      return "No data loaded";
    }

    return `${total} registrations`;
  }, [hasToken, lastRefreshedAt, total]);

  useEffect(() => {
    queueMicrotask(() => {
      const storedToken = window.sessionStorage.getItem(tokenStorageKey) ?? "";

      if (storedToken) {
        setToken(storedToken);
        setTokenInput(storedToken);
      }
    });
  }, []);

  function clearToken(message = "Admin token cleared.") {
    window.sessionStorage.removeItem(tokenStorageKey);
    setToken("");
    setTokenInput("");
    setRegistrations([]);
    setTotal(0);
    setOffset(0);
    setLastRefreshedAt(null);
    setError("");
    setNotice(message);
  }

  async function loadRegistrations(nextToken = token, nextOffset = offset) {
    if (!nextToken) {
      setError("Enter the admin token before loading registrations.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const url = isStaticHosting()
        ? adminApiUrl('/api/admin-registrations.php', { limit: String(defaultLimit), offset: String(nextOffset), ...Object.fromEntries(Object.entries({
            search: filters.search.trim() || undefined,
            accessStatus: filters.accessStatus || undefined,
            paymentStatus: filters.paymentStatus || undefined,
            loginProvider: filters.loginProvider || undefined,
            courseSlug: filters.courseSlug.trim() || undefined,
          }).filter(([, v]) => v !== undefined) as [string, string][])})
        : `/api/admin/course-registrations?${buildQuery(filters, nextOffset)}`;

      const response = await fetch(
        url,
        {
          headers: {
            Authorization: `Bearer ${nextToken}`,
          },
        },
      );
      const payload = (await response.json().catch(() => ({}))) as ListResponse;

      if (response.status === 401 || response.status === 403) {
        clearToken("Admin token was rejected. Enter a valid token.");
        return;
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.message ?? "Registrations could not be loaded.");
      }

      setRegistrations(payload.registrations ?? []);
      setTotal(payload.total ?? 0);
      setOffset(payload.offset ?? nextOffset);
      setLastRefreshedAt(new Date().toISOString());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Registrations could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  function submitToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      setError("Enter the admin token.");
      return;
    }

    window.sessionStorage.setItem(tokenStorageKey, trimmedToken);
    setToken(trimmedToken);
    setOffset(0);
    void loadRegistrations(trimmedToken, 0);
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    void loadRegistrations(token, 0);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setOffset(0);
  }

  async function patchRegistration(
    registration: CourseRegistrationAdminRow,
    input: Partial<{
      accessStatus: AccessStatus;
      paymentStatus: PaymentStatus;
    }>,
    actionLabel: string,
  ) {
    setPendingAction(`${registration.id}:${actionLabel}`);
    setError("");
    setNotice("");

    try {
      const patchUrl = isStaticHosting()
        ? `/api/admin-registrations.php?id=${encodeURIComponent(registration.id)}`
        : `/api/admin/course-registrations/${registration.id}`;

      const response = await fetch(
        patchUrl,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as PatchResponse;

      if (response.status === 401 || response.status === 403) {
        clearToken("Admin token was rejected. Enter a valid token.");
        return;
      }

      if (!response.ok || payload.ok === false || !payload.registration) {
        throw new Error(payload.message ?? "Registration could not be updated.");
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === payload.registration?.id ? payload.registration : item,
        ),
      );
      setNotice(`${registration.fullName || registration.email} updated.`);
      setLastRefreshedAt(new Date().toISOString());
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Registration could not be updated.",
      );
    } finally {
      setPendingAction("");
    }
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
      setError("");
    } catch {
      setError(`${label} could not be copied by this browser.`);
    }
  }

  function openWhatsapp(value: string) {
    const phone = normalizeWhatsappNumber(value);

    if (!phone) {
      setError("WhatsApp number is not valid for chat opening.");
      return;
    }

    window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
  }

  function goToPage(nextOffset: number) {
    const safeOffset = Math.max(0, nextOffset);
    setOffset(safeOffset);
    void loadRegistrations(token, safeOffset);
  }

  function renderRowActions(registration: CourseRegistrationAdminRow) {
    const actionId = (label: string) => `${registration.id}:${label}`;
    const isPending = (label: string) => pendingAction === actionId(label);
    const markUnpaidInput =
      registration.accessStatus === "blocked"
        ? { paymentStatus: "unpaid" as PaymentStatus }
        : {
            paymentStatus: "unpaid" as PaymentStatus,
            accessStatus: "free_access" as AccessStatus,
          };

    return (
      <div className="admin-course-actions" aria-label="Registration actions">
        <button
          type="button"
          onClick={() =>
            patchRegistration(
              registration,
              { paymentStatus: "paid", accessStatus: "paid" },
              "paid",
            )
          }
          disabled={Boolean(pendingAction)}
        >
          {isPending("paid") ? <Loader2 size={15} /> : <CheckCircle2 size={15} />}
          Mark paid
        </button>
        <button
          type="button"
          onClick={() =>
            patchRegistration(registration, markUnpaidInput, "unpaid")
          }
          disabled={Boolean(pendingAction)}
        >
          {isPending("unpaid") ? <Loader2 size={15} /> : <RotateCcw size={15} />}
          Mark unpaid
        </button>
        <button
          type="button"
          onClick={() =>
            patchRegistration(
              registration,
              { paymentStatus: "manual_verification" },
              "manual",
            )
          }
          disabled={Boolean(pendingAction)}
        >
          {isPending("manual") ? <Loader2 size={15} /> : <AlertTriangle size={15} />}
          Manual verification
        </button>
        <button
          type="button"
          onClick={() =>
            patchRegistration(
              registration,
              { accessStatus: "blocked" },
              "blocked",
            )
          }
          disabled={Boolean(pendingAction)}
        >
          {isPending("blocked") ? <Loader2 size={15} /> : <Ban size={15} />}
          Block access
        </button>
        <button
          type="button"
          onClick={() =>
            patchRegistration(
              registration,
              { accessStatus: "free_access" },
              "restore",
            )
          }
          disabled={Boolean(pendingAction)}
        >
          {isPending("restore") ? <Loader2 size={15} /> : <ShieldCheck size={15} />}
          Restore free access
        </button>
        <button
          type="button"
          onClick={() => copyValue(registration.email, "Email")}
        >
          <Copy size={15} />
          Copy email
        </button>
        <button
          type="button"
          onClick={() => copyValue(registration.whatsappNumber, "WhatsApp")}
        >
          <Copy size={15} />
          Copy WhatsApp
        </button>
        <button
          type="button"
          disabled={!normalizeWhatsappNumber(registration.whatsappNumber)}
          onClick={() => openWhatsapp(registration.whatsappNumber)}
        >
          <MessageCircle size={15} />
          Open WhatsApp
        </button>
      </div>
    );
  }

  return (
    <main className="admin-course-page">
      <section className="section admin-course-hero">
        <div className="container admin-course-shell">
          <div className="admin-course-header">
            <div>
              <p className="eyebrow">Internal Admin</p>
              <h1 className="section-title">Course registrations</h1>
              <p className="body-standard">
                Manage Vyntegra Trading Automation Masterclass registrations,
                access status, and manual payment status.
              </p>
            </div>
            <div className="admin-course-summary">
              <span>{totalsCopy}</span>
              <strong>
                {lastRefreshedAt
                  ? `Updated ${formatDate(lastRefreshedAt)}`
                  : "Awaiting load"}
              </strong>
            </div>
          </div>

          <form className="depth-panel admin-course-token-panel" onSubmit={submitToken}>
            <div>
              <label className="form-label" htmlFor="adminCourseToken">
                Admin token
              </label>
              <input
                id="adminCourseToken"
                className="form-control"
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                autoComplete="off"
                placeholder="Enter ADMIN_EXPORT_TOKEN"
              />
            </div>
            <div className="admin-course-token-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={16} /> : <ShieldCheck size={16} />}
                Load registrations
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => clearToken()}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </form>

          {hasToken ? (
            <form className="depth-panel admin-course-filter-panel" onSubmit={submitFilters}>
              <div className="admin-course-filter-grid">
                <div>
                  <label className="form-label" htmlFor="courseSearch">
                    Search
                  </label>
                  <div className="admin-course-search-control">
                    <Search size={16} aria-hidden="true" />
                    <input
                      id="courseSearch"
                      value={filters.search}
                      onChange={(event) =>
                        updateFilter("search", event.target.value)
                      }
                      placeholder="Name, email, WhatsApp"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="courseAccessStatus">
                    Access status
                  </label>
                  <select
                    id="courseAccessStatus"
                    className="form-control"
                    value={filters.accessStatus}
                    onChange={(event) =>
                      updateFilter(
                        "accessStatus",
                        event.target.value as Filters["accessStatus"],
                      )
                    }
                  >
                    <option value="">All access states</option>
                    <option value="free_access">Free access</option>
                    <option value="paid">Paid</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="coursePaymentStatus">
                    Payment status
                  </label>
                  <select
                    id="coursePaymentStatus"
                    className="form-control"
                    value={filters.paymentStatus}
                    onChange={(event) =>
                      updateFilter(
                        "paymentStatus",
                        event.target.value as Filters["paymentStatus"],
                      )
                    }
                  >
                    <option value="">All payment states</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="manual_verification">Manual verification</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="courseLoginProvider">
                    Login provider
                  </label>
                  <select
                    id="courseLoginProvider"
                    className="form-control"
                    value={filters.loginProvider}
                    onChange={(event) =>
                      updateFilter(
                        "loginProvider",
                        event.target.value as Filters["loginProvider"],
                      )
                    }
                  >
                    <option value="">All providers</option>
                    <option value="google">Google</option>
                    <option value="email_password">Email/password</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="courseSlug">
                    Course slug
                  </label>
                  <input
                    id="courseSlug"
                    className="form-control"
                    value={filters.courseSlug}
                    onChange={(event) =>
                      updateFilter("courseSlug", event.target.value)
                    }
                    placeholder="algo-trading"
                  />
                </div>
              </div>
              <div className="admin-course-filter-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} /> : <RefreshCcw size={16} />}
                  Load registrations
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            </form>
          ) : null}

          {error ? (
            <div className="admin-course-alert admin-course-alert-error" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          {notice ? (
            <div className="admin-course-alert admin-course-alert-success" role="status">
              <CheckCircle2 size={18} aria-hidden="true" />
              <p>{notice}</p>
            </div>
          ) : null}

          {hasToken ? (
            <section className="depth-panel admin-course-results-panel" aria-live="polite">
              <div className="admin-course-results-header">
                <div>
                  <p className="eyebrow">Registrations</p>
                  <h2 className="subsection-title">{total} total</h2>
                </div>
                <div className="admin-course-pagination">
                  <button
                    type="button"
                    onClick={() => goToPage(offset - defaultLimit)}
                    disabled={loading || offset === 0}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(offset + defaultLimit)}
                    disabled={loading || currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-course-loading">
                  <Loader2 size={22} aria-hidden="true" />
                  <span>Loading registrations...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="empty-state admin-course-empty-state">
                  <h3 className="card-title">No registrations found</h3>
                  <p className="body-compact">
                    Adjust filters or load again after new course signups arrive.
                  </p>
                </div>
              ) : (
                <>
                  <div className="admin-course-table-wrap">
                    <table className="admin-course-table">
                      <thead>
                        <tr>
                          <th>Registered</th>
                          <th>Student</th>
                          <th>WhatsApp</th>
                          <th>Provider</th>
                          <th>Access</th>
                          <th>Payment</th>
                          <th>Source</th>
                          <th>UTM</th>
                          <th>Last login</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((registration) => (
                          <tr key={registration.id}>
                            <td>{formatDate(registration.registeredAt)}</td>
                            <td>
                              <strong>{registration.fullName}</strong>
                              <span>{registration.email}</span>
                              <small>{registration.courseSlug}</small>
                            </td>
                            <td>{registration.whatsappNumber}</td>
                            <td>
                              {loginProviderLabels[registration.loginProvider]}
                            </td>
                            <td>
                              <span className={statusClass(registration.accessStatus)}>
                                {accessStatusLabels[registration.accessStatus]}
                              </span>
                            </td>
                            <td>
                              <span className={statusClass(registration.paymentStatus)}>
                                {paymentStatusLabels[registration.paymentStatus]}
                              </span>
                            </td>
                            <td>{registration.source || "None"}</td>
                            <td>
                              <span>{registration.utmSource || "None"}</span>
                              <small>{registration.utmMedium || "No medium"}</small>
                              <small>{registration.utmCampaign || "No campaign"}</small>
                            </td>
                            <td>{formatDate(registration.lastLoginAt)}</td>
                            <td>{renderRowActions(registration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-course-card-list">
                    {registrations.map((registration) => (
                      <article key={registration.id} className="standard-card admin-course-mobile-card">
                        <div>
                          <span className="algo-course-card-kicker">
                            {formatDate(registration.registeredAt)}
                          </span>
                          <h3 className="card-title">{registration.fullName}</h3>
                          <p className="body-compact">{registration.email}</p>
                          <p className="body-compact">{registration.whatsappNumber}</p>
                        </div>
                        <div className="admin-course-mobile-meta">
                          <span className={statusClass(registration.accessStatus)}>
                            {accessStatusLabels[registration.accessStatus]}
                          </span>
                          <span className={statusClass(registration.paymentStatus)}>
                            {paymentStatusLabels[registration.paymentStatus]}
                          </span>
                          <span>{loginProviderLabels[registration.loginProvider]}</span>
                          <span>{registration.courseSlug}</span>
                        </div>
                        <dl className="admin-course-mobile-details">
                          <div>
                            <dt>Source</dt>
                            <dd>{registration.source || "None"}</dd>
                          </div>
                          <div>
                            <dt>UTM</dt>
                            <dd>
                              {[registration.utmSource, registration.utmMedium, registration.utmCampaign]
                                .filter(Boolean)
                                .join(" / ") || "None"}
                            </dd>
                          </div>
                          <div>
                            <dt>Last login</dt>
                            <dd>{formatDate(registration.lastLoginAt)}</dd>
                          </div>
                        </dl>
                        {renderRowActions(registration)}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
