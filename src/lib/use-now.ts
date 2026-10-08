"use client";

import { useEffect, useState } from "react";

/** Heure courante, rafraîchie régulièrement : le statut simulé d'une commande évolue tout seul. */
export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
