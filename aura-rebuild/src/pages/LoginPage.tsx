import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <section className="landing-screen">
      <header className="landing-nav">
        <img src="/brand/aura-logo-reverse-transparent.svg" alt="Aura" />
        <div className="button-row">
          <Link className="ghost-button" to="/onboarding">
            Log In
          </Link>
          <Link className="secondary-button" to="/onboarding">
            Sign Up
          </Link>
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
          <Link className="primary-button" to="/onboarding">
            New Session <ArrowRight size={16} />
          </Link>
          <Link className="secondary-button" to="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="secondary-button" to="/terms">
            Terms
          </Link>
        </div>
      </article>

      <article className="surface stack landing-form-card">
        <h3>How Aura Works</h3>
        <ul className="summary-list">
          <li>Start with onboarding and consent setup.</li>
          <li>Submit your relationship narrative and context.</li>
          <li>Track mood, insights, and sessions from your dashboard tools.</li>
        </ul>
        <div className="button-row">
          <Link className="primary-button" to="/onboarding">
            Continue to Onboarding
          </Link>
        </div>
      </article>

      <div className="legal-inline">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <span>|</span>
        <Link to="/terms">Terms</Link>
      </div>
    </section>
  );
}

