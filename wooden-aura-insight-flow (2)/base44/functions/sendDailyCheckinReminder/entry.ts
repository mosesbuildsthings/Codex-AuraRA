import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called by a scheduled automation — use service role
    const allUsers = await base44.asServiceRole.entities.User.list();

    const now = new Date();
    const currentHourUTC = now.getUTCHours();
    const currentMinuteUTC = now.getUTCMinutes();

    const todayStr = now.toISOString().split('T')[0];

    let sentCount = 0;

    for (const user of allUsers) {
      if (!user.email) continue;

      // Check if user has a reminder time set
      const reminderTime = user.checkin_reminder_time; // format: "HH:MM"
      if (!reminderTime) continue;

      const [rHour, rMinute] = reminderTime.split(':').map(Number);

      // Only send if current UTC time matches (within the same hour:minute)
      if (rHour !== currentHourUTC || rMinute !== currentMinuteUTC) continue;

      // Check if user already checked in today
      const todayEntries = await base44.asServiceRole.entities.JournalEntry.filter(
        { created_by: user.email, date: todayStr }, '-created_date', 1
      );
      if (todayEntries.length > 0) continue;

      // Send reminder email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'Aura',
        subject: "Don't forget your daily check-in 💜",
        body: `Hi ${user.full_name || 'there'},

Just a gentle nudge — you haven't logged today's relationship check-in yet.

Taking just 2 minutes to reflect on how your relationship felt today can help you spot emotional patterns over time and give Aura better context for your next analysis.

👉 Log your check-in here: https://aura.base44.app/daily-check-in

With care,
The Aura Team

---
To stop receiving these reminders, update your notification settings in your Profile page.`,
      });

      sentCount++;
    }

    return Response.json({ success: true, sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});