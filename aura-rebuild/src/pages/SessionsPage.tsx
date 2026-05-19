import { Link } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export function SessionsPage() {
  const { data } = useAppState();

  return (
    <section className="stack-lg">
      <article className="surface">
        <h2>Reports and Sessions</h2>
        <p>Every generated report is saved locally so you can return to it any time.</p>
      </article>

      <article className="surface">
        <h3>Saved Reports</h3>
        {data.reports.length ? (
          <ul className="report-list stacked">
            {data.reports.map((report) => (
              <li key={report.id}>
                <div>
                  <p className="report-title">{report.title}</p>
                  <small>
                    {report.relationshipLabel} · {new Date(report.createdAt).toLocaleString()}
                  </small>
                </div>
                <Link className="secondary-button" to={`/report/${report.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No report sessions yet.</p>
        )}
      </article>

      <article className="surface">
        <h3>Journal Timeline</h3>
        {data.journal.length ? (
          <ul className="journal-list">
            {data.journal.map((entry) => (
              <li key={entry.id}>
                <small>{new Date(entry.createdAt).toLocaleString()}</small>
                <p>{entry.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No journal entries yet.</p>
        )}
      </article>
    </section>
  );
}

