import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, Heart, Mail, CheckCircle2, Clock,
  XCircle, Users, Lock, Share2, Target, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PartnerSentimentChart from "@/components/partner/PartnerSentimentChart";
import { useOfflineCache } from "@/hooks/useOfflineCache";

export default function PartnerConnect() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.PartnerConnection.list("-created_date", 20),
    initialData: []
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals-partner"],
    queryFn: () => base44.entities.RelationshipGoal.list("-created_date", 50),
    initialData: []
  });

  const { data: myJournalEntries = [] } = useOfflineCache(
    "journal-partner-view",
    () => base44.entities.JournalEntry.list("-date", 60),
    []
  );

  const partnerJournalEntries = []; // Partner entries are private per design

  // Connections sent by me
  const myInvites = connections.filter(c => c.inviter_email === user?.email);
  // Connections sent to me
  const incomingInvites = connections.filter(c => c.partner_email === user?.email);
  const activeConnection = [...myInvites, ...incomingInvites].find(c => c.status === "accepted");

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!partnerEmail || !user) return;
    setSending(true);
    await base44.entities.PartnerConnection.create({
      inviter_email: user.email,
      partner_email: partnerEmail,
      status: "pending",
      shared_goals: true
    });
    queryClient.invalidateQueries({ queryKey: ["connections"] });
    setSending(false);
    setSent(true);
    setPartnerEmail("");
  };

  const handleRespond = async (id, status) => {
    await base44.entities.PartnerConnection.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ["connections"] });
  };

  const handleDisconnect = async (id) => {
    await base44.entities.PartnerConnection.delete(id);
    queryClient.invalidateQueries({ queryKey: ["connections"] });
  };

  const sharedGoals = goals.filter(g => g.status !== "paused");

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl font-bold">Partner Connection</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20 space-y-6">
        {/* Privacy note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/40 border border-accent/60">
          <Lock className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-accent-foreground leading-relaxed">
            <strong>Your journal is always private.</strong> Connecting with a partner only enables shared viewing of Relationship Goals and collaborative progress tracking. Individual analyses and journal entries remain completely confidential.
          </p>
        </div>

        {/* Active connection */}
        {activeConnection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card border border-chart-2/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">Connected</h3>
                <p className="text-xs text-muted-foreground">
                  {activeConnection.inviter_email === user?.email
                    ? activeConnection.partner_email
                    : activeConnection.inviter_email}
                </p>
              </div>
              <Badge className="ml-auto rounded-full bg-chart-2/10 text-chart-2 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => handleDisconnect(activeConnection.id)}
            >
              Disconnect Partner
            </Button>
          </motion.div>
        )}

        {/* Incoming invites */}
        {incomingInvites.filter(c => c.status === "pending").map(invite => (
          <motion.div key={invite.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Partner invitation</p>
                <p className="text-xs text-muted-foreground">From: {invite.inviter_email}</p>
              </div>
              <Badge className="ml-auto rounded-full bg-primary/10 text-primary gap-1">
                <Clock className="w-3 h-3" /> Pending
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button size="sm" className="flex-1 rounded-full" onClick={() => handleRespond(invite.id, "accepted")}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={() => handleRespond(invite.id, "declined")}>
                <XCircle className="w-4 h-4 mr-1.5" /> Decline
              </Button>
            </div>
          </motion.div>
        ))}

        {/* Invite form */}
        {!activeConnection && (
          <div className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">Invite Your Partner</h3>
                <p className="text-xs text-muted-foreground">They'll need an Aura account to accept.</p>
              </div>
            </div>

            <AnimatePresence>
              {sent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <p className="text-sm text-chart-2">Invitation sent! They'll see it when they log in.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <Label className="text-sm mb-1.5 block">Partner's Email Address</Label>
                <Input
                  type="email"
                  placeholder="partner@email.com"
                  value={partnerEmail}
                  onChange={e => { setPartnerEmail(e.target.value); setSent(false); }}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full gap-2" disabled={sending || !partnerEmail}>
                <Mail className="w-4 h-4" />
                {sending ? "Sending..." : "Send Invitation"}
              </Button>
            </form>

            {/* Previous invites */}
            {myInvites.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3">Sent invitations</p>
                <div className="space-y-2">
                  {myInvites.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between">
                      <p className="text-sm">{invite.partner_email}</p>
                      <Badge className={`rounded-full text-xs ${
                        invite.status === "accepted" ? "bg-chart-2/10 text-chart-2" :
                        invite.status === "declined" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {invite.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sentiment Trends Chart */}
        {activeConnection && (
          <div className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-chart-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">Sentiment Trends</h3>
                <p className="text-xs text-muted-foreground">Your check-in patterns · last 30 days</p>
              </div>
            </div>
            <PartnerSentimentChart
              myEntries={myJournalEntries}
              partnerEntries={partnerJournalEntries}
            />
          </div>
        )}

        {/* Shared Goals */}
        {activeConnection && (
          <div className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading font-semibold">Shared Goals</h3>
              </div>
              <Link to="/goals">
                <Button variant="outline" size="sm" className="rounded-full text-xs">Manage</Button>
              </Link>
            </div>

            {sharedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active goals yet. <Link to="/goals" className="text-primary hover:underline">Create one</Link> to share with your partner.</p>
            ) : (
              <div className="space-y-2">
                {sharedGoals.slice(0, 5).map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <p className="text-sm truncate mr-3">{goal.title}</p>
                    <Badge className={`rounded-full text-xs shrink-0 ${
                      goal.status === "completed" ? "bg-chart-2/10 text-chart-2" :
                      goal.status === "in_progress" ? "bg-primary/10 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {goal.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" /> How Partner Connection works
          </h3>
          <div className="space-y-3">
            {[
              { icon: "🔒", text: "Your journal and analysis sessions are always 100% private." },
              { icon: "🎯", text: "Relationship Goals are shared so both partners can track progress together." },
              { icon: "📧", text: "Your partner receives an invitation and must have an Aura account to connect." },
              { icon: "🔓", text: "Either partner can disconnect at any time." }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}