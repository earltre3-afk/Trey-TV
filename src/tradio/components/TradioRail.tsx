import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

const TradioRail: React.FC<Props> = ({ title, children }) => {
  return (
    <section className="mb-6">
      <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
};

export default TradioRail;
