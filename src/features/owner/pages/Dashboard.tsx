import React, { useEffect, useMemo, useState } from 'react';
import { ownerService } from '../services/ownerService';
import { API_CONFIG } from '@/config/api';
import NotificationBell from '@/components/common/NotificationBell';
import ChatWidget from '@/components/common/ChatWidget';

const OwnerDashboardPage: React.FC = () => {
  type RevenuePoint = { name: string; total: number };
  type Opportunity = {
    name?: string;
    account_name?: string;
    stage?: string;
    value?: number;
    close_date?: string;
  };

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'6months' | '12months'>('6months');
  const [thisMonthRevenue, setThisMonthRevenue] = useState<number>(0);
  const [pipelineOpenValue, setPipelineOpenValue] = useState<number>(0);
  const [openInvoicesTotal, setOpenInvoicesTotal] = useState<number>(0);
  const [activeContracts, setActiveContracts] = useState<number>(0);
  const [topDeals, setTopDeals] = useState<Opportunity[]>([]);
  const [renewals, setRenewals] = useState<{ account: string; endDate: Date; daysLeft: number }[]>([]);
  const [actionTab, setActionTab] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    const loadTrend = async () => {
      try {
        const data = await ownerService.getRevenueTrend(timeRange);
        setRevenueData(data);
      } catch {
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };
    loadTrend();
    (async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_CONFIG.baseUrl}/admin/workspace/my`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok && data?.name) setCompanyName(data.name);
      } catch { void 0 }
    })();
  }, [timeRange]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const headers = { 'x-auth-token': token, Authorization: `Bearer ${token}` };
        const oppRes = await fetch(`${API_CONFIG.baseUrl}/crm/deals`, { headers });
        if (oppRes.ok) {
          const opps = await oppRes.json();
          const oppsData: Opportunity[] = Array.isArray(opps) ? opps : [];
          const open = oppsData.filter(o => !(String(o.stage || '').toLowerCase().startsWith('closed')));
          const total = open.reduce((sum: number, o) => sum + (typeof o.value === 'number' ? o.value : 0), 0);
          setPipelineOpenValue(total);
          const sortedTop = [...open]
            .filter((o) => typeof o.value === 'number')
            .sort((a, b) => (b.value || 0) - (a.value || 0))
            .slice(0, 5);
          setTopDeals(sortedTop);
        }
        const [rev, invTotal, active, upcoming] = await Promise.all([
          ownerService.getThisMonthRevenue(),
          ownerService.getOpenInvoicesUnpaidTotal(),
          ownerService.getActiveContractsCount(),
          ownerService.getUpcomingRenewals(30)
        ]);
        setThisMonthRevenue(rev);
        setOpenInvoicesTotal(invTotal);
        setActiveContracts(active);
        setRenewals(upcoming);
      } catch { void 0 }
    };
    load();
  }, []);

  const fmt = (n: number) =>
    Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const fmtShort = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n}`;
  };

  const chartData = useMemo(() => revenueData, [revenueData]);
  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase().replace(',', ' ·');

  // Action items data
  const actionItems = [
    { title: 'Quote Approval Needed', desc: 'Acme Corp — $125,000 (Discount: 15%)', priority: 'high' as const, days: 2, cta: 'Review', ghost: false },
    { title: 'Contract Expiry Warning', desc: 'TechSoft Inc — Expires in 15 days', priority: 'high' as const, days: 15, cta: 'View', ghost: true },
    { title: 'New User Request', desc: 'John Doe (Sales) requested access', priority: 'medium' as const, days: 5, cta: 'Approve', ghost: false },
    { title: 'Billing Issue Flagged', desc: 'Missing PO — INV-0198', priority: 'medium' as const, days: 3, cta: 'Fix', ghost: true },
  ];

  const filteredActions = actionTab === 'all' ? actionItems :
    actionTab === 'high' ? actionItems.filter(a => a.priority === 'high') :
      actionItems.filter(a => a.priority === 'medium');

  const getStageClass = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes('proposal')) return 'od-sl-prop';
    if (s.includes('negotiat')) return 'od-sl-neg';
    if (s.includes('discovery') || s.includes('qualif')) return 'od-sl-disc';
    if (s.includes('won') || s.includes('closed won')) return 'od-sl-won';
    if (s.includes('closed')) return 'od-sl-closed';
    return 'od-sl-disc';
  };

  const getValueColor = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes('proposal')) return 'od-vb-blue';
    if (s.includes('negotiat')) return 'od-vb-ind';
    if (s.includes('won')) return 'od-vb-grn';
    return 'od-vb-amb';
  };

  return (
    <>
      {/* TOP STRIP */}
      <div className="od-topstrip">
        <div className="od-breadcrumb">
          SISWIT &nbsp;/&nbsp; <span>Owner Dashboard</span>
        </div>
        <div className="od-topstrip-right">
          <NotificationBell />
          <ChatWidget />
          <span className="od-date-chip">{dateStr}</span>
          <div className="od-toggle-seg">
            <button className={`od-seg-btn ${timeRange === '6months' ? 'on' : ''}`} onClick={() => setTimeRange('6months')}>6M</button>
            <button className={`od-seg-btn ${timeRange === '12months' ? 'on' : ''}`} onClick={() => setTimeRange('12months')}>12M</button>
          </div>
          <button className="od-btn-ghost">↓ Export</button>
          <button className="od-btn-ink">Download Report</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="od-hero-section">
        <div className="od-hero-inner">
          <div>
            <div className="od-hero-title">
              OWNER<br />
              <span className="accent-word">COMMAND</span>
            </div>
            <div className="od-hero-sub">
              {companyName
                ? `${companyName} — Your full business picture: revenue, pipeline, contracts, and actions that need you right now.`
                : 'Your full business picture — revenue, pipeline, contracts, and actions that need you right now.'}
            </div>
          </div>

          <div className="od-hero-stats">
            <div className="od-hstat active-stat">
              <div className="od-hstat-val">{loading ? '...' : fmtShort(thisMonthRevenue)}</div>
              <div className="od-hstat-lbl">Revenue · This Month</div>
            </div>
            <div className="od-hstat">
              <div className="od-hstat-val">{loading ? '...' : fmtShort(pipelineOpenValue)}</div>
              <div className="od-hstat-lbl">Pipeline</div>
            </div>
            <div className="od-hstat">
              <div className="od-hstat-val">{loading ? '...' : activeContracts}</div>
              <div className="od-hstat-lbl">Contracts</div>
            </div>
            <div className="od-hstat">
              <div className="od-hstat-val" style={{ color: 'var(--accent2)' }}>4</div>
              <div className="od-hstat-lbl">Urgent Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="od-content">

        {/* METRIC ROW */}
        <div className="od-metrics-row">
          <div className="od-mcard od-mc-rev">
            <div className="od-mcard-label">Total Revenue</div>
            <div className="od-mcard-num">{loading ? <span className="od-skeleton od-skeleton-num" /> : fmtShort(thisMonthRevenue)}</div>
            <div className="od-mcard-change"><span className="od-chg-up">↑ 12.4%</span><span className="od-chg-meta">vs last month</span></div>
            <div className="od-mcard-deco">💰</div>
          </div>
          <div className="od-mcard od-mc-pipe">
            <div className="od-mcard-label">Pipeline Value</div>
            <div className="od-mcard-num">{loading ? <span className="od-skeleton od-skeleton-num" /> : fmtShort(pipelineOpenValue)}</div>
            <div className="od-mcard-change"><span className="od-chg-up">↑ 8.1%</span><span className="od-chg-meta">{topDeals.length} open deals</span></div>
            <div className="od-mcard-deco">📊</div>
          </div>
          <div className="od-mcard od-mc-inv">
            <div className="od-mcard-label">Open Invoices</div>
            <div className="od-mcard-num">{loading ? <span className="od-skeleton od-skeleton-num" /> : fmtShort(openInvoicesTotal)}</div>
            <div className="od-mcard-change"><span className="od-chg-warn">3 overdue</span><span className="od-chg-meta">need action</span></div>
            <div className="od-mcard-deco">🧾</div>
          </div>
          <div className="od-mcard od-mc-cont">
            <div className="od-mcard-label">Active Contracts</div>
            <div className="od-mcard-num">{loading ? <span className="od-skeleton od-skeleton-num" /> : activeContracts}</div>
            <div className="od-mcard-change"><span className="od-chg-up">↑ 5 new</span><span className="od-chg-meta">this month</span></div>
            <div className="od-mcard-deco">📄</div>
          </div>
        </div>

        {/* MAIN GRID — Chart + Actions */}
        <div className="od-main-grid">
          {/* Revenue Chart */}
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Revenue Trend</div>
                <div className="od-panel-subtitle">Monthly — last {timeRange === '6months' ? '6' : '12'} months</div>
              </div>
              <button className="od-panel-action">View Full Report →</button>
            </div>
            <div className="od-chart-body">
              {loading ? (
                <div className="od-skeleton od-skeleton-chart" />
              ) : chartData.length > 0 ? (
                <>
                  <div className="od-chart-area">
                    {chartData.map((d, i) => {
                      const pct = (d.total / chartMax) * 100;
                      const isNow = i === chartData.length - 1;
                      return (
                        <div className="od-bar-g" key={d.name}>
                          <div className="od-bar-t">
                            <div
                              className={`od-b-fill ${isNow ? 'is-now' : 'is-past'}`}
                              style={{ height: `${pct}%`, minHeight: '6px' }}
                            >
                              <div className="od-b-val">{fmtShort(d.total)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="od-chart-months">
                    {chartData.map((d, i) => (
                      <div key={d.name}>
                        <span className={`od-b-month ${i === chartData.length - 1 ? 'now' : ''}`}>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="od-empty">No revenue data available</div>
              )}
            </div>
          </div>

          {/* Action Required */}
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Action Required</div>
                <div className="od-panel-subtitle">{actionItems.length} items need your attention</div>
              </div>
            </div>
            <div className="od-action-seg">
              <button className={`od-aseg ${actionTab === 'all' ? 'on' : ''}`} onClick={() => setActionTab('all')}>All</button>
              <button className={`od-aseg ${actionTab === 'high' ? 'on' : ''}`} onClick={() => setActionTab('high')}>High</button>
              <button className={`od-aseg ${actionTab === 'medium' ? 'on' : ''}`} onClick={() => setActionTab('medium')}>Medium</button>
            </div>
            <div className="od-action-body">
              {filteredActions.map((item, idx) => (
                <div className="od-aitem" key={idx}>
                  <div className={`od-aitem-priority ${item.priority === 'high' ? 'od-pri-high' : 'od-pri-med'}`} />
                  <div className="od-aitem-content">
                    <div className="od-aitem-title">{item.title}</div>
                    <div className="od-aitem-desc">{item.desc}</div>
                    <div className="od-aitem-foot">
                      <span className={`od-pri-tag ${item.priority === 'high' ? 'od-pt-high' : 'od-pt-med'}`}>
                        {item.priority === 'high' ? 'High' : 'Med'}
                      </span>
                      <span className="od-days-tag">{item.days} days left</span>
                    </div>
                  </div>
                  <div className="od-aitem-cta">
                    <button className={`od-cta-btn ${item.ghost ? 'ghost' : ''}`}>{item.cta}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM GRID — Pipeline + Renewals */}
        <div className="od-bottom-grid">
          {/* Pipeline */}
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Pipeline · Top 5</div>
                <div className="od-panel-subtitle">By deal value</div>
              </div>
              <button className="od-panel-action">View CRM →</button>
            </div>
            {topDeals.length > 0 ? (
              <table className="od-tbl">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {topDeals.map((d, i) => (
                    <tr key={`${d.name || d.account_name}-${i}`}>
                      <td><strong>{d.name || d.account_name || 'Deal'}</strong></td>
                      <td>
                        <span className={`od-stage-lbl ${getStageClass(d.stage || '')}`}>
                          {d.stage || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`od-val-big ${getValueColor(d.stage || '')}`}>
                          {typeof d.value === 'number' ? fmtShort(d.value) : '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                        {d.close_date ? new Date(d.close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="od-empty">No pipeline data available</div>
            )}
          </div>

          {/* Renewals */}
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Contract Renewals</div>
                <div className="od-panel-subtitle">Expiring in 30 days</div>
              </div>
              <button className="od-panel-action">Manage →</button>
            </div>
            {renewals.length > 0 ? (
              <table className="od-tbl">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Expiry</th>
                    <th>Left</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.map((r, idx) => (
                    <tr key={`${r.account}-${idx}`}>
                      <td><strong>{r.account}</strong></td>
                      <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                        {r.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span className={`od-exp-lbl ${r.daysLeft <= 15 ? 'od-el-red' : r.daysLeft <= 25 ? 'od-el-amb' : 'od-el-grn'}`}>
                          {r.daysLeft}D
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="od-empty">No expiring contracts</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default OwnerDashboardPage;
