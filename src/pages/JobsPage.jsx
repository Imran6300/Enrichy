import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../api.js';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const { jobs } = await api.listJobs();
      setJobs(jobs);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="page-head">
        <div>
          <h1>Runs</h1>
          <p>Every discovery run started from the dashboard, live and historical.</p>
        </div>
        <Link to="/" className="btn btn-primary">
          + New run
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        {jobs === null && <p className="loading-dots text-inkDim">Loading</p>}
        {jobs && jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-glyph">∅</div>
            No runs yet. Start one from the New run tab.
          </div>
        )}
        {jobs &&
          jobs.map((job, i) => (
            <Link
              to={`/jobs/${job._id}`}
              className="block text-inherit no-underline"
              key={job._id}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="job-card">
                <div className="w-full min-w-0 sm:w-auto">
                  <div className="job-card-name truncate">{job.name}</div>
                  <div className="job-card-meta truncate">
                    {job.keywords.length} keyword(s) × {job.cities.length} location(s) · target {job.target} ·
                    started {timeAgo(job.createdAt)}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-3.5 sm:w-auto sm:justify-end">
                  <span className="font-mono text-xs text-inkDim">
                    {job.progress?.discover?.newLeads ?? 0} found
                  </span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
