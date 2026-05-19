import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all user data in parallel
    const [cases, reports, journals, exercises, milestones, goals] = await Promise.all([
      base44.entities.AnalysisCase.filter({ created_by: user.email }, '-created_date', 100),
      base44.entities.Report.list('-created_date', 100),
      base44.entities.JournalEntry.filter({ created_by: user.email }, '-date', 365),
      base44.entities.GrowthExercise.filter({ created_by: user.email }, '-created_date', 100),
      base44.entities.Milestone.filter({ created_by: user.email }, '-date', 100),
      base44.entities.RelationshipGoal.filter({ created_by: user.email }, '-created_date', 100),
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 20;
    const contentWidth = W - margin * 2;
    let y = 30;

    const checkNewPage = (needed = 10) => {
      if (y + needed > 270) { doc.addPage(); y = 20; }
    };

    const addSection = (title) => {
      checkNewPage(16);
      doc.setFillColor(139, 92, 246);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 4, y + 5.5);
      doc.setTextColor(30, 30, 30);
      y += 12;
    };

    const addText = (text, size = 9, bold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(String(text || ''), contentWidth);
      checkNewPage(lines.length * (size * 0.5) + 4);
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.5) + 3;
    };

    const addLabel = (label, value) => {
      checkNewPage(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(String(value || '—'), contentWidth - 40);
      doc.text(lines, margin + 35, y);
      y += Math.max(lines.length * 4.5, 6) + 1;
    };

    // ── Cover Page ──────────────────────────────────────────────────────────
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, W, 60, 'F');
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Aura', margin, 28);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('Relationship Intelligence Report', margin, 38);
    doc.setFontSize(10);
    doc.text(`Generated for: ${user.full_name || user.email}`, margin, 50);

    y = 72;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.text(`Report generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 6;
    doc.text('⚠️  PRIVATE & CONFIDENTIAL — This report is for personal use only.', margin, y);
    y += 16;

    // Summary stats
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const stats = [
      { label: 'Analysis Sessions', val: cases.length },
      { label: 'Journal Entries', val: journals.length },
      { label: 'Milestones', val: milestones.length },
      { label: 'Goals Set', val: goals.length },
    ];
    const colW = contentWidth / 4;
    stats.forEach((s, i) => {
      const x = margin + i * colW + colW / 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(139, 92, 246);
      doc.text(String(s.val), x, y + 12, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(s.label, x, y + 21, { align: 'center' });
    });
    y += 36;

    // ── Journal Entries ──────────────────────────────────────────────────────
    if (journals.length > 0) {
      addSection(`Journal Entries (${journals.length})`);
      const SENT_EMOJI = { great: '😊', good: '🙂', neutral: '😐', difficult: '😔', tough: '😢' };
      journals.forEach((j, i) => {
        checkNewPage(20);
        doc.setFillColor(250, 249, 255);
        doc.roundedRect(margin, y, contentWidth, 2, 1, 1, 'F');
        addLabel('Date', `${j.date}  ${SENT_EMOJI[j.sentiment] || ''} ${j.sentiment || ''}`);
        addText(j.content);
        if (j.tags?.length) addLabel('Tags', j.tags.join(', '));
        y += 4;
        if (i < journals.length - 1) {
          doc.setDrawColor(220, 220, 230);
          doc.line(margin, y, margin + contentWidth, y);
          y += 5;
        }
      });
    }

    // ── Analysis Reports ──────────────────────────────────────────────────────
    const completedCaseIds = new Set(cases.filter(c => c.status === 'completed').map(c => c.id));
    const myReports = reports.filter(r => completedCaseIds.has(r.case_id));
    if (myReports.length > 0) {
      addSection(`Analysis Reports (${myReports.length})`);
      myReports.forEach((r, i) => {
        checkNewPage(20);
        addText(r.title || 'Analysis Report', 11, true);
        if (r.summary) addLabel('Summary', r.summary);
        if (r.key_dynamics) addLabel('Key Dynamics', r.key_dynamics);
        if (r.advice) addLabel('Advice', r.advice.substring(0, 400) + (r.advice.length > 400 ? '...' : ''));
        if (r.risk_level) addLabel('Risk Level', r.risk_level);
        y += 4;
        if (i < myReports.length - 1) {
          doc.setDrawColor(220, 220, 230);
          doc.line(margin, y, margin + contentWidth, y);
          y += 5;
        }
      });
    }

    // ── Milestones ──────────────────────────────────────────────────────────
    if (milestones.length > 0) {
      addSection(`Milestones (${milestones.length})`);
      milestones.forEach((m) => {
        checkNewPage(10);
        addLabel(`${m.emoji || '🏆'} ${m.date}`, `${m.title} [${m.category || 'memory'}]`);
        if (m.notes) addText(m.notes);
      });
    }

    // ── Goals ──────────────────────────────────────────────────────────
    if (goals.length > 0) {
      addSection(`Relationship Goals (${goals.length})`);
      goals.forEach((g) => {
        checkNewPage(10);
        addLabel(g.title, `Status: ${g.status || 'not started'} · Category: ${g.category || '—'}`);
        if (g.description) addText(g.description);
      });
    }

    // ── Exercises ──────────────────────────────────────────────────────────
    const completedExercises = exercises.filter(e => e.status === 'completed');
    if (completedExercises.length > 0) {
      addSection(`Completed Growth Exercises (${completedExercises.length})`);
      completedExercises.forEach((e) => {
        checkNewPage(10);
        addLabel(e.title, `${e.category || ''} · ${e.checkin_date || ''}`);
        if (e.checkin_notes) addText(`Reflection: ${e.checkin_notes}`);
      });
    }

    // ── Footer on all pages ──────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text('Aura Relationship AI — Private Report', margin, 287);
      doc.text(`Page ${i} of ${pageCount}`, W - margin, 287, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=aura-relationship-report-${new Date().toISOString().split('T')[0]}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});