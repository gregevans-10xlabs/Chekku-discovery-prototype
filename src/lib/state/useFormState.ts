"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist arbitrary form state keyed to job + form + step, as required by the
 * offline-first spec. Survives app restarts, phone locks, etc.
 */
export function useFormState<T extends object>(
  key: string,
  initial: T,
): [T, (patch: Partial<T>) => void, () => void] {
  const storageKey = `chekku:form:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setValue({ ...initial, ...JSON.parse(raw) });
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {}
  }, [value, hydrated, storageKey]);

  const update = useCallback((patch: Partial<T>) => {
    setValue((v) => ({ ...v, ...patch }));
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return [value, update, clear];
}

/**
 * Step index persistence — the specific current step of a multi-step form.
 */
export function useStepState(key: string, initial = 0) {
  const storageKey = `chekku:step:${key}`;
  const [step, setStep] = useState<number>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) setStep(parseInt(raw, 10) || 0);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(step));
    } catch {}
  }, [step, storageKey]);

  return [step, setStep] as const;
}
