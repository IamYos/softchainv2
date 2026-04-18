"use client";

import { useReducer } from "react";

export type StepId =
  | "email"
  | "name"
  | "company"
  | "timezone"
  | "date"
  | "time"
  | "contactMethod"
  | "phone"
  | "topic"
  | "submit"
  | "confirmation";

export type ContactMethod = "whatsapp" | "zoom" | "meet" | "teams";

export type BookingData = {
  visitorEmail: string;
  visitorName: string;
  visitorCompany: string;
  visitorTimezone: string;
  selectedDate: string;        // "YYYY-MM-DD" in visitorTimezone
  startAtIso: string;          // UTC ISO of chosen slot
  contactMethod: ContactMethod | "";
  visitorPhone: string;
  topic: string;
};

export type SubmitResult = {
  bookingId: string;
  rescheduleUrl: string;
  cancelUrl: string;
  startUtc: string;
  endUtc: string;
};

export type State = {
  currentStep: StepId;
  completedSteps: StepId[];
  data: BookingData;
  stepError: string | null;
  isSubmitting: boolean;
  result: SubmitResult | null;
};

export type Action =
  | { type: "setField"; field: keyof BookingData; value: string }
  | { type: "advance" }
  | { type: "back" }
  | { type: "edit"; step: StepId }
  | { type: "submitStart" }
  | { type: "submitSuccess"; result: SubmitResult }
  | { type: "submitError"; message: string };

export const initialState: State = {
  currentStep: "email",
  completedSteps: [],
  data: {
    visitorEmail: "",
    visitorName: "",
    visitorCompany: "",
    visitorTimezone: "",
    selectedDate: "",
    startAtIso: "",
    contactMethod: "",
    visitorPhone: "",
    topic: "",
  },
  stepError: null,
  isSubmitting: false,
  result: null,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{6,14}$/;

// Next-step resolver. Skips `phone` unless contactMethod is whatsapp.
function nextStep(current: StepId, data: BookingData): StepId | null {
  const order: StepId[] = [
    "email", "name", "company", "timezone",
    "date", "time", "contactMethod", "phone", "topic", "submit",
  ];
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  let next = order[idx + 1];
  if (next === "phone" && data.contactMethod !== "whatsapp") {
    next = order[idx + 2];
  }
  return next;
}

function validateStep(step: StepId, data: BookingData): string | null {
  switch (step) {
    case "email":
      return EMAIL_RE.test(data.visitorEmail.trim()) ? null : "Enter a valid email.";
    case "name":
      return data.visitorName.trim().length >= 2 ? null : "Name must be at least 2 characters.";
    case "company":
      return null; // optional
    case "timezone":
      return data.visitorTimezone.length > 0 ? null : "Pick a timezone.";
    case "date":
      return data.selectedDate.length > 0 ? null : "Pick a date.";
    case "time":
      return data.startAtIso.length > 0 ? null : "Pick a time slot.";
    case "contactMethod":
      return data.contactMethod !== "" ? null : "Pick how we'll talk.";
    case "phone":
      return E164_RE.test(data.visitorPhone.trim())
        ? null
        : "Phone must be international format (e.g. +14155551212).";
    case "topic":
      return data.topic.trim().length >= 10 ? null : "Tell us a bit more — at least 10 characters.";
    default:
      return null;
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setField":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        stepError: null,
      };

    case "advance": {
      const err = validateStep(state.currentStep, state.data);
      if (err) return { ...state, stepError: err };
      const next = nextStep(state.currentStep, state.data);
      if (!next) return state;
      return {
        ...state,
        currentStep: next,
        completedSteps: state.completedSteps.includes(state.currentStep)
          ? state.completedSteps
          : [...state.completedSteps, state.currentStep],
        stepError: null,
      };
    }

    case "back": {
      if (state.completedSteps.length === 0) return state;
      const prev = state.completedSteps[state.completedSteps.length - 1];
      return {
        ...state,
        currentStep: prev,
        completedSteps: state.completedSteps.slice(0, -1),
        stepError: null,
      };
    }

    case "edit": {
      const targetIdx = state.completedSteps.indexOf(action.step);
      if (targetIdx < 0) return state;
      return {
        ...state,
        currentStep: action.step,
        completedSteps: state.completedSteps.slice(0, targetIdx),
        stepError: null,
      };
    }

    case "submitStart":
      return { ...state, isSubmitting: true, stepError: null };

    case "submitSuccess":
      return {
        ...state,
        currentStep: "confirmation",
        isSubmitting: false,
        result: action.result,
        stepError: null,
      };

    case "submitError":
      return { ...state, isSubmitting: false, stepError: action.message };

    default:
      return state;
  }
}

export function useBookingState() {
  return useReducer(reducer, initialState);
}
