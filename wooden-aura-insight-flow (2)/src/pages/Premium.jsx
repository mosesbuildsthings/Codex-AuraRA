import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown, Check, Download, Share2, Users, Brain, Star, Zap, Trophy,
  Dumbbell, Heart, MessageCircle, Eye, Shield, Sparkles, ArrowLeft,
  Building2, BarChart3, Lock, Settings, Repeat
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CheckoutButton from "@/components/checkout/CheckoutButton";

const personalFeatures = [
  { icon: Download, title: "PDF Report Downloads", desc: "Export any report as a beautifully formatted PDF." },
  { icon: Share2, title: "Report Sharing", desc: "Share reports via WhatsApp, text, or email." },
  { icon: Users, title: "Partner Connection & Messaging", desc: "Invite your partner, share reports, and collaborate on action plans." },
  { icon: Eye, title: "Shared Vision Board", desc: "Co-create a vision board with your partner." },
  { icon: Zap, title: "AI Custom Action Plans", desc: "AI builds personalized action plans from your report insights." },
  { icon: Trophy, title: "Custom Weekly Challenges", desc: "AI generates tailored weekly challenges to strengthen your relationship." },
  { icon: Dumbbell, title: "Custom Partner Exercises", desc: "AI creates exercises designed for your specific dynamics." },
  { icon: Brain, title: "MBTI, Enneagram & Zodiac Insights", desc: "Unlock communication style analysis based on personality profiles." },
  { icon: MessageCircle, title: "Communication Style Compatibility", desc: "Deep compatibility analysis based on personality types." },
  { icon: Heart, title: "Gamification & Streaks", desc: "Earn badges, build streaks, and celebrate milestones." },
  { icon: Shield, title: "In-Depth Red Flag Analysis", desc: "Detailed red flag detection with specific mitigation strategies." },
  { icon: Star, title: "Partner Insights", desc: "Deep insights for both partners with suggested joint activities." },
];

const corporateFeatures = [
  { icon: Building2, title: "Multi-Department Management", desc: "Manage relationships across HR, teams, and departments simultaneously from one dashboard." },
  { icon: Users, title: "Unlimited Relationship Profiles", desc: "Add unlimited individuals and relationship pairs across your entire organization." },
  { icon: BarChart3, title: "Organizational Health Reports", desc: "Aggregate analytics and health scores across all managed relationships." },
  { icon: Lock, title: "Admin Access Controls", desc: "Fine-grained permissions — decide who can view, edit, or manage each relationship profile." },
  { icon: Settings, title: "Custom Onboarding Workflows", desc: "Tailor the intake and analysis experience for each department's unique needs." },
  { icon: Repeat, title: "Automated Check-in Scheduling", desc: "Schedule recurring relationship health check-ins across teams automatically." },
  { icon: Zap, title: "Priority AI Processing", desc: "All reports and analyses jump to the front of the queue." },
  { icon: Download, title: "Bulk Report Exports", desc: "Export all reports in bulk as PDFs or structured data for HR records." },
  { icon: Shield, title: "Enterprise-Grade Privacy", desc: "SOC 2-aligned data handling with role-based access and full audit logs." },
  { icon: MessageCircle, title: "Dedicated Account Manager", desc: "A dedicated support contact available for onboarding and ongoing assistance." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } })
};

const PERSONAL_MONTHLY = 15;
const CORPORATE_MONTHLY = 199;
const PERSONAL_YEARLY_DISCOUNT = 0.10; // 10%
const CORPORATE_YEARLY_DISCOUNT = 0.12; // 12%

function calcYearly(monthly, discount) {
  const total = monthly * 12 * (1 - discount);
  return Math.round(total);
}

function calcYearlyPerMonth(monthly, discount) {
  return ((monthly * 12 * (1 - discount)) / 12).toFixed(2);
}

