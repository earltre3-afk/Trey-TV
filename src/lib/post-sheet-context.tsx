import React, { createContext, useContext, useState, ReactNode } from "react";

interface PostSheetContextType {
  isOpen: boolean;
  openPostSheet: () => void;
  closePostSheet: () => void;
}

const PostSheetContext = createContext<PostSheetContextType | undefined>(undefined);

export function PostSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPostSheet = () => setIsOpen(true);
  const closePostSheet = () => setIsOpen(false);

  return (
    <PostSheetContext.Provider value={{ isOpen, openPostSheet, closePostSheet }}>
      {children}
    </PostSheetContext.Provider>
  );
}

export function usePostSheet() {
  const context = useContext(PostSheetContext);
  if (!context) {
    throw new Error("usePostSheet must be used within PostSheetProvider");
  }
  return context;
}
