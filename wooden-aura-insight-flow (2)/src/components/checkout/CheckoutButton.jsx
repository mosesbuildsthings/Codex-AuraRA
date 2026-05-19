import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CheckoutButton({ priceId, plan, children, variant = "default", size = "default" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Block checkout if running in iframe
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open Aura on your device to subscribe.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        priceId,
        plan,
      });

      if (response.data?.sessionId && response.data?.publishableKey) {
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
      } else {
        setError("Failed to initialize checkout session");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        variant={variant}
        size={size}
        className="rounded-full gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children || "Subscribe Now"}
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </>
  );
}