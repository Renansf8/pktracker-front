"use client";

import { useState, useEffect, useCallback } from "react";

const KEYS = {
  MONTHLY_GOAL: "pktracker:monthly-goal",
  ANNUAL_GOAL: "pktracker:annual-goal",
  MONTHLY_SNAPSHOT: "pktracker:monthly-snapshot",
  ANNUAL_SNAPSHOT: "pktracker:annual-snapshot",
  PREV_MONTH: "pktracker:prev-month-summary",
  PREV_YEAR: "pktracker:prev-year-summary",
} as const;

interface StoredMonthlyGoal {
  value: number;
  month: string; // "2026-04"
}

interface StoredAnnualGoal {
  value: number;
  year: number;
}

interface StoredMonthlySnapshot {
  month: string;
  profit: number;
}

interface StoredAnnualSnapshot {
  year: number;
  profit: number;
}

export interface PrevMonthSummary {
  month: string;
  goal: number;
  achieved: number;
  met: boolean;
}

export interface PrevYearSummary {
  year: number;
  goal: number;
  achieved: number;
  met: boolean;
}

export interface GoalsState {
  monthlyGoal: number | null;
  annualGoal: number | null;
  prevMonthSummary: PrevMonthSummary | null;
  prevYearSummary: PrevYearSummary | null;
  setMonthlyGoal: (value: number) => void;
  setAnnualGoal: (value: number) => void;
  clearMonthlyGoal: () => void;
  clearAnnualGoal: () => void;
}

function readLS<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getYear(): number {
  return new Date().getFullYear();
}

export function useGoals(
  monthlyProfitUsd: number,
  yearlyProfitUsd: number,
): GoalsState {
  const [monthlyGoal, setMonthlyGoalState] = useState<number | null>(null);
  const [annualGoal, setAnnualGoalState] = useState<number | null>(null);
  const [prevMonthSummary, setPrevMonthSummary] =
    useState<PrevMonthSummary | null>(null);
  const [prevYearSummary, setPrevYearSummary] =
    useState<PrevYearSummary | null>(null);

  useEffect(() => {
    const curMonth = getMonthKey();
    const curYear = getYear();

    const storedMonthly = readLS<StoredMonthlyGoal>(KEYS.MONTHLY_GOAL);
    if (storedMonthly) {
      if (storedMonthly.month === curMonth) {
        setMonthlyGoalState(storedMonthly.value);
      } else {
        const snap = readLS<StoredMonthlySnapshot>(KEYS.MONTHLY_SNAPSHOT);
        const achieved = snap?.month === storedMonthly.month ? snap.profit : 0;
        const summary: PrevMonthSummary = {
          month: storedMonthly.month,
          goal: storedMonthly.value,
          achieved,
          met: achieved >= storedMonthly.value,
        };
        writeLS(KEYS.PREV_MONTH, summary);
        localStorage.removeItem(KEYS.MONTHLY_GOAL);
        localStorage.removeItem(KEYS.MONTHLY_SNAPSHOT);
      }
    }

    const storedAnnual = readLS<StoredAnnualGoal>(KEYS.ANNUAL_GOAL);
    if (storedAnnual) {
      if (storedAnnual.year === curYear) {
        setAnnualGoalState(storedAnnual.value);
      } else {
        const snap = readLS<StoredAnnualSnapshot>(KEYS.ANNUAL_SNAPSHOT);
        const achieved = snap?.year === storedAnnual.year ? snap.profit : 0;
        const summary: PrevYearSummary = {
          year: storedAnnual.year,
          goal: storedAnnual.value,
          achieved,
          met: achieved >= storedAnnual.value,
        };
        writeLS(KEYS.PREV_YEAR, summary);
        localStorage.removeItem(KEYS.ANNUAL_GOAL);
        localStorage.removeItem(KEYS.ANNUAL_SNAPSHOT);
      }
    }

    const pm = readLS<PrevMonthSummary>(KEYS.PREV_MONTH);
    if (pm) setPrevMonthSummary(pm);

    const py = readLS<PrevYearSummary>(KEYS.PREV_YEAR);
    if (py) setPrevYearSummary(py);
  }, []);

  useEffect(() => {
    const curMonth = getMonthKey();
    const curYear = getYear();

    const storedMonthly = readLS<StoredMonthlyGoal>(KEYS.MONTHLY_GOAL);
    if (storedMonthly?.month === curMonth) {
      writeLS<StoredMonthlySnapshot>(KEYS.MONTHLY_SNAPSHOT, {
        month: curMonth,
        profit: monthlyProfitUsd,
      });
    }

    const storedAnnual = readLS<StoredAnnualGoal>(KEYS.ANNUAL_GOAL);
    if (storedAnnual?.year === curYear) {
      writeLS<StoredAnnualSnapshot>(KEYS.ANNUAL_SNAPSHOT, {
        year: curYear,
        profit: yearlyProfitUsd,
      });
    }
  }, [monthlyProfitUsd, yearlyProfitUsd]);

  const setMonthlyGoal = useCallback((value: number) => {
    const goal: StoredMonthlyGoal = { value, month: getMonthKey() };
    writeLS(KEYS.MONTHLY_GOAL, goal);
    setMonthlyGoalState(value);
  }, []);

  const setAnnualGoal = useCallback((value: number) => {
    const goal: StoredAnnualGoal = { value, year: getYear() };
    writeLS(KEYS.ANNUAL_GOAL, goal);
    setAnnualGoalState(value);
  }, []);

  const clearMonthlyGoal = useCallback(() => {
    localStorage.removeItem(KEYS.MONTHLY_GOAL);
    localStorage.removeItem(KEYS.MONTHLY_SNAPSHOT);
    setMonthlyGoalState(null);
  }, []);

  const clearAnnualGoal = useCallback(() => {
    localStorage.removeItem(KEYS.ANNUAL_GOAL);
    localStorage.removeItem(KEYS.ANNUAL_SNAPSHOT);
    setAnnualGoalState(null);
  }, []);

  return {
    monthlyGoal,
    annualGoal,
    prevMonthSummary,
    prevYearSummary,
    setMonthlyGoal,
    setAnnualGoal,
    clearMonthlyGoal,
    clearAnnualGoal,
  };
}
