import React, { useEffect, useState } from 'react';
import { ChevronLeft, ScrollText, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui';
import { LegalCategoryCard, LegalFooterLinks } from './LegalPrimitives';
import { LegalDocumentPage } from './LegalDocumentPage';
import { DeleteAccountRequest, LegalRequestForm } from './LegalRequestForms';
import { LEGAL_HOME_GROUPS, getLegalDocument } from './legalDocuments';
import { getLegalForm } from './legalForms';

/** A target is a document id, or `form:<formId>`. */
const isFormTarget = (target: string) => target.startsWith('form:');
const formIdOf = (target: string) => target.slice('form:'.length);

/**
 * TREY TV / TRADIO Legal & Operations Center.
 * Self-contained container that manages internal navigation between the home,
 * document pages, and request forms. Shell only needs a single `legal` view.
 */
export const LegalCenter: React.FC<{ initialTarget?: string; onExit: () => void }> = ({ initialTarget, onExit }) => {
  const [target, setTarget] = useState<string | null>(initialTarget ?? null);

  useEffect(() => {
    setTarget(initialTarget ?? null);
  }, [initialTarget]);

  const open = (next: string) => setTarget(next);
  const backToHome = () => setTarget(null);

  const Header = (
    <div className="flex items-center justify-between px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-3 sm:px-6 lg:px-10">
      <button onClick={target ? backToHome : onExit} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white hover:border-white/25 transition">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white/70">
        <ScrollText className="h-4 w-4 text-cyan-300" /> Legal & Operations
      </div>
      <div className="w-10" />
    </div>
  );

  let body: React.ReactNode;
  if (!target) {
    body = (
      <div className="space-y-6">
        <GlassCard glow className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
            <ShieldCheck className="h-4 w-4" /> Trust Center
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Legal & Operations Center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
            Policies, rights, and request forms for Trey TV and Tradio. Documents currently marked
            “Pending Legal Review” are placeholders and will be finalized by counsel before launch.
          </p>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LEGAL_HOME_GROUPS.map((group) => (
            <LegalCategoryCard key={group.id} group={group} onOpen={open} />
          ))}
        </div>

        <GlassCard className="p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Quick links</div>
          <LegalFooterLinks onOpen={open} />
        </GlassCard>
      </div>
    );
  } else if (isFormTarget(target)) {
    const formId = formIdOf(target);
    if (formId === 'delete-account') {
      body = <DeleteAccountRequest onBack={backToHome} onOpen={open} />;
    } else {
      const config = getLegalForm(formId);
      body = config
        ? <LegalRequestForm config={config} onBack={backToHome} onOpen={open} />
        : <GlassCard className="p-8 text-center text-white/60">Unknown form: {formId}</GlassCard>;
    }
  } else if (getLegalDocument(target)) {
    body = <LegalDocumentPage docId={target} onOpen={open} />;
  } else {
    body = <GlassCard className="p-8 text-center text-white/60">Unknown legal page: {target}</GlassCard>;
  }

  return (
    <div className="min-h-screen pb-16">
      {Header}
      <div className="px-4 sm:px-6 lg:px-10">{body}</div>
    </div>
  );
};

export default LegalCenter;
