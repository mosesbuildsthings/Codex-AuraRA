import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Download, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, addMinutes } from "date-fns";

/**
 * CalendarSyncButton
 * Props:
 *   title (string)         — event title
 *   description (string)   — event description
 *   date (Date|string)     — event start datetime
 *   durationMinutes (number) — default 30
 */
export default function CalendarSyncButton({ title, description, date, durationMinutes = 30 }) {
  const { toast } = useToast();
  const [gcLoading, setGcLoading] = useState(false);
  const [gcDone, setGcDone] = useState(false);

  // .ics download — works for Apple Calendar, Outlook, etc.
  const handleIcsDownload = () => {
    const start = new Date(date);
    const end = addMinutes(start, durationMinutes);

    const formatIcs = (d) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aura Relationship AI//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@aura`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${(description || "").replace(/\n/g, "\\n")}`,
      `DTSTART:${formatIcs(start)}`,
      `DTEND:${formatIcs(end)}`,
      `DTSTAMP:${formatIcs(new Date())}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar file downloaded", description: "Open it to import into Apple Calendar, Outlook, or any calendar app." });
  };

  // Google Calendar direct add
  const handleGoogleCalendar = async () => {
    setGcLoading(true);
    try {
      const res = await base44.functions.invoke("addToGoogleCalendar", {
        title,
        description,
        date: new Date(date).toISOString(),
        durationMinutes,
      });
      if (res.data?.htmlLink) {
        window.open(res.data.htmlLink, "_blank");
      }
      setGcDone(true);
      toast({ title: "Added to Google Calendar ✓", description: "The event has been added to your calendar." });
    } catch (err) {
      toast({ title: "Error", description: "Could not add to Google Calendar. Please try again.", variant: "destructive" });
    } finally {
      setGcLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={handleIcsDownload}>
        <Download className="w-3.5 h-3.5" />
        .ics / Apple / Outlook
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full gap-1.5 text-xs"
        onClick={handleGoogleCalendar}
        disabled={gcLoading || gcDone}
      >
        {gcLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : gcDone ? (
          <Check className="w-3.5 h-3.5 text-chart-2" />
        ) : (
          <CalendarPlus className="w-3.5 h-3.5" />
        )}
        {gcDone ? "Added!" : "Google Calendar"}
      </Button>
    </div>
  );
}