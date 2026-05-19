import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Lock, Eye, ArrowRight, Home, User, LogIn, Moon, Sun, Menu, BookOpen, Users, Activity, Swords, Dumbbell, Target, Brain } from "lucide-react";
import AuraLogo from "@/components/ui/AuraLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const menuLinks = [
  { label: "Journal", path: "/journal", icon: BookOpen },
  { label: "Partner", path: "/partner", icon: Users },
  { label: "Health Report", path: "/health-report", icon: Activity },
  { label: "Challenges", path: "/challenges", icon: Swords },
  { label: "Exercises", path: "/exercise-library", icon: Dumbbell },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "Coach", path: "/coach", icon: Brain },
];

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "All personal details are automatically anonymized before analysis. We never sell your data."
  },
  {
    icon: Heart,
    title: "Empathetic Guidance",
    description: "Receive thoughtful, research-backed advice that feels like talking to a trusted advisor."
  },
  {
    icon: Lock,
    title: "Completely Confidential",
    description: "Your data is encrypted and you can permanently delete everything at any time."
  },
  {
    icon: Eye,
    title: "Deep Insight",
    description: "AI-powered analysis of communication patterns, emotional dynamics, and relationship health."
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" }
  })
};

export default function Landing() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsLoggedIn).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background" />
        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <AuraLogo variant="wordmark" size="md" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Hamburger menu */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setMenuOpen(o => !o)}
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Mobile: full-screen overlay */}
              <AnimatePresence>
                {menuOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                      onClick={() => setMenuOpen(false)}
                    />
                    {/* Slide-up sheet (mobile) */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card rounded-t-3xl pb-10 pt-2 shadow-2xl"
                    >
                      {/* Handle */}
                      <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6 mt-2" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 mb-3">Navigate to</p>
                      <div className="grid grid-cols-2 gap-3 px-4">
                        {menuLinks.map(({ label, path, icon: Icon }) => (
                          <Link
                            key={path}
                            to={path}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-muted hover:bg-primary/10 active:scale-95 transition-all"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>

                    {/* Desktop dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="hidden md:block absolute right-0 top-12 z-50 w-56 rounded-2xl bg-card border border-border shadow-xl shadow-black/10 overflow-hidden"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 pt-4 pb-2">Navigate to</p>
                      {menuLinks.map(({ label, path, icon: Icon }) => (
                        <Link
                          key={path}
                          to={path}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          {label}
                        </Link>
                      ))}
                      <div className="h-2" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {isLoggedIn && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="rounded-full px-5 text-muted-foreground gap-1.5">
                    <Home className="w-4 h-4" /> Home
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="rounded-full px-5 text-muted-foreground gap-1.5">
                    <User className="w-4 h-4" /> Profile
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="outline"
              className="rounded-full px-5 gap-1.5"
              onClick={() => base44.auth.redirectToLogin("/dashboard")}
            >
              <LogIn className="w-4 h-4" /> Log In
            </Button>
            <Button
              className="rounded-full px-5 gap-1.5"
              onClick={() => base44.auth.redirectToLogin("/dashboard")}
            >
              <User className="w-4 h-4" /> Sign Up
            </Button>
            <Link to="/onboarding">
              <Button className="rounded-full px-6">
                New Session
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">
              AI-Powered Relationship Intelligence
            </p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              A private, secure space to reflect on your relationship
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Receive thoughtful, AI-powered guidance from Aura — your confidential relationship advisor. 
              Grounded in psychology, delivered with empathy.
            </p>
            <Link to="/onboarding">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg gap-2 shadow-lg shadow-primary/20">
                Begin Your Reflection <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Built on a foundation of trust
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every design choice is intentionally crafted to protect your privacy and support your journey.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group p-8 rounded-2xl border border-border/60 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold mb-4">
              How Aura works
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Share Your Story", desc: "Write your narrative and upload any evidence in a guided, supportive interface." },
              { step: "02", title: "AI Analysis", desc: "Aura analyzes emotional tone, communication patterns, and relationship dynamics." },
              { step: "03", title: "Receive Guidance", desc: "Get a personalized, multi-chapter report with actionable, empathetic advice." }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <span className="font-heading text-5xl font-bold text-primary/20">{item.step}</span>
                <h3 className="font-heading text-xl font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to gain clarity?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Your willingness to reflect is a sign of strength. Aura is here to support you — privately and confidentially.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/onboarding">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg gap-2">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <AuraLogo variant="wordmark" size="sm" />
          <p className="text-sm text-muted-foreground text-center">
            Aura is an AI-powered informational tool, not a substitute for professional psychological, medical, or legal counsel.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}