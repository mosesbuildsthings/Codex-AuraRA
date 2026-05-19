import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * PdfExportButton — premium feature
 * Downloads the user's full relationship history as a private PDF report.
 */
export default function PdfExportButton({ isPremium = false, className = "" }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature 🔒",
        description: "Upgrade to Premium to export your full relationship history as a private PDF report.",
      });
      return;
    }

    setLoading(true);
    try {
      // Use fetch with credentials so the session cookie is sent
      const res = await fetch("/api/functions/exportPdfReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Report downloaded ✓", description: "Your private PDF report is ready." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not generate report.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isPremium ? "default" : "outline"}
      className={`rounded-full gap-2 ${className}`}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPremium ? (
        <FileDown className="w-4 h-4" />
      ) : (
        <Lock className="w-4 h-4" />
      )}
      {loading ? "Generating PDF..." : isPremium ? "Export Full Report (PDF)" : "Export PDF Report (Premium)"}
    </Button>
  );
}