export function PrivacyPolicyPage() {
  return (
    <section className="surface stack-lg legal-copy">
      <h2>Privacy Policy</h2>
      <p>Effective Date: May 19, 2026</p>
      <p>
        Aura is designed to keep relationship reflections private. Narrative entries, encrypted evidence metadata, and
        generated reports remain in your local app storage by default unless you explicitly share them.
      </p>

      <h3>Data We Process</h3>
      <ul>
        <li>Account session metadata (name, email, session expiration)</li>
        <li>Narratives, context details, and report outputs</li>
        <li>Encrypted evidence payloads uploaded to your locker</li>
        <li>Optional personality profile fields (MBTI, Enneagram, Zodiac inputs)</li>
      </ul>

      <h3>How We Protect Data</h3>
      <ul>
        <li>Evidence files are encrypted in-browser before storage.</li>
        <li>Session timeout logs users out automatically after inactivity.</li>
        <li>No personal data is sold.</li>
      </ul>

      <h3>Your Controls</h3>
      <ul>
        <li>You can delete local browser storage at any time.</li>
        <li>You can choose what to share and when to share it.</li>
        <li>You can opt out by not uploading evidence files.</li>
      </ul>

      <h3>Safety Notice</h3>
      <p>
        Aura provides informational guidance and is not a substitute for licensed legal, medical, or mental health
        professionals.
      </p>
    </section>
  );
}