export default function Premium() {
  const [billingPeriod, setBillingPeriod] = React.useState("monthly");
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"

  const personalPrice = billing === "monthly"
    ? `$${PERSONAL_MONTHLY}`
    : `$${calcYearlyPerMonth(PERSONAL_MONTHLY, PERSONAL_YEARLY_DISCOUNT)}`;
  const personalYearlyTotal = calcYearly(PERSONAL_MONTHLY, PERSONAL_YEARLY_DISCOUNT);
  const personalSaving = Math.round(PERSONAL_MONTHLY * 12 * PERSONAL_YEARLY_DISCOUNT);

  const corporatePrice = billing === "monthly"
    ? `$${CORPORATE_MONTHLY}`
    : `$${calcYearlyPerMonth(CORPORATE_MONTHLY, CORPORATE_YEARLY_DISCOUNT)}`;
  const corporateYearlyTotal = calcYearly(CORPORATE_MONTHLY, CORPORATE_YEARLY_DISCOUNT);
  const corporateSaving = Math.round(CORPORATE_MONTHLY * 12 * CORPORATE_YEARLY_DISCOUNT);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-3">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-chart-3" />
          <span className="font-heading text-lg font-bold">Aura Premium</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-chart-3/20 to-primary/20 flex items-center justify-center mx-auto mb-5">
            <Crown className="w-10 h-10 text-chart-3" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Choose your plan
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether you're an individual or an organization, Aura has a plan that fits.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span className={cn("text-sm font-medium", billing === "monthly" ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors duration-300",
              billing === "yearly" ? "bg-primary" : "bg-muted"
            )}
          >
            <span className={cn(
              "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300",
              billing === "yearly" ? "translate-x-7" : "translate-x-0"
            )} />
          </button>
          <span className={cn("text-sm font-medium flex items-center gap-2", billing === "yearly" ? "text-foreground" : "text-muted-foreground")}>
            Yearly
            <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-xs rounded-full px-2">Save up to 12%</Badge>
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Personal Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg">Personal Premium</p>
                <p className="text-xs text-muted-foreground">For individuals & couples</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-end gap-1">
                <span className="font-heading text-4xl font-bold">{personalPrice}</span>
                <span className="text-muted-foreground mb-1.5">/month</span>
              </div>
              {billing === "yearly" ? (
                <p className="text-xs text-chart-2 font-medium mt-1">
                  ${personalYearlyTotal}/year · Save ${personalSaving} (10% off)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Cancel anytime. No contracts.</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-6">7-day free trial included</p>

            <CheckoutButton
              priceId="price_1TS4jFRVkJ90LoJ7szeNbtFn"
              plan="Personal"
              variant="default"
              className="rounded-full w-full gap-2 bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 shadow-md shadow-primary/20 mb-6"
            >
              <Crown className="w-4 h-4" />
              Subscribe Now
            </CheckoutButton>

            <ul className="space-y-2.5 flex-1">
              {personalFeatures.map((f) => (
                <li key={f.title} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">{f.title}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Corporate Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-gradient-to-br from-chart-3/10 to-chart-5/10 border-2 border-chart-3/40 rounded-3xl p-8 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <Badge className="bg-chart-3/20 text-chart-3 border border-chart-3/30 rounded-full text-xs px-3">
                ✦ New
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-chart-3/15 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg">Corporate Premium</p>
                <p className="text-xs text-muted-foreground">For HR & multi-team organizations</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-end gap-1">
                <span className="font-heading text-4xl font-bold">{corporatePrice}</span>
                <span className="text-muted-foreground mb-1.5">/month</span>
              </div>
              {billing === "yearly" ? (
                <p className="text-xs text-chart-2 font-medium mt-1">
                  ${corporateYearlyTotal}/year · Save ${corporateSaving} (12% off)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Billed per organization. Cancel anytime.</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-6">Includes onboarding support & account manager</p>

            <div className="mb-6">
              <Button
                variant="outline"
                className="rounded-full w-full gap-2"
                onClick={() => window.location.href = "mailto:support@theauraapp.com?subject=Corporate%20Plan%20Inquiry"}
              >
                <Building2 className="w-4 h-4" />
                Contact Sales
              </Button>
            </div>

            <ul className="space-y-2.5 flex-1">
              {corporateFeatures.map((f) => (
                <li key={f.title} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-chart-3 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">{f.title}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Comparison footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground border-t border-border/60 pt-8"
        >
          <p className="mb-1">All plans include a 7-day free trial. No credit card required to start.</p>
          <p>Aura is an AI-powered informational tool, not a substitute for professional psychological, medical, or legal counsel.</p>
        </motion.div>
      </div>
    </div>
  );
}