"use client";

import { useEffect, useState } from "react";
import { CHANGELOG, CHANGELOG_VERSION, type ChangelogEntry } from "@/utils/changelog";

const LS_KEY = "pk_whats_new_seen";

interface UseWhatsNewReturn {
  open: boolean;
  dismiss: () => void;
  changelog: ChangelogEntry[];
  version: string;
}

export function useWhatsNew(): UseWhatsNewReturn {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(LS_KEY);
    if (seen !== CHANGELOG_VERSION) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, CHANGELOG_VERSION);
    setOpen(false);
  }

  return { open, dismiss, changelog: CHANGELOG, version: CHANGELOG_VERSION };
}
