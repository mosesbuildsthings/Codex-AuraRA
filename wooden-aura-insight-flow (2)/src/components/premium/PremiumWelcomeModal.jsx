import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Heart, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "Your trust means the world to us. Welcome back to Aura Premium — where love gets the attention it deserves.",
  "We're so grateful you're here. Aura Premium exists because people like you believe that relationships are worth investing in.",
  "Thank you for your continued support. Every session you complete helps us build a better, more loving world.",
  "Welcome back. Your Premium membership helps us keep this space safe, thoughtful, and growing — thank you deeply.",
  "You chose to invest in your relationship. That alone speaks volumes. Thank you for trusting Aura with your heart.",
];

export default function PremiumWelcomeModal({ user }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const isPremium = user.role === "premium" || user.role === "admin";
    if (!isPremium) return;

    // Show once per session
    const sessionKey = `aura_premium_welcome_${user.email}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      setTimeout(() => setOpen(true), 800);
    }
  }, [user]);

  const message = user ? MESSAGES[Math.floor(user.email?.charCodeAt(0) % MESSAGES.length)] : MESSAGES[0];
  const firstName = user?.full_name?.split(" ")[0] || "friend";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden">
              {/* Gold gradient top strip */}
              <div className="h-1.5 bg-gradient-to-r from-chart-3 via-yellow-300 to-chart-3" />

              <div className="p-7 relative">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon cluster */}
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-chart-3/20 to-primary/20 flex items-center justify-center">
                      <Crown className="w-10 h-10 text-chart-3" />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ delay: 1, duration: 0.6 }}
                      className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <p className="text-xs font-semibold tracking-widest uppercase text-chart-3 mb-2">
                    ✦ Premium Member ✦
                  </p>
                  <h2 className="font-heading text-xl font-bold mb-3">
                    Welcome back, {firstName}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {message}
                  </p>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                      >
                        <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-full bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Continue Your Journey
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}