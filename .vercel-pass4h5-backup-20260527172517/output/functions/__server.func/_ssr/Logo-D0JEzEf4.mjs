import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
function Logo({ className = "h-9" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src: treyTvLogo,
      alt: "Trey TV",
      draggable: false,
      className: `${className} aspect-square object-contain drop-shadow-[0_0_18px_rgba(244,194,74,0.45)]`
    }
  );
}
export {
  Logo as L
};
