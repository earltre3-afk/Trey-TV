import React, { useState } from "react";
import { CHARACTERS_BY_ID, CHARACTERS_BY_KEY, CHARACTER_PHOTO_MAP } from "../lib/storyData";

export interface CharacterAvatarLike {
  id?: string;
  mapKey?: string;
  name: string;
  image?: string;
  fallbackImage?: string;
}

interface CharacterAvatarProps {
  /** Pass either a character object directly, or look one up by id / relationshipKey. */
  character?: CharacterAvatarLike;
  characterId?: string;
  relationshipKey?: string;
  className?: string;
  /** When true, lifts the focal point slightly to the face for tight circular crops. */
  faceCrop?: boolean;
  alt?: string;
}

/**
 * Single source of truth for rendering character portraits.
 *
 * Switch Kicks characters resolve through CHARACTER_PHOTO_MAP[mapKey].image.
 * Installed .ttstory characters can bring their own portrait URL and will fall
 * back to character.image when they are not part of the built-in map.
 */
export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  characterId,
  relationshipKey,
  className = "",
  faceCrop = false,
  alt,
}) => {
  const resolved =
    character ||
    (characterId ? CHARACTERS_BY_ID[characterId] : undefined) ||
    (relationshipKey ? CHARACTERS_BY_KEY[relationshipKey] : undefined);

  const [errored, setErrored] = useState(false);

  if (!resolved) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 text-white/40 ${className}`}>
        <span className="text-xs">?</span>
      </div>
    );
  }

  const mapped = resolved.mapKey ? CHARACTER_PHOTO_MAP[resolved.mapKey]?.image : undefined;
  const primary = mapped || resolved.image || resolved.fallbackImage;
  const fallback = resolved.fallbackImage || mapped || resolved.image || "/placeholder.svg";
  const src = !errored ? primary : fallback;

  return (
    <img
      src={src}
      alt={alt || resolved.name}
      onError={() => setErrored(true)}
      className={`h-full w-full object-cover ${faceCrop ? "object-[center_35%]" : "object-center"} ${className}`}
      draggable={false}
    />
  );
};
