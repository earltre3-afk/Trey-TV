import React from "react";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "../../lib/storyData";
import { TreyTVLogo } from "../TreyTVLogo";

interface Props {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onEnter }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
    <img src={IMAGES.twinsCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

    <div className="relative z-10 px-8 text-center">
      <div className="mb-6 flex justify-center">
        <TreyTVLogo size={72} glow />
      </div>
      <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl">
        Stories
        <br />
        you don't just read —
      </h1>
      <p className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-amber-400">
        you live.
      </p>
      <p className="mt-6 max-w-xs mx-auto font-serif text-base italic text-white/80">
        Every choice changes the story. Every branch ends differently.
      </p>

      <button
        onClick={onEnter}
        className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-display text-sm font-black uppercase tracking-widest text-black shadow-2xl transition-transform active:scale-95"
      >
        Enter the Library <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);
