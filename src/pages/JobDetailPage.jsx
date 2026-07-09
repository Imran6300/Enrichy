import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import LogFeed from '../components/LogFeed.jsx';
import { api } from '../api.js';
import { getSocket } from '../socket.js';

const ACTIVE = ['queued', 'discovering', 'enriching', 'ai_verifying', 'verifying', 'stopping'];

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stopping, setStopping] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { job } = await api.getJob(id);
        if (!mounted) return;
        setJob(job);
        setLogs((prev) => (prev.length ? prev : job.logs || []));
      } catch (err) {
        if (mounted) setError(err.message);
      }
    }
    load();

    const socket = getSocket();
    socket.emit('job:join', id);

    const onEvent = (payload) => {
      if (payload.jobId !== id) return;
      if (payload.type === 'log') {
        setLogs((prev) => [...prev, payload.data]);
      } else if (payload.type === 'status') {
        setJob((prev) => (prev ? { ...prev, status: payload.data.status } : prev));
      } else if (payload.type === 'progress') {
        setJob((prev) => (prev ? { ...prev, progress: payload.data.progress } : prev));
      } else if (payload.type === 'discover:lead') {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                progress: {
                  ...prev.progress,
                  discover: { ...prev.progress.discover, newLeads: payload.data.newLeads },
                },
              }
            : prev,
        );
      } else if (payload.type === 'enrich:lead') {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                progress: {
                  ...prev.progress,
                  enrich: {
                    ...prev.progress.enrich,
                    processed: payload.data.completed,
                    total: payload.data.total,
                  },
                },
              }
            : prev,
        );
      } else if (payload.type === 'verify:lead') {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                progress: {
                  ...prev.progress,
                  verify: {
                    ...prev.progress.verify,
                    processed: payload.data.completed,
                    total: payload.data.total,
                  },
                },
              }
            : prev,
        );
      }
    };
    socket.on('job:event', onEvent);

    // Poll as a fallback in case the socket connection drops.
    pollRef.current = setInterval(load, 6000);

    return () => {
      mounted = false;
      socket.emit('job:leave', id);
      socket.off('job:event', onEvent);
      clearInterval(pollRef.current);
    };
  }, [id]);

  async function handleStop() {
    setStopping(true);
    try {
      await api.stopJob(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setStopping(false);
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!job) return <p className="loading-dots text-inkDim">Loading</p>;

  const p = job.progress || {};
  const isActive = ACTIVE.includes(job.status);

  return (
    <div className="animate-fade-in-up">
      <div className="page-head">
        <div className="min-w-0">
          <h1 className="truncate">{job.name}</h1>
          <p className="truncate font-mono text-[13.5px]">{job.keywords.join(', ')} — {job.cities.join(', ')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={job.status} />
          {isActive && job.status !== 'stopping' && (
            <button className="btn btn-danger btn-sm" onClick={handleStop} disabled={stopping}>
              {stopping ? 'Stopping…' : 'Stop run'}
            </button>
          )}
          <Link className="btn btn-sm" to={`/leads?jobId=${job._id}`}>
            View leads →
          </Link>
        </div>
      </div>

      {job.error && <div className="error-banner">{job.error}</div>}

      {isActive && (
        <div className="info-banner">
          <span className="mt-0.5 shrink-0 text-amber">⏳</span>
          <span>
            <strong className="text-ink">This can take a few minutes.</strong> We're discovering, crawling
            and AI-verifying each lead carefully rather than rushing it — that's what keeps the emails and
            company data accurate. Feel free to leave this tab open in the background; it'll keep updating
            live.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel">
          <p className="panel-title">Pipeline progress</p>

          <PhaseRow
            label="1. Discover"
            active={job.status === 'discovering'}
            done={p.discover?.combosTotal > 0 && p.discover?.combosProcessed >= p.discover?.combosTotal}
            value={p.discover?.combosProcessed || 0}
            total={p.discover?.combosTotal || 0}
            detail={`${p.discover?.newLeads || 0} new leads found`}
          />
          <PhaseRow
            label="2. Enrich"
            active={job.status === 'enriching'}
            done={job.status === 'verifying' || job.status === 'completed'}
            value={p.enrich?.processed || 0}
            total={p.enrich?.total || 0}
            detail={`${p.enrich?.enriched || 0} enriched · ${p.enrich?.noWebsite || 0} no site · ${p.enrich?.failed || 0} failed`}
          />
          <PhaseRow
            label="3. Verify"
            active={job.status === 'verifying'}
            done={job.status === 'completed'}
            value={p.verify?.processed || 0}
            total={p.verify?.total || 0}
            detail={`${p.verify?.valid || 0} valid · ${p.verify?.catchAll || 0} catch-all · ${p.verify?.invalid || 0} invalid`}
            last
          />
        </div>

        <div className="panel">
          <p className="panel-title">Live feed</p>
          <LogFeed lines={logs} live={isActive} />
        </div>
      </div>
    </div>
  );
}

function PhaseRow({ label, active, done, value, total, detail, last }) {
  const labelColor = active ? 'text-amber' : done ? 'text-teal' : 'text-inkDim';
  return (
    <div className={last ? 'mb-0' : 'mb-[18px]'}>
      <div className="mb-1.5 flex flex-wrap justify-between gap-1 text-[13px]">
        <span className={`font-semibold ${labelColor}`}>{label}</span>
        <span className="font-mono text-inkFaint">
          {total > 0 ? `${value}/${total}` : active ? 'running…' : done ? 'done' : 'pending'}
        </span>
      </div>
      <ProgressBar value={value} total={total || (done ? 1 : 0)} />
      <div className="mt-1.5 font-mono text-[11px] text-inkFaint">{detail}</div>
    </div>
  );
}
