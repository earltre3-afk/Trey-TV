import React from "react";
import { useSaved } from "@/contexts/SavedContext";

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function usePlaylists() {
  const {
    savedPlaylists,
    createdPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    togglePlaylist,
    isPlaylistSaved,
  } = useSaved();

  return {
    savedPlaylists,
    createdPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    togglePlaylist,
    isPlaylistSaved,
  };
}
