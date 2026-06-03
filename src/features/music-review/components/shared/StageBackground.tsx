import React from "react";

/** Floating stage-light ambient background */
export const StageBackground: React.FC = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[#05070D]" />
    <div
      className="absolute -top-32 -left-20 w-[60vw] h-[60vw] rounded-full opacity-30"
      style={{
        background: "radial-gradient(circle, rgba(0,183,255,0.35), transparent 60%)",
        filter: "blur(40px)",
      }}
    />
    <div
      className="absolute -bottom-40 -right-20 w-[55vw] h-[55vw] rounded-full opacity-25"
      style={{
        background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 60%)",
        filter: "blur(40px)",
      }}
    />
    <div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] opacity-10"
      style={{
        background: "radial-gradient(ellipse, rgba(255,200,87,0.25), transparent 70%)",
        filter: "blur(60px)",
      }}
    />
    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,183,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,183,255,0.6) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);
