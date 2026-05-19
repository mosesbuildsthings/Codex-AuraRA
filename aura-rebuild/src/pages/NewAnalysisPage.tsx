import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { challengeOptions, relationshipStatuses } from "../data/constants";
import { buildReport, deriveAutofill } from "../lib/analysisEngine";
import { encryptEvidence } from "../lib/crypto";
import { useAppState } from "../state/AppStateContext";
import type { AdviceVoice, AnalysisFormInput, ChallengeKey, EvidenceItem } from "../types";

function defaultVoice(plan: "free" | "premium"): AdviceVoice {
  return plan === "premium" ? "both" : "fatherly";
}

export function NewAnalysisPage() {
  const navigate = useNavigate();
  const { data, dispatch } = useAppState();

  const activeRelationship =
    data.relationships.find((relationship) => relationship.id === data.activeRelationshipId) ??
    data.relationships[0];

  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [context, setContext] = useState("");
  const [coreQuestion, setCoreQuestion] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState(activeRelationship?.status ?? "dating");
  const [challengeOtherText, setChallengeOtherText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<AdviceVoice>(defaultVoice(data.plan));
  const [challenges, setChallenges] = useState<ChallengeKey[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [contextTouched, setContextTouched] = useState(false);
  const [questionTouched, setQuestionTouched] = useState(false);

  function handleNarrativeChange(value: string) {
    setNarrative(value);
    if (!value.trim()) return;

    const autofill = deriveAutofill(value);
    if (!contextTouched) {
      setContext(autofill.context);
    }
    if (!questionTouched) {
      setCoreQuestion(autofill.coreQuestion);
    }
    if (!challenges.length) {
      setChallenges(autofill.challenges);
    }
  }

  const canSubmit = useMemo(() => {
    return Boolean(narrative.trim() && context.trim() && coreQuestion.trim() && !isEncrypting);
  }, [narrative, context, coreQuestion, isEncrypting]);

  function toggleChallenge(challenge: ChallengeKey) {
    setChallenges((current) => {
      if (current.includes(challenge)) {
        return current.filter((item) => item !== challenge);
      }
      return [...current, challenge];
    });
  }

  async function handleEvidenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsEncrypting(true);

    try {
      const next: EvidenceItem[] = [];

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          setProcessingMessage(`${file.name} skipped (max size is 10MB).`);
          continue;
        }

        const buffer = await file.arrayBuffer();
        const encrypted = await encryptEvidence(buffer);
        next.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          bytes: file.size,
          ivB64: encrypted.ivB64,
          cipherB64: encrypted.cipherB64,
          addedAt: new Date().toISOString(),
        });
      }

      setEvidence((current) => [...current, ...next]);
      if (next.length) {
        setProcessingMessage(`${next.length} evidence file(s) encrypted and stored securely.`);
      }
    } catch {
      setProcessingMessage("Evidence encryption failed. Please try again.");
    } finally {
      setIsEncrypting(false);
      event.target.value = "";
    }
  }

  function removeEvidence(id: string) {
    setEvidence((current) => current.filter((item) => item.id !== id));
  }

  function onVoiceChange(next: AdviceVoice) {
    if (next === "both" && data.plan === "free") {
      window.alert("Both voices is a premium feature. Upgrade to unlock it.");
      return;
    }
    setSelectedVoice(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRelationship || !canSubmit) return;

    const input: AnalysisFormInput = {
      relationshipId: activeRelationship.id,
      title: title.trim(),
      narrative: narrative.trim(),
      context: context.trim(),
      coreQuestion: coreQuestion.trim(),
      relationshipStatus,
      challenges,
      challengeOtherText: challengeOtherText.trim(),
      selectedVoice,
      includeFullReport: data.plan === "premium",
      evidence,
    };

    const report = buildReport(input, activeRelationship.label, data.plan, data.profile);
    dispatch({ type: "add_report", payload: report });
    dispatch({ type: "refresh_session" });

    navigate(`/report/${report.id}`);
  }

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>New Analysis</h2>
        <p>
          Enter your narrative first. Aura auto-fills context and core question, and you can edit everything before
          generating a report.
        </p>
      </article>

      <form className="stack-lg" onSubmit={handleSubmit}>
        <article className="surface stack">
          <label>
            Session Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: April communication breakdown"
            />
          </label>

          <label>
            Narrative
            <textarea
              value={narrative}
              onChange={(event) => handleNarrativeChange(event.target.value)}
              rows={8}
              placeholder="Describe the situation in detail..."
            />
          </label>
        </article>

        <article className="surface stack">
          <h3>Context and Core Question</h3>

          <label>
            Relationship Status
            <select value={relationshipStatus} onChange={(event) => setRelationshipStatus(event.target.value as typeof relationshipStatus)}>
              {relationshipStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend>Primary Challenges</legend>
            <div className="challenge-grid">
              {challengeOptions.map((option) => (
                <label key={option.key} className="option-pill">
                  <input
                    type="checkbox"
                    checked={challenges.includes(option.key)}
                    onChange={() => toggleChallenge(option.key)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {challenges.includes("other") ? (
            <label>
              Other Challenge Details
              <input
                value={challengeOtherText}
                onChange={(event) => setChallengeOtherText(event.target.value)}
                placeholder="Describe the custom challenge"
              />
            </label>
          ) : null}

          <label>
            Contextual Factors
            <textarea
              value={context}
              onChange={(event) => {
                setContextTouched(true);
                setContext(event.target.value);
              }}
              rows={4}
            />
          </label>

          <label>
            Core Question
            <textarea
              value={coreQuestion}
              onChange={(event) => {
                setQuestionTouched(true);
                setCoreQuestion(event.target.value);
              }}
              rows={3}
            />
          </label>
        </article>

        <article className="surface stack">
          <h3>Evidence Locker</h3>
          <p>Files are encrypted in-browser before being stored.</p>

          <input type="file" multiple onChange={handleEvidenceUpload} accept="image/*,video/*,.pdf,.txt" />

          {isEncrypting ? <p className="inline-status">Encrypting evidence...</p> : null}
          {processingMessage ? <p className="inline-status">{processingMessage}</p> : null}

          {evidence.length ? (
            <ul className="evidence-list">
              {evidence.map((item) => (
                <li key={item.id}>
                  <div>
                    <p>{item.fileName}</p>
                    <small>{Math.ceil(item.bytes / 1024)} KB encrypted</small>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => removeEvidence(item.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="surface stack">
          <h3>Advice Voice</h3>
          <div className="option-group">
            <label>
              <input
                type="radio"
                name="voice"
                checked={selectedVoice === "fatherly"}
                onChange={() => onVoiceChange("fatherly")}
              />
              Fatherly Advice
            </label>
            <label>
              <input
                type="radio"
                name="voice"
                checked={selectedVoice === "motherly"}
                onChange={() => onVoiceChange("motherly")}
              />
              Motherly Advice
            </label>
            <label>
              <input
                type="radio"
                name="voice"
                checked={selectedVoice === "both"}
                onChange={() => onVoiceChange("both")}
              />
              Both (Premium)
            </label>
          </div>
        </article>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            Generate Report
          </button>
        </div>
      </form>
    </section>
  );
}

