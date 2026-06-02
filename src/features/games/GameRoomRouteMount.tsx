import { GameRoomModule, type GameView } from "./GameRoomModule";
import { useAuth } from "@/lib/auth";

interface GameRoomRouteMountProps {
  initialView?: GameView;
}

export function GameRoomRouteMount({ initialView = "home" }: GameRoomRouteMountProps) {
  const { user, isGuest } = useAuth();

  return (
    <GameRoomModule
      initialView={initialView}
      currentUser={
        !isGuest && user
          ? {
              id: user.uid,
              userId: user.uid,
              displayName: user.name,
              username: user.handle,
              publicProfileUid: user.uid,
              avatarUrl: user.avatar,
            }
          : null
      }
    />
  );
}
