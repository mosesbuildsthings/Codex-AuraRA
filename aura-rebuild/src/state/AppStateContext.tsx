/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { SESSION_MINUTES } from "../data/constants";
import { createDefaultData, loadData, persistData } from "../lib/storage";
import type {
  AppData,
  FeedbackItem,
  JournalEntry,
  PersonalityProfile,
  RelationshipProfile,
  ReportSummary,
  UserSession,
} from "../types";

type Action =
  | { type: "login"; payload: { name: string; email: string } }
  | { type: "logout" }
  | { type: "refresh_session" }
  | { type: "set_plan"; payload: AppData["plan"] }
  | { type: "add_relationship"; payload: RelationshipProfile }
  | { type: "update_relationship"; payload: RelationshipProfile }
  | { type: "set_active_relationship"; payload: string }
  | { type: "add_report"; payload: ReportSummary }
  | { type: "update_report_notes"; payload: { id: string; notes: string } }
  | { type: "add_journal"; payload: JournalEntry }
  | { type: "add_feedback"; payload: FeedbackItem }
  | { type: "update_profile"; payload: PersonalityProfile };

interface ContextValue {
  data: AppData;
  dispatch: Dispatch<Action>;
}

const AppStateContext = createContext<ContextValue | undefined>(undefined);

function makeSession(name: string, email: string): UserSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MINUTES * 60_000);
  return {
    id: crypto.randomUUID(),
    name,
    email,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "login":
      return {
        ...state,
        session: makeSession(action.payload.name, action.payload.email),
      };
    case "logout":
      return {
        ...state,
        session: null,
      };
    case "refresh_session": {
      if (!state.session) return state;
      return {
        ...state,
        session: makeSession(state.session.name, state.session.email),
      };
    }
    case "set_plan":
      return {
        ...state,
        plan: action.payload,
      };
    case "add_relationship":
      return {
        ...state,
        relationships: [action.payload, ...state.relationships],
        activeRelationshipId: action.payload.id,
      };
    case "update_relationship":
      return {
        ...state,
        relationships: state.relationships.map((relationship) =>
          relationship.id === action.payload.id ? action.payload : relationship,
        ),
      };
    case "set_active_relationship":
      return {
        ...state,
        activeRelationshipId: action.payload,
      };
    case "add_report":
      return {
        ...state,
        reports: [action.payload, ...state.reports],
      };
    case "update_report_notes":
      return {
        ...state,
        reports: state.reports.map((report) =>
          report.id === action.payload.id ? { ...report, notes: action.payload.notes } : report,
        ),
      };
    case "add_journal":
      return {
        ...state,
        journal: [action.payload, ...state.journal],
      };
    case "add_feedback":
      return {
        ...state,
        feedback: [action.payload, ...state.feedback],
      };
    case "update_profile":
      return {
        ...state,
        profile: action.payload,
      };
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }): ReactNode {
  const [data, dispatch] = useReducer(reducer, undefined, () => {
    if (typeof window === "undefined") {
      return createDefaultData();
    }
    return loadData();
  });

  useEffect(() => {
    persistData(data);
  }, [data]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!data.session) return;
      const expired = new Date(data.session.expiresAt).getTime() <= Date.now();
      if (expired) {
        dispatch({ type: "logout" });
      }
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [data.session]);

  const value = useMemo(
    () => ({
      data,
      dispatch,
    }),
    [data],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): ContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}

