import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AuraLogo from "@/components/ui/AuraLogo";

const messages = [
  "Your reflection matters. Come back when you're ready.",
  "Growth takes time. We'll be right here.",
  "Every step forward counts. See you soon.",
  "Rest, reflect, return. We'll be waiting.",
];

export default function Goodbye() {
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Animated heart */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center mx-auto mb-8"
        >
          <HeartHandshake className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Goodbye for now 💜
          </h1>
          <p className="text-lg text-muted-foreground mb-2 leading-relaxed">
            {message}
          </p>
          <p className="text-sm text-muted-foreground/70 mb-10">
            Your journal and reflections are safely stored, waiting for your return.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            className="rounded-full px-8 gap-2"
            onClick={() => window.location.href = "/"}
          >
            <Sparkles className="w-4 h-4" /> Back to Aura
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-8"
            onClick={() => window.location.href = "/dashboard"}
          >
            Actually, stay
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <AuraLogo variant="wordmark" size="sm" className="justify-center opacity-40" />
        </motion.div>
      </motion.div>
    </div>
  );
}