import { type FormEvent, useState } from "react";
import { relationshipStatuses } from "../data/constants";
import { useAppState } from "../state/AppStateContext";
import type { RelationshipProfile } from "../types";

export function RelationshipManagerPage() {
  const { data, dispatch } = useAppState();

  const [label, setLabel] = useState("");
  const [counterpart, setCounterpart] = useState("");
  const [status, setStatus] = useState<RelationshipProfile["status"]>("dating");
  const [notes, setNotes] = useState("");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;

    const next: RelationshipProfile = {
      id: crypto.randomUUID(),
      label: label.trim(),
      counterpart: counterpart.trim() || "Partner",
      status,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "add_relationship", payload: next });
    setLabel("");
    setCounterpart("");
    setStatus("dating");
    setNotes("");
  }

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Relationship Manager</h2>
        <p>Switch between partners, friends, or any relationship context you are working on.</p>
      </article>

      <article className="surface">
        <h3>Current Relationships</h3>
        <ul className="report-list stacked">
          {data.relationships.map((relationship) => (
            <li key={relationship.id}>
                <div>
                  <p className="report-title">{relationship.label}</p>
                  <small>
                    {relationship.counterpart} - {relationship.status.replaceAll("_", " ")}
                  </small>
                </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => dispatch({ type: "set_active_relationship", payload: relationship.id })}
              >
                {relationship.id === data.activeRelationshipId ? "Active" : "Set Active"}
              </button>
            </li>
          ))}
        </ul>
      </article>

      <article className="surface">
        <h3>Add Relationship</h3>
        <form className="stack" onSubmit={handleCreate}>
          <label>
            Relationship Label
            <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Example: Michelle" />
          </label>

          <label>
            Counterpart Name
            <input
              value={counterpart}
              onChange={(event) => setCounterpart(event.target.value)}
              placeholder="Partner or friend name"
            />
          </label>

          <label>
            Relationship Status
            <select value={status} onChange={(event) => setStatus(event.target.value as RelationshipProfile["status"])}>
              {relationshipStatuses.map((relationshipStatus) => (
                <option key={relationshipStatus.value} value={relationshipStatus.value}>
                  {relationshipStatus.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </label>

          <button type="submit" className="primary-button">
            Save Relationship
          </button>
        </form>
      </article>
    </section>
  );
}

