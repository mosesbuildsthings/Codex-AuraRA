import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useAppState();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consents, setConsents] = useState({
    narrative: false,
    evidence: false,
    media: false,
  });

  const canContinue = name.trim() && email.trim() && Object.values(consents).every(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    dispatch({ type: "login", payload: { name: name.trim(), email: email.trim() } });
    navigate("/dashboard");
  }

  return (
    <section className="surface hero-panel">
      <p className="eyebrow">Private. Structured. Secure.</p>
      <h2>Aura Relationship Intelligence</h2>
      <p>
        A confidential space for narrative analysis, evidence-aware context, and action-focused guidance.
      </p>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <div className="consent-grid">
          <label>
            <input
              type="checkbox"
              checked={consents.narrative}
              onChange={(event) =>
                setConsents((current) => ({ ...current, narrative: event.target.checked }))
              }
            />
            Narrative analysis consent
          </label>

          <label>
            <input
              type="checkbox"
              checked={consents.evidence}
              onChange={(event) =>
                setConsents((current) => ({ ...current, evidence: event.target.checked }))
              }
            />
            Evidence locker processing consent
          </label>

          <label>
            <input
              type="checkbox"
              checked={consents.media}
              onChange={(event) =>
                setConsents((current) => ({ ...current, media: event.target.checked }))
              }
            />
            Media interpretation consent
          </label>
        </div>

        <button type="submit" className="primary-button" disabled={!canContinue}>
          Start Secure Session
        </button>
      </form>

      <div className="legal-inline">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </section>
  );
}

