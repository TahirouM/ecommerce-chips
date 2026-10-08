"use client";

import { useState } from "react";
import { errorMessage } from "./backend";

/** État d'un appel au backend : en cours, message d'erreur affichable, exécution. */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    setPending(true);
    setError(null);
    try {
      return await action();
    } catch (e) {
      setError(errorMessage(e));
      return undefined;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, setError, run };
}
