import React from "react";
import QRCode from "react-qr-code";
import { TranceShell } from "../components/shell";
import { encodeHandoffToken } from "./handoffToken";

interface QRMobileHandoffGateProps {
  routineId: string;
}

const BASE_URL = "https://tv.treytrizzy.com";

export function QRMobileHandoffGate({ routineId }: QRMobileHandoffGateProps) {
  const token = React.useMemo(() => encodeHandoffToken(routineId), [routineId]);
  const url = `${BASE_URL}/trance/session/${encodeURIComponent(routineId)}/practice?handoff=${token}`;

  return (
    <TranceShell hideNav>
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
            Mobile Required
          </div>
          <h1 className="text-2xl font-black text-white uppercase leading-tight">
            Continue Practice<br />on Mobile
          </h1>
          <p className="text-sm text-white/60 max-w-xs mx-auto">
            Trance uses your phone's camera for movement tracking. Scan the code below with your
            phone to continue.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_0_40px_-4px_rgba(217,70,239,0.4)]">
          <QRCode
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0a0012"
            level="M"
          />
        </div>

        <p className="text-xs text-white/40 max-w-xs">
          Make sure you're logged in on your phone.
        </p>
      </div>
    </TranceShell>
  );
}
