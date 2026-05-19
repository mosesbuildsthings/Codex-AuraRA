import { type FormEvent, useMemo, useState } from "react";
import { mbtiFromAnswers, zodiacFromBirthday } from "../lib/profile";
import { useAppState } from "../state/AppStateContext";

const enneagramOptions = [
  "Type 1 - Reformer",
  "Type 2 - Helper",
  "Type 3 - Achiever",
  "Type 4 - Individualist",
  "Type 5 - Investigator",
  "Type 6 - Loyalist",
  "Type 7 - Enthusiast",
  "Type 8 - Challenger",
  "Type 9 - Peacemaker",
];

export function ProfilePage() {
  const { data, dispatch } = useAppState();
  const [birthday, setBirthday] = useState(data.profile.birthday);
  const [mbtiAnswers, setMbtiAnswers] = useState<Array<"a" | "b">>(["a", "a", "a", "a"]);
  const [enneagram, setEnneagram] = useState(data.profile.enneagramType || enneagramOptions[0]);
  const [trustedFriendEmail, setTrustedFriendEmail] = useState("");

  const mbtiType = useMemo(() => mbtiFromAnswers(mbtiAnswers), [mbtiAnswers]);
  const zodiac = useMemo(() => zodiacFromBirthday(birthday), [birthday]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "update_profile",
      payload: {
        birthday,
        mbtiType,
        enneagramType: enneagram,
      },
    });
    window.alert("Profile insights saved.");
  }

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Profile and Personality</h2>
        <p>Capture communication style indicators used for compatibility sections in premium reports.</p>
      </article>

      <form className="surface stack" onSubmit={handleSave}>
        <label>
          Birthday
          <input type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
        </label>

        <p>
          Zodiac: <strong>{zodiac || "Not set"}</strong>
        </p>

        <fieldset className="stack">
          <legend>MBTI Mini Check</legend>

          <label>
            1. Energy source
            <select
              value={mbtiAnswers[0]}
              onChange={(event) => setMbtiAnswers((current) => [event.target.value as "a" | "b", current[1], current[2], current[3]])}
            >
              <option value="a">I recharge by talking and engaging</option>
              <option value="b">I recharge by quiet reflection</option>
            </select>
          </label>

          <label>
            2. Information style
            <select
              value={mbtiAnswers[1]}
              onChange={(event) => setMbtiAnswers((current) => [current[0], event.target.value as "a" | "b", current[2], current[3]])}
            >
              <option value="a">I focus on patterns and possibilities</option>
              <option value="b">I focus on concrete facts</option>
            </select>
          </label>

          <label>
            3. Decision style
            <select
              value={mbtiAnswers[2]}
              onChange={(event) => setMbtiAnswers((current) => [current[0], current[1], event.target.value as "a" | "b", current[3]])}
            >
              <option value="a">I prioritize logic and objectivity</option>
              <option value="b">I prioritize values and harmony</option>
            </select>
          </label>

          <label>
            4. Lifestyle style
            <select
              value={mbtiAnswers[3]}
              onChange={(event) => setMbtiAnswers((current) => [current[0], current[1], current[2], event.target.value as "a" | "b"])}
            >
              <option value="a">I prefer structure and planning</option>
              <option value="b">I prefer flexibility and improvisation</option>
            </select>
          </label>

          <p>
            MBTI Result: <strong>{mbtiType}</strong>
          </p>
        </fieldset>

        <label>
          Enneagram Type
          <select value={enneagram} onChange={(event) => setEnneagram(event.target.value)}>
            {enneagramOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="primary-button">
          Save Profile Insights
        </button>
      </form>

      <article className="surface stack">
        <h3>Trusted Friend Input</h3>
        <p>Invite a trusted friend to submit perspective on this relationship context.</p>
        <label>
          Friend Email
          <input
            type="email"
            value={trustedFriendEmail}
            onChange={(event) => setTrustedFriendEmail(event.target.value)}
            placeholder="friend@example.com"
          />
        </label>
        <button
          type="button"
          className="secondary-button"
          disabled={!trustedFriendEmail.trim()}
          onClick={() => {
            setTrustedFriendEmail("");
            window.alert("Friend invite request recorded.");
          }}
        >
          Request Outside Perspective
        </button>
      </article>
    </section>
  );
}

