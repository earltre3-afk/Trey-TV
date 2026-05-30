import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { G as GameRoomModule } from "./GameRoomModule-B9ywzUMa.mjs";
import { b as useAuth$1 } from "./router-BtgGywEC.mjs";
function GameRoomRouteMount({ initialView = "home" }) {
  const { user, isGuest } = useAuth$1();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    GameRoomModule,
    {
      initialView,
      currentUser: !isGuest && user ? {
        id: user.uid,
        userId: user.uid,
        displayName: user.name,
        username: user.handle,
        publicProfileUid: user.uid,
        avatarUrl: user.avatar
      } : null
    }
  );
}
export {
  GameRoomRouteMount as G
};
