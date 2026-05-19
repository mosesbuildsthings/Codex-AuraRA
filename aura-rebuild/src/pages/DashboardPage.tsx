import { Link } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

export function DashboardPage() {
  const { data } = useAppState();
  const activeRelationship =
    data.relationships.find((relationship) => relationship.id === data.activeRelationshipId) ??
    data.relationships[0];

  const recentReports = data.reports.slice(0, 3);

  return (
    <section className="stack-lg">
      <article className="surface">
        <p className="eyebrow">Welcome back</p>
        <h2>{data.session?.name ?? "Aura User"}</h2>
        <p>
          Active relationship: <strong>{activeRelationship?.label}</strong>
        </p>
      </article>

      <div className="metric-grid">
        <article className="surface metric-card">
          <p>Reports</p>
          <strong>{data.reports.length}</strong>
        </article>

        <article className="surface metric-card">
          <p>Journal Entries</p>
          <strong>{data.journal.length}</strong>
        </article>

        <article className="surface metric-card">
          <p>Plan</p>
          <strong>{data.plan === "premium" ? "Premium" : "Free"}</strong>
        </article>
      </div>

      <article className="surface">
        <h3>Next Actions</h3>
        <div className="button-row wrap">
          <Link className="primary-button" to="/new-analysis">
            Start New Analysis
          </Link>
          <Link className="secondary-button" to="/sessions">
            View Sessions
          </Link>
          <Link className="secondary-button" to="/premium">
            Manage Premium
          </Link>
        </div>
      </article>

      <article className="surface">
        <h3>Recent Reports</h3>
        {recentReports.length ? (
          <ul className="report-list">
            {recentReports.map((report) => (
              <li key={report.id}>
                <div>
                  <p className="report-title">{report.title}</p>
                  <small>{new Date(report.createdAt).toLocaleString()}</small>
                </div>
                <Link className="secondary-button" to={`/report/${report.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">No reports yet. Start your first analysis.</p>
        )}
      </article>
    </section>
  );
}

