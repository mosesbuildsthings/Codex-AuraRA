import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppState } from "../state/AppStateContext";

interface OnboardingFormValues {
  name: string;
  email: string;
  narrativeConsent: boolean;
  evidenceConsent: boolean;
  mediaConsent: boolean;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { dispatch } = useAppState();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OnboardingFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      narrativeConsent: false,
      evidenceConsent: false,
      mediaConsent: false,
    },
  });

  function onSubmit(values: OnboardingFormValues) {
    if (!values.narrativeConsent || !values.evidenceConsent || !values.mediaConsent) {
      toast.error("Please accept all consent items to continue.");
      return;
    }

    dispatch({
      type: "login",
      payload: {
        name: values.name.trim(),
        email: values.email.trim(),
      },
    });

    toast.success("Secure session started.");
    navigate("/dashboard");
  }

  return (
    <section className="stack-lg">
      <article className="surface landing-hero-card">
        <p className="eyebrow">Onboarding</p>
        <h2>New user setup flow</h2>
        <p>
          This setup collects basic identity and consent before you start relationship analysis.
        </p>
      </article>

      <form className="surface stack" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Name
          <input
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Use at least 2 characters",
              },
            })}
            placeholder="Your name"
            autoComplete="name"
          />
          {errors.name ? <small>{errors.name.message}</small> : null}
        </label>

        <label>
          Email
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>

        <div className="consent-grid">
          <label>
            <input type="checkbox" {...register("narrativeConsent", { required: true })} />
            Narrative analysis consent
          </label>

          <label>
            <input type="checkbox" {...register("evidenceConsent", { required: true })} />
            Evidence locker processing consent
          </label>

          <label>
            <input type="checkbox" {...register("mediaConsent", { required: true })} />
            Media interpretation consent
          </label>
        </div>

        <div className="button-row wrap">
          <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
            Begin Reflection
          </button>
          <Link className="secondary-button" to="/">
            Back to Landing
          </Link>
        </div>
      </form>
    </section>
  );
}
