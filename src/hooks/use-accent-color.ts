/**
 * use-accent-color.ts
 * Hook to apply user's profile accent color to the app shell
 * Uses CSS variables for scoped accent color application
 */

import { useEffect } from "react";
import { createBrowserClient } from "../lib/supabase-browser";

const DEFAULT_ACCENT = "#FFC857"; // Trey TV gold

// Convert hex to RGB for rgba operations
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function useAccentColor(userId?: string) {
  useEffect(() => {
    let mounted = true;

    async function loadAccentColor() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Not authenticated, use default
          if (mounted) {
            applyAccentColor(DEFAULT_ACCENT);
          }
          return;
        }

        // Load the user's profile accent color
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_accent_color")
          .eq("id", user.id)
          .single() as any;

        if (error || !data) {
          console.error("Error loading accent color:", error);
          if (mounted) {
            applyAccentColor(DEFAULT_ACCENT);
          }
          return;
        }

        const accentColor = data.profile_accent_color || DEFAULT_ACCENT;
        if (mounted) {
          applyAccentColor(accentColor);
        }
      } catch (error) {
        console.error("Error in useAccentColor:", error);
        if (mounted) {
          applyAccentColor(DEFAULT_ACCENT);
        }
      }
    }

    loadAccentColor();

    return () => {
      mounted = false;
    };
  }, [userId]);
}

export function applyAccentColor(hexColor: string) {
  const safeHex = isValidHexColor(hexColor) ? hexColor : DEFAULT_ACCENT;
  const rgb = hexToRgb(safeHex) || { r: 255, g: 200, b: 87 }; // Default to gold

  // Apply CSS variables to the root
  document.documentElement.style.setProperty("--profile-accent", safeHex);
  document.documentElement.style.setProperty("--profile-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

export function applyProfileAccentColor(hexColor: string, element: HTMLElement) {
  const safeHex = isValidHexColor(hexColor) ? hexColor : DEFAULT_ACCENT;
  const rgb = hexToRgb(safeHex) || { r: 255, g: 200, b: 87 };

  element.style.setProperty("--profile-accent", safeHex);
  element.style.setProperty("--profile-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

// Helper to validate hex color
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Predefined accent colors with hex values
export const ACCENT_COLORS = [
  { id: "gold", label: "Gold", hex: "#FFC857" },
  { id: "magenta", label: "Magenta", hex: "#FF006E" },
  { id: "cyan", label: "Cyan", hex: "#00B4D8" },
  { id: "purple", label: "Purple", hex: "#9D4EDD" },
  { id: "red", label: "Red", hex: "#FF4D4D" },
  { id: "orange", label: "Orange", hex: "#FF8C42" },
  { id: "green", label: "Green", hex: "#06D6A0" },
  { id: "blue", label: "Blue", hex: "#118AB2" },
  { id: "pink", label: "Pink", hex: "#FF5D8F" },
  { id: "teal", label: "Teal", hex: "#2EC4B6" },
] as const;
