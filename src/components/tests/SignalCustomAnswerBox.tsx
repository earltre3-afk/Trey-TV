import React from "react";
import { Check, Pencil } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  active: boolean;
  maxLength?: number;
  minLength?: number;
}

const SignalCustomAnswerBox: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  active,
  maxLength = 300,
  minLength = 8,
}) => {
  const valid = value.trim().length >= minLength;
  return (
    <div
      className={`relative rounded-2xl p-[1.5px] transition ${
        active
          ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 shadow-[0_0_30px_-5px_rgba(217,70,239,0.55)]"
          : disabled
            ? "bg-white/5 opacity-50"
            : "bg-white/10"
      }`}
    >
      <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl px-4 py-3 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-fuchsia-400" />
            <span className="text-[11px] tracking-[0.2em] text-fuchsia-300 font-semibold">
              CUSTOM ANSWER MODE
            </span>
          </div>
          {active && (
            <span className="text-[10px] tracking-widest px-2 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30">
              ACTIVE
            </span>
          )}
        </div>
        <textarea
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder="I'd do something else…"
          rows={3}
          className="w-full bg-transparent text-white placeholder-slate-500 outline-none resize-none text-base leading-relaxed disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between mt-1 text-xs">
          <div className="flex items-center gap-1.5">
            {active && valid && (
              <>
                <Check className="w-4 h-4 text-cyan-300" />
                <span className="text-cyan-300">Custom response selected</span>
              </>
            )}
            {active && !valid && <span className="text-slate-500">Min {minLength} characters</span>}
          </div>
          <span className={`${value.length > 0 ? "text-cyan-300" : "text-slate-500"}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignalCustomAnswerBox;
