import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

const STATUSES = ['discovered', 'enriching', 'enriched', 'enrich_failed', 'no_website', 'exported', 'contacted'];
const RECOMMENDATIONS = ['SEND', 'SEND_WITH_CAUTION', 'VERIFY_MANUALLY', 'DO_NOT_SEND'];

function scoreColor(score) {
  if (score == null) return 'text-inkFaint';
  if (score >= 80) return 'text-teal';
  if (score >= 60) return 'text-amber';
  return 'text-rust';
}

export default function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState(params.get('search') || '');

  const page = parseInt(params.get('page') || '1', 10);
  const status = params.get('status') || '';
  const recommendation = params.get('emailRecommendation') || '';
  const jobId = params.get('jobId') || '';

  async function load() {
    try {
      const query = Object.fromEntries(params.entries());
      const res = await api.listLeads({ ...query, page, limit: 25 });
      setData(res);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  function goPage(delta) {
    const next = new URLSearchParams(params);
    next.set('page', String(page + delta));
    setParams(next);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead permanently?')) return;
    await api.deleteLead(id);
    load();
  }

  const exportParams = Object.fromEntries(params.entries());
  delete exportParams.page;

  return (
    <div className="animate-fade-in-up">
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p className={data ? '' : 'loading-dots'}>{data ? `${data.pagination.totalCount} total` : 'Loading'}</p>
        </div>
        <a className="btn btn-primary" href={api.exportCsvUrl(exportParams)}>
          Export CSV ↓
        </a>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search company, domain, email, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
            className="field-control min-w-0 flex-1 sm:min-w-[240px]"
          />
          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            className="field-control w-auto min-w-[140px]"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={recommendation}
            onChange={(e) => updateParam('emailRecommendation', e.target.value)}
            className="field-control w-auto min-w-[140px]"
          >
            <option value="">All recommendations</option>
            {RECOMMENDATIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {jobId && (
            <button className="chip" onClick={() => updateParam('jobId', '')}>
              Job filter active ×
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th className="hidden md:table-cell">City</th>
                <th className="hidden lg:table-cell">Keyword</th>
                <th className="hidden sm:table-cell">Status</th>
                <th>Score</th>
                <th className="hidden sm:table-cell">Recommendation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.leads.map((lead) => (
                <>
                  <tr
                    key={lead._id}
                    className="cursor-pointer"
                    onClick={() => setExpanded(expanded === lead._id ? null : lead._id)}
                  >
                    <td className="max-w-[100px] truncate sm:max-w-[220px]" title={lead.companyName}>
                      {lead.companyName}
                    </td>
                    <td className="max-w-[110px] truncate font-mono sm:max-w-[220px]" title={lead.primaryEmail || ''}>
                      {lead.primaryEmail || <span className="text-inkFaint">—</span>}
                    </td>
                    <td className="hidden md:table-cell">{lead.city}</td>
                    <td className="hidden text-inkDim lg:table-cell">{lead.matchedKeyword}</td>
                    <td className="hidden text-inkDim sm:table-cell">{lead.status}</td>
                    <td className={`font-mono ${scoreColor(lead.emailVerificationScore)}`}>
                      {lead.emailVerificationScore ?? '—'}
                    </td>
                    <td className="hidden text-inkDim sm:table-cell">{lead.emailRecommendation || '—'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === lead._id && (
                    <tr key={lead._id + '-detail'}>
                      <td colSpan={8} className="bg-panelRaised">
                        <div className="grid grid-cols-1 gap-4 text-[12.5px] xs:grid-cols-2 lg:grid-cols-3">
                          {/* These four are duplicated from the table row only on the
                              breakpoints where their column is hidden, so no data is
                              lost when the table narrows for small screens. */}
                          <div className="sm:hidden">
                            <strong>Status</strong>
                            <br />
                            {lead.status}
                          </div>
                          <div className="sm:hidden">
                            <strong>Recommendation</strong>
                            <br />
                            {lead.emailRecommendation || '—'}
                          </div>
                          <div className="md:hidden">
                            <strong>City</strong>
                            <br />
                            {lead.city || '—'}
                          </div>
                          <div className="lg:hidden">
                            <strong>Keyword</strong>
                            <br />
                            {lead.matchedKeyword || '—'}
                          </div>
                          <div>
                            <strong>Website</strong>
                            <br />
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all font-mono text-teal"
                            >
                              {lead.website || '—'}
                            </a>
                          </div>
                          <div>
                            <strong>Phone</strong>
                            <br />
                            <span className="font-mono">{lead.phone || '—'}</span>
                          </div>
                          <div>
                            <strong>Address</strong>
                            <br />
                            {lead.address || '—'}
                          </div>
                          <div>
                            <strong>Primary contact</strong>
                            <br />
                            {lead.primaryContactName
                              ? `${lead.primaryContactName} — ${lead.primaryContactTitle || ''}`
                              : '—'}
                          </div>
                          <div className="xs:col-span-2 lg:col-span-1">
                            <strong>Notes</strong>
                            <br />
                            {lead.enrichmentNotes || '—'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {data && data.leads.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-glyph">∅</div>
              No leads match these filters yet.
            </div>
          )}
        </div>

        {data && (
          <div className="pagination">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => goPage(-1)}>
              ← Prev
            </button>
            Page {data.pagination.page} / {data.pagination.totalPages}
            <button
              className="btn btn-sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => goPage(1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
