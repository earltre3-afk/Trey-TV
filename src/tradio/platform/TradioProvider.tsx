import React from "react";
import { AppProvider } from "@/contexts/AppContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { SavedProvider } from "@/contexts/SavedContext";
import { SongWarsProvider } from "@/contexts/SongWarsContext";
import { TradioDataProvider } from "@/contexts/TradioDataContext";
import { TradioIdentityProvider } from "@/tradio/contexts/TradioIdentityContext";

export function TradioProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SavedProvider>
        <PlaylistProvider>
          <TradioDataProvider>
            <SongWarsProvider>
              <TradioIdentityProvider>{children}</TradioIdentityProvider>
            </SongWarsProvider>
          </TradioDataProvider>
        </PlaylistProvider>
      </SavedProvider>
    </AppProvider>
  );
}
