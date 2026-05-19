import { type FormEvent, useState } from "react";
import { useAppState } from "../state/AppStateContext";

export function FeedbackPage() {
  const { data, dispatch } = useAppState();
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    dispatch({
      type: "add_feedback",
      payload: {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        message: message.trim(),
      },
    });

    setMessage("");
  }

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Feature Suggestions</h2>
        <p>Send suggestions and ideas for future Aura updates.</p>
      </article>

      <form className="surface stack" onSubmit={handleSubmit}>
        <label>
          Suggestion
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="What should we improve next?"
          />
        </label>
        <button type="submit" className="primary-button" disabled={!message.trim()}>
          Save Suggestion
        </button>
      </form>

      <article className="surface">
        <h3>Saved Suggestions</h3>
        {data.feedback.length ? (
          <ul className="journal-list">
            {data.feedback.map((item) => (
              <li key={item.id}>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                <p>{item.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No suggestions submitted yet.</p>
        )}
      </article>
    </section>
  );
}

