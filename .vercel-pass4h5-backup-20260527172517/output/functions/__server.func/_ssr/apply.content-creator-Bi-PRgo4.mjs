import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as ApplicationWizardChrome, W as WizardNav, d as CreatorPassport, F as Field, N as NeonInput, T as TileChoice, b as NeonTextarea, a as NeonSelect, C as ChipPicker, c as NeonCheckList } from "./CreatorPassport-D1PggdfN.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { bw as FileCheckCorner, r as ChevronRight, U as User, bd as AtSign, h as Mail, be as MapPin, a5 as Users, cp as Briefcase, cq as Building2, aC as PenLine, bg as Instagram, bi as Youtube, G as Globe, bU as Twitter, ao as Pencil, O as Search, bb as CircleQuestionMark, l as ShieldCheck, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const STEPS = ["Identity", "Channel", "Content Style", "Launch Plan", "Standards", "Review"];
const CATEGORIES = ["Podcast / Talk", "Music", "Lifestyle", "Comedy", "Sports", "Gaming", "Education", "News", "Film / TV", "Other"];
const ACK_LABELS = ["I understand Trey TV is curated and creator approval is not automatic.", "I will only upload content I own or have rights to use.", "I will not upload hateful, exploitative, illegal, or dangerous content.", "I understand Trey TV may remove content that violates platform rules.", "I understand fake engagement, impersonation, and stolen content can lead to denial or removal.", "I understand approval as a creator does not guarantee fame, monetization, payment, or promotion."];
const EMPTY = {
  displayName: "",
  handle: "",
  email: "",
  location: "",
  applicantType: "individual",
  bio: "",
  social: {
    tiktok: "",
    instagram: "",
    youtube: "",
    website: "",
    x: ""
  },
  channelName: "",
  category: "",
  pitch: "",
  description: "",
  audience: "",
  whyTreyTV: "",
  differentiation: "",
  formats: [],
  videoLength: "",
  frequency: "",
  hasContent: "yes",
  sampleLinks: ["", "", ""],
  tools: [],
  rights: "yes",
  firstShow: "",
  episode1: "",
  episode2: "",
  schedule: "",
  promotion: "",
  acks: [false, false, false, false, false, false],
  applicantMessage: ""
};
function ContentCreatorApplication() {
  const {
    isGuest,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = reactExports.useState(false);
  const [data, setData] = reactExports.useState(EMPTY);
  const [step, setStep] = reactExports.useState(1);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [savedFlash, setSavedFlash] = reactExports.useState(false);
  const [submitted, setSubmitted] = reactExports.useState(false);
  const [appId, setAppId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => setAuthSettled(true), 200);
    return () => window.clearTimeout(timer);
  }, []);
  reactExports.useEffect(() => {
    if (authSettled && isGuest) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/content-creator");
      } catch {
      }
      navigate({
        to: "/login"
      });
    }
  }, [authSettled, isGuest, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      displayName: prev.displayName || user.name || "",
      handle: prev.handle || (user.handle ? `@${user.handle}` : ""),
      location: prev.location || user.location || "",
      bio: prev.bio || user.bio || "",
      social: {
        ...prev.social,
        instagram: prev.social.instagram || user.socialInstagram || "",
        tiktok: prev.social.tiktok || user.socialTikTok || "",
        youtube: prev.social.youtube || user.socialYouTube || "",
        website: prev.social.website || user.link || ""
      }
    }));
  }, [user?.uid]);
  const update = (patch) => setData((prev) => ({
    ...prev,
    ...patch
  }));
  const next = () => {
    const err = validate(step, data);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const save = async (status) => {
    const {
      data: auth
    } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in with your Trey TV account before submitting.");
    const payload = buildCreatorPayload(data, authUserId, status);
    if (appId) {
      const {
        error: error2
      } = await supabase.from("creator_applications").update(payload).eq("id", appId);
      if (error2) throw error2;
      return appId;
    }
    const {
      data: row,
      error
    } = await supabase.from("creator_applications").insert(payload).select("id").single();
    if (error) throw error;
    setAppId(row.id);
    return row.id;
  };
  const handleDraft = async () => {
    try {
      await save("draft");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
      toast.success("Draft saved.");
    } catch (error) {
      toast.error(error?.message ?? "Could not save draft.");
    }
  };
  const submit = async () => {
    const err = validate(6, data);
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      await save("pending");
      setSubmitted(true);
    } catch (error) {
      toast.error(error?.message ?? "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };
  if (!authSettled || isGuest) return null;
  if (submitted) return /* @__PURE__ */ jsxRuntimeExports.jsx(PendingSuccess, { kind: "creator" });
  const titleStr = ["Your Identity", "Your Channel", "Your Content Style", "Your Launch Plan", "Community Standards", "Review & Submit"][step - 1];
  const [titleA, ...rest] = titleStr.split(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ApplicationWizardChrome, { variant: "creator", titleA, titleB: rest.join(" "), steps: STEPS.map((label) => ({
    label
  })), current: step, onSaveDraft: handleDraft, draftSaved: savedFlash, sectionTitle: titleStr, sectionSubtitle: ["Tell us who you are.", "What channel are you building?", "What type of content will you create?", "Define your first show, schedule, and promotion plan.", "Agree to our guidelines.", "Review your application before submitting."][step - 1], side: /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorPassport, { variant: "creator", displayName: data.displayName, handle: data.handle, location: data.location, uid: user?.uid || "TRTV-PENDING", step, totalSteps: STEPS.length, avatarUrl: user?.avatar }), children: [
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepIdentity, { data, update }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepChannel, { data, update }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { data, update }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepLaunch, { data, update }),
    step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepStandards, { data, update }),
    step === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepReview, { data, jumpTo: setStep }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WizardNav, { variant: "creator", onBack: back, backDisabled: step === 1, onNext: step === STEPS.length ? submit : next, submitting, nextLabel: step === STEPS.length ? "Submit Creator Application" : "Next Step" })
  ] });
}
function StepIdentity({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Display Name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.displayName, onChange: (e) => update({
        displayName: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Username / Handle", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.handle, onChange: (e) => update({
        handle: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AtSign, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { type: "email", value: data.email, onChange: (e) => update({
        email: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Location (City / State)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.location, onChange: (e) => update({
        location: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "I am applying as", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TileChoice, { value: data.applicantType, onChange: (v) => update({
      applicantType: v
    }), options: [{
      value: "individual",
      label: "Individual Creator",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" })
    }, {
      value: "duo",
      label: "Duo / Group",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" })
    }, {
      value: "brand",
      label: "Brand / Business",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-5 w-5" })
    }, {
      value: "org",
      label: "Organization",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5" })
    }] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Short Bio", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.bio, onChange: (e) => update({
      bio: e.target.value
    }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Social Links", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: "TikTok", value: data.social.tiktok, onChange: (e) => update({
        social: {
          ...data.social,
          tiktok: e.target.value
        }
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "♪" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: "Instagram", value: data.social.instagram, onChange: (e) => update({
        social: {
          ...data.social,
          instagram: e.target.value
        }
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: "YouTube", value: data.social.youtube, onChange: (e) => update({
        social: {
          ...data.social,
          youtube: e.target.value
        }
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: "Website", value: data.social.website, onChange: (e) => update({
        social: {
          ...data.social,
          website: e.target.value
        }
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: "X/Twitter", value: data.social.x, onChange: (e) => update({
        social: {
          ...data.social,
          x: e.target.value
        }
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "h-4 w-4" }) })
    ] }) })
  ] });
}
function StepChannel({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Proposed Channel Name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.channelName, onChange: (e) => update({
        channelName: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Channel Category", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonSelect, { value: data.category, onChange: (e) => update({
        category: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a category" }),
        CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, className: "bg-background", children: c }, c))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "One-sentence channel pitch", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.pitch, onChange: (e) => update({
      pitch: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full Channel Description", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.description, onChange: (e) => update({
      description: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Who is your audience?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.audience, onChange: (e) => update({
        audience: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Why does this belong on Trey TV?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.whyTreyTV, onChange: (e) => update({
        whyTreyTV: e.target.value
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What makes you different?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.differentiation, onChange: (e) => update({
      differentiation: e.target.value
    }) }) })
  ] });
}
function StepContent({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Content formats", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipPicker, { multi: true, value: data.formats, onChange: (v) => update({
      formats: v
    }), options: ["Episodes", "Shorts / Clips", "Interviews", "Behind the Scenes", "Skits", "Reviews / Reactions", "Tutorials", "Live-style Premieres"].map((label) => ({
      value: label,
      label
    })) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Average video length", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonSelect, { value: data.videoLength, onChange: (e) => update({
        videoLength: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select length" }),
        ["Under 5 min", "5-10 min", "10-20 min", "20-40 min", "40+ min"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-background", children: x }, x))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "How often can you post?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonSelect, { value: data.frequency, onChange: (e) => update({
        frequency: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select frequency" }),
        ["Daily", "Multiple per week", "Weekly", "Bi-weekly", "Monthly"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-background", children: x }, x))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Upload sample work (links accepted)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: data.sampleLinks.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: `Video Link ${i + 1}`, value: l, onChange: (e) => {
      const next = [...data.sampleLinks];
      next[i] = e.target.value;
      update({
        sampleLinks: next
      });
    } }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tools you use", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipPicker, { multi: true, value: data.tools, onChange: (v) => update({
      tools: v
    }), options: ["Phone", "Camera", "CapCut", "Final Cut", "Premiere", "Canva", "Other"].map((label) => ({
      value: label,
      label
    })) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Do you own or have permission for your content, music, footage, and images?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipPicker, { value: data.rights, onChange: (v) => update({
      rights: v
    }), options: [{
      value: "yes",
      label: "Yes, I do"
    }, {
      value: "some",
      label: "I have some permissions"
    }, {
      value: "no",
      label: "No / Not sure"
    }] }) })
  ] });
}
function StepLaunch({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "First show name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.firstShow, onChange: (e) => update({
      firstShow: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode 1 title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.episode1, onChange: (e) => update({
        episode1: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode 2 title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.episode2, onChange: (e) => update({
        episode2: e.target.value
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Publishing schedule", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.schedule, onChange: (e) => update({
      schedule: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "How will you promote your channel?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.promotion, onChange: (e) => update({
      promotion: e.target.value
    }) }) })
  ] });
}
function StepStandards({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonCheckList, { items: ACK_LABELS, value: data.acks, onToggle: (i) => {
      const next = [...data.acks];
      next[i] = !next[i];
      update({
        acks: next
      });
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Anything else we should know? (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.applicantMessage, onChange: (e) => update({
      applicantMessage: e.target.value
    }) }) })
  ] });
}
function StepReview({
  data,
  jumpTo
}) {
  const sections = reactExports.useMemo(() => [1, 2, 3, 4, 5].map((n) => ({
    n,
    title: ["Your Identity", "Your Channel", "Your Content Style", "Your Launch Plan", "Community Standards"][n - 1]
  })), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-circle is-done", children: s.n }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 font-semibold", children: s.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => jumpTo(s.n), className: "btn-ghost-glass inline-flex items-center gap-2 px-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        " Edit"
      ] })
    ] }, s.n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-semibold", children: "Application Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Channel Name", v: data.channelName || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Category", v: data.category || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Upload Frequency", v: data.frequency || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "First Show", v: data.firstShow || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Sample Links", v: `${data.sampleLinks.filter(Boolean).length} links added` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Rights Confirmation", v: data.rights === "yes" ? "Yes" : data.rights === "some" ? "Partial" : "No" })
      ] })
    ] })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 border-b border-white/5 py-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right text-foreground", children: v })
  ] });
}
const PIPELINE_STAGES = [{
  key: "Submitted",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-5 w-5" })
}, {
  key: "Under Review",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5" })
}, {
  key: "More Info",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-5 w-5" })
}, {
  key: "Approved",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5" })
}, {
  key: "Denied",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
}];
function StatusPipeline({
  current
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start gap-1", children: PIPELINE_STAGES.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center", children: [
      i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pipeline-line" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pipeline-icon mx-auto ${s.key === current ? "is-current" : ""}`, children: s.icon }),
      i < PIPELINE_STAGES.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pipeline-line" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 text-center text-[10px] leading-tight sm:text-xs ${s.key === current ? "font-semibold text-[oklch(0.92_0.18_88)]" : "text-muted-foreground"}`, children: s.key })
  ] }, s.key)) }) });
}
function PendingSuccess({
  kind: _kind
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-scroll-page liquid-stage min-h-screen min-h-[100dvh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-veil", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "orb-extra", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl px-4 py-8 lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative neon-blue p-6 md:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "swoosh-bg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float h-14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-8 inline-flex h-28 w-28 items-center justify-center rounded-3xl", style: {
          boxShadow: "inset 0 0 0 2px oklch(0.85 0.2 240 / 0.95), 0 0 60px oklch(0.65 0.3 245 / 0.6)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-14 w-14 text-[oklch(0.85_0.2_240)] drop-shadow-[0_0_16px_oklch(0.7_0.3_245/0.8)]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-semibold leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Your Creator " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title-split-blue", children: "Application" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: " Is In!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-sm text-sm text-muted-foreground", children: "We received your channel application. You can check the status from your profile." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 w-full space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/applications", className: "neon-btn-blue w-full py-4 text-base", children: [
            "View Application Status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "neon-btn-gold w-full py-4 text-base", children: [
            "Back to Trey TV ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPipeline, { current: "Submitted" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden min-h-screen lg:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex w-[42%] flex-col items-center justify-center overflow-hidden px-16 xl:w-[38%]", style: {
        background: "radial-gradient(120% 80% at 50% 30%, oklch(0.55 0.28 245 / 0.18), transparent 65%),radial-gradient(80% 60% at 80% 80%, oklch(0.65 0.22 300 / 0.12), transparent 60%),oklch(0.07 0.025 262 / 0.95)",
        borderRight: "1px solid oklch(1 0 0 / 0.06)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 flex h-48 w-48 items-center justify-center rounded-[2.5rem]", style: {
          background: "linear-gradient(135deg, oklch(0.14 0.06 252 / 0.9), oklch(0.08 0.03 262 / 0.9))",
          boxShadow: "inset 0 0 0 2px oklch(0.85 0.2 240 / 0.6), 0 0 80px oklch(0.65 0.3 245 / 0.35), 0 0 0 1px oklch(0.55 0.25 245 / 0.25)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-24 w-24 text-[oklch(0.85_0.2_240)]", style: {
          filter: "drop-shadow(0 0 20px oklch(0.7 0.3 245 / 0.75))"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.65_0.22_245)]", children: "What Happens Next" }),
          ["Your application enters our review queue", "Our team reviews your channel concept", "You'll be notified of the decision", "Approved creators get onboarded"].map((txt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[oklch(0.85_0.2_240)]", style: {
              boxShadow: "inset 0 0 0 1px oklch(0.65 0.22 245 / 0.6), 0 0 10px oklch(0.6 0.3 245 / 0.2)"
            }, children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: txt })
          ] }, txt))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col items-center justify-center px-16 xl:px-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float mb-8 h-16" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-semibold leading-tight xl:text-5xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Your Creator " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title-split-blue", children: "Application" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: " Is In!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base text-muted-foreground", children: "We received your channel application. Our team will review it and get back to you." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/applications", className: "neon-btn-blue w-full py-4 text-base", children: [
            "View Application Status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "neon-btn-gold w-full py-4 text-base", children: [
            "Back to Trey TV ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPipeline, { current: "Submitted" })
      ] }) })
    ] })
  ] });
}
function validate(step, data) {
  if (step === 1 && (!data.displayName.trim() || !data.handle.trim() || !data.bio.trim())) return "Display name, handle, and bio are required.";
  if (step === 2 && (!data.channelName.trim() || !data.category || !data.pitch.trim() || !data.description.trim() || !data.audience.trim() || !data.whyTreyTV.trim())) return "Complete the required channel details.";
  if (step === 3 && (data.formats.length === 0 || !data.frequency || data.rights === "no")) return "Choose formats, posting frequency, and confirm rights.";
  if (step === 4 && (!data.firstShow.trim() || !data.schedule.trim() || !data.promotion.trim())) return "First show, schedule, and promotion plan are required.";
  if (step === 5 && !data.acks.every(Boolean)) return "Please accept all community standards.";
  return null;
}
function buildCreatorPayload(data, userId, status) {
  return {
    user_id: userId,
    application_type: "creator",
    status,
    creator_name: data.displayName,
    channel_handle: data.handle.replace(/^@/, ""),
    location: data.location,
    channel_name: data.channelName,
    niche: data.category,
    bio: data.description || data.bio,
    content_formats: data.formats,
    posting_frequency: data.frequency,
    target_audience: data.audience,
    first_content_idea: [data.firstShow, data.episode1, data.episode2].filter(Boolean).join(" | "),
    release_timeline: data.schedule,
    reason: JSON.stringify({
      applicantType: data.applicantType,
      pitch: data.pitch,
      whyTreyTV: data.whyTreyTV,
      differentiation: data.differentiation,
      videoLength: data.videoLength,
      hasContent: data.hasContent,
      sampleLinks: data.sampleLinks.filter(Boolean),
      tools: data.tools,
      rights: data.rights,
      promotion: data.promotion,
      social: data.social,
      applicantMessage: data.applicantMessage,
      email: data.email
    }),
    agreed_to_standards: data.acks.every(Boolean) && data.rights !== "no",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
export {
  ContentCreatorApplication as component
};
