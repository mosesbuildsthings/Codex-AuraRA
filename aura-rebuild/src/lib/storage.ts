import type { AppData, RelationshipProfile } from "../types";

const STORAGE_KEY = "aura_rebuild_app_data_v1";

function createDefaultRelationship(): RelationshipProfile {
  return {
    id: crypto.randomUUID(),
    label: "Primary Relationship",
    counterpart: "Partner",
    status: "dating",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

export function createDefaultData(): AppData {
  const relationship = createDefaultRelationship();
  return {
    plan: "free",
    session: null,
    relationships: [relationship],
    activeRelationshipId: relationship.id,
    reports: [],
    journal: [],
    feedback: [],
    profile: {
      birthday: "",
      mbtiType: "",
      enneagramType: "",
    },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultData();
    }

    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.relationships?.length) {
      return createDefaultData();
    }

    return {
      ...createDefaultData(),
      ...parsed,
      relationships: parsed.relationships,
      activeRelationshipId:
        parsed.activeRelationshipId || parsed.relationships[0]?.id || createDefaultData().activeRelationshipId,
    };
  } catch {
    return createDefaultData();
  }
}

export function persistData(next: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

