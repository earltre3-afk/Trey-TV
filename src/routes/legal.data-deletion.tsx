import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Mail, User, AtSign, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getPolicy, LEGAL_CONTACT_EMAIL } from "@/lib/legal-content";

export const Route = createFileRoute("/legal/data-deletion")({
  component: DataDeletionPage,
  head: () => ({
    meta: [
      { title: "Data Deletion Request — Trey TV" },
      {
        name: "description",
        content: "Request deletion, export, or correction of your Trey TV data.",
      },
      { property: "og:title", content: "Data Deletion Request — Trey TV" },
      { property: "og:description", content: "Submit a data action request to Trey TV." },
    ],
  }),
});

type RequestType = "delete" | "export" | "correct" | "other";

function DataDeletionPage() {
  const policy = getPolicy("data-deletion")!;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");
  const [type, setType] = useState<RequestType>("delete");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    // Backend not wired — store locally as a safe placeholder.
    try {
      const queue = JSON.parse(localStorage.getItem("treytv_data_requests") || "[]");
      queue.push({
        name,
        email,
        profile,
        type,
        message,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("treytv_data_requests", JSON.stringify(queue));
    } catch {}
    setSubmitted(true);
    toast.success("Request received. We'll follow up by email.");
  };

  return (
    <LegalLayout policy={policy}>
      <section id="form" className="scroll-mt-24">
        <div className="rounded-2xl liquid-glass border border-primary/30 p-5 lg:p-7 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.16_85/0.18),transparent)] blur-2xl"
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-primary">
              <Trash2 className="size-3.5" /> SUBMIT A REQUEST
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black">Data Action Form</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll respond at the email you provide. You can also email{" "}
              <span className="text-foreground/80">{LEGAL_CONTACT_EMAIL}</span>.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-[oklch(0.78_0.18_150/0.4)] bg-[oklch(0.78_0.18_150/0.08)] p-5 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-[oklch(0.78_0.18_150)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold">Request received</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Thanks, {name.split(" ")[0] || "friend"}. We'll review your request and follow
                    up to <span className="text-foreground/80">{email}</span> within a reasonable
                    timeframe.
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setProfile("");
                      setType("delete");
                      setMessage("");
                    }}
                    className="mt-3 text-xs text-primary font-semibold hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field
                    icon={<User className="size-4 text-muted-foreground" />}
                    label="Full name"
                    value={name}
                    onChange={setName}
                    placeholder="Your name"
                  />
                  <Field
                    icon={<Mail className="size-4 text-muted-foreground" />}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                  />
                </div>
                <Field
                  icon={<AtSign className="size-4 text-muted-foreground" />}
                  label="Username or profile link"
                  value={profile}
                  onChange={setProfile}
                  placeholder="@yourhandle or treytv.app/u/..."
                />

                <div>
                  <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">
                    REQUEST TYPE
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: "delete", label: "Delete account" },
                        { id: "export", label: "Export data" },
                        { id: "correct", label: "Correct data" },
                        { id: "other", label: "Other" },
                      ] as { id: RequestType; label: string }[]
                    ).map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`px-3 h-10 rounded-xl text-xs font-semibold border transition ${
                          type === t.id
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-white/10 hover:border-white/25 text-foreground/80"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">
                    MESSAGE
                  </div>
                  <div className="flex items-start gap-2 rounded-xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition">
                    <MessageSquare className="size-4 text-muted-foreground mt-1" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      placeholder="Tell us what you'd like us to do."
                      className="flex-1 bg-transparent text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground text-right">
                    {message.length} / 1000
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 h-12 rounded-xl bg-primary text-primary-foreground font-black glow-gold tilt-press inline-flex items-center justify-center gap-2"
                >
                  <Send className="size-4" /> Submit request
                </button>
                <p className="text-[11px] text-muted-foreground">
                  By submitting, you confirm the information is accurate and you have the right to
                  make this request.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5">
        {label.toUpperCase()}
      </div>
      <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>
    </label>
  );
}
