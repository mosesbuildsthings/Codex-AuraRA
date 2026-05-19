import Stripe from 'npm:stripe@16.12.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { priceId, plan } = await req.json();

    if (!priceId) {
      return Response.json({ error: "Price ID is required" }, { status: 400 });
    }

    const successUrl = `${new URL(req.url).origin}/dashboard?checkout=success`;
    const cancelUrl = `${new URL(req.url).origin}/premium`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan: plan || "unknown",
      },
    });

    return Response.json({
      sessionId: session.id,
      publishableKey: publishableKey,
    });
  } catch (error) {
    console.error("Checkout session error:", error.message);
    return Response.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
});