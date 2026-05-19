import jsPDF from "jspdf";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { premiumFeatures } from "../data/constants";
import { useAppState } from "../state/AppStateContext";

function fullReportText(reportBody: string[]): string {
  return reportBody.join("\n\n");
}

export function ReportPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { data, dispatch } = useAppState();

  const report = data.reports.find((candidate) => candidate.id === reportId);
  const [noteDraft, setNoteDraft] = useState(report?.notes ?? "");

  const premiumLocked = data.plan !== "premium";

  const sections = useMemo(() => {
    if (!report) return [];
    return report.fullReportSections.map((section) => `${section.heading}\n${section.body}`);
  }, [report]);

  if (!report) {
    return (
      <section className="surface">
        <h2>Report not found</h2>
        <button type="button" className="secondary-button" onClick={() => navigate("/sessions")}>
          Back to Sessions
        </button>
      </section>
    );
  }

  const currentReport = report;

  function addJournal(content: string) {
    dispatch({
      type: "add_journal",
      payload: {
        id: crypto.randomUUID(),
        relationshipId: currentReport.relationshipId,
        createdAt: new Date().toISOString(),
        content,
      },
    });
  }

  async function handleShare() {
    const body = fullReportText(sections);
    const shareText = `${currentReport.title}\n\n${currentReport.quickSummary.join("\n")}\n\n${body}`;

    if (navigator.share) {
      await navigator.share({ title: currentReport.title, text: shareText });
      return;
    }

    await navigator.clipboard.writeText(shareText);
    window.alert("Report copied to clipboard.");
  }

  function handlePdfDownload() {
    if (premiumLocked) {
      window.alert("PDF download is a premium feature.");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 40;
    let y = 50;

    doc.setFontSize(16);
    doc.text(currentReport.title, marginX, y);
    y += 24;

    doc.setFontSize(11);
    const text = fullReportText(sections);
    const lines = doc.splitTextToSize(text, 520);

    for (const line of lines) {
      if (y > 740) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, marginX, y);
      y += 16;
    }

    doc.save(`${currentReport.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  function requirePremiumAction(action: string, callback: () => void) {
    if (premiumLocked) {
      window.alert(`${action} is available in Aura Premium.`);
      return;
    }
    callback();
  }

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>{currentReport.title}</h2>
        <p>
          {currentReport.relationshipLabel} · {new Date(currentReport.createdAt).toLocaleString()} · Risk level: {currentReport.riskLevel}
        </p>
      </article>

      <article className="surface">
        <h3>Quick Summary</h3>
        <ul className="summary-list">
          {currentReport.quickSummary.map((summary) => (
            <li key={summary}>{summary}</li>
          ))}
        </ul>
      </article>

      <article className="surface">
        <h3>Full Report</h3>
        {premiumLocked ? (
          <div className="premium-lock">
            <p>Upgrade to premium to unlock complete report chapters.</p>
            <Link className="primary-button" to="/premium">
              Upgrade for $15/month
            </Link>
          </div>
        ) : (
          <div className="stack">
            {currentReport.fullReportSections.map((section) => (
              <section key={section.heading} className="report-section">
                <h4>{section.heading}</h4>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        )}
      </article>

      <article className="surface">
        <h3>Report Actions</h3>
        <div className="button-row wrap">
          <button type="button" className="secondary-button" onClick={handleShare}>
            Share Report
          </button>
          <button type="button" className="secondary-button" onClick={handlePdfDownload}>
            Download PDF (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => addJournal(`Journal follow-up from report: ${currentReport.title}`)}
          >
            Add To Journal
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              requirePremiumAction("Partner connection", () =>
                addJournal(`Partner invitation generated from report ${currentReport.title}`),
              )
            }
          >
            Link Partner Connection (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              requirePremiumAction("Custom action plan", () =>
                addJournal(`Custom action plan created for ${currentReport.relationshipLabel}`),
              )
            }
          >
            Create Custom Action Plan (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              requirePremiumAction("Weekly challenge", () =>
                addJournal(`Weekly challenge generated from ${currentReport.title}`),
              )
            }
          >
            Create Weekly Challenge (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              requirePremiumAction("Custom exercises", () =>
                addJournal(`Custom exercise path created from ${currentReport.title}`),
              )
            }
          >
            Create Custom Exercises (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              requirePremiumAction("Custom quizzes", () =>
                addJournal(`Partner quiz generated from ${currentReport.title}`),
              )
            }
          >
            Create Custom Quizzes (Premium)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => addJournal(`Relationship vision drafted from ${currentReport.title}`)}
          >
            Build Relationship Vision
          </button>
        </div>
      </article>

      <article className="surface stack">
        <h3>Session Notes</h3>
        <textarea
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
          rows={5}
          placeholder="Any notes you want to capture from this session..."
        />
        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              dispatch({ type: "update_report_notes", payload: { id: currentReport.id, notes: noteDraft } });
            }}
          >
            Save Notes
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => addJournal(`Session notes: ${noteDraft}`)}
            disabled={!noteDraft.trim()}
          >
            Add Notes To Journal
          </button>
        </div>
      </article>

      {premiumLocked ? (
        <article className="surface">
          <h3>Premium Includes</h3>
          <ul className="summary-list">
            {premiumFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}

