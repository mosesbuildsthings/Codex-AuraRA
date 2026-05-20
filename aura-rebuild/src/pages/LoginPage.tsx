import { type FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useAppState();
  const nameRef = useRef<HTMLInputElement>(null);

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
    <section className="landing-screen">
      <header className="landing-nav">
        <img src="/brand/aura-logo-reverse-transparent.svg" alt="Aura" />
        <div className="button-row">
          <button
            type="button"
            className="ghost-button"
            onClick={() => nameRef.current?.focus()}
          >
            Log In
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => nameRef.current?.focus()}
          >
            Sign Up
          </button>
        </div>
      </header>

      <article className="surface landing-hero-card">
        <p className="eyebrow">AI-Powered Relationship Intelligence</p>
        <h2>A private, secure space to reflect on your relationship</h2>
        <p>
          Receive thoughtful, structured guidance from Aura while keeping your relationship narrative confidential and
          in your control.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={() => nameRef.current?.focus()}>
            New Session
          </button>
          <Link className="secondary-button" to="/privacy-policy">
            Privacy Policy
          </Link>
        </div>
      </article>

      <form className="surface stack landing-form-card" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            ref={nameRef}
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
          Begin Reflection
        </button>
      </form>

      <div className="legal-inline">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <span>|</span>
        <Link to="/terms">Terms</Link>
      </div>
    </section>
  );
}

