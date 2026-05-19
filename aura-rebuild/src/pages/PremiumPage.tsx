import { PREMIUM_PRICE, premiumFeatures } from "../data/constants";
import { useAppState } from "../state/AppStateContext";

export function PremiumPage() {
  const { data, dispatch } = useAppState();

  const isPremium = data.plan === "premium";

  return (
    <section className="stack-lg">
      <article className="surface">
        <p className="eyebrow">Aura Premium</p>
        <h2>${PREMIUM_PRICE}/month</h2>
        <p>Unlock full reports, partner collaboration, PDF export, and deeper analysis intelligence.</p>

        <button
          type="button"
          className="primary-button"
          onClick={() => dispatch({ type: "set_plan", payload: isPremium ? "free" : "premium" })}
        >
          {isPremium ? "Switch To Free" : "Activate Premium"}
        </button>
      </article>

      <article className="surface">
        <h3>Included Features</h3>
        <ul className="summary-list">
          {premiumFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

