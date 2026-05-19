import { futureAdviceTypes } from "../data/constants";

export function AdviceTypesPage() {
  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Aura Future Advice Types</h2>
        <p>
          Roadmap categories that expand Aura beyond relationship intelligence while keeping trust-critical domains
          gated with clear safety language.
        </p>
      </article>

      <article className="surface">
        <ul className="summary-list columns">
          {futureAdviceTypes.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

