import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getMarketKpis, getMarketEvents } from '../api'

const gridStyle = { stroke: 'rgba(255,255,255,0.04)' }
const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }

const TREND_DATA = [
  { week: 'W1', lc300: 72, lx600: 58, prado: 65, patrol: 48 },
  { week: 'W2', lc300: 78, lx600: 62, prado: 68, patrol: 52 },
  { week: 'W3', lc300: 85, lx600: 65, prado: 70, patrol: 55 },
  { week: 'W4', lc300: 94, lx600: 68, prado: 72, patrol: 58 },
  { week: 'W5', lc300: 88, lx600: 70, prado: 75, patrol: 60 },
]
const SENTIMENT = [
  { brand: 'Toyota', score: 92 },
  { brand: 'Nissan', score: 78 },
  { brand: 'Lexus', score: 88 },
  { brand: 'Land Rover', score: 72 },
]

export default function MarketTrends() {
  const [kpis, setKpis] = useState<Record<string, number>>({})
  const [events, setEvents] = useState<Array<{ event_name: string; start_date: string; end_date: string; demand_multiplier: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMarketKpis(), getMarketEvents(12)])
      .then(([k, e]) => {
        setKpis(k)
        setEvents(e ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card">Loading…</div>

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--gold)', marginBottom: 3 }}>Market Trends & Economic Monitor</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Google Trends, oil, events, and brand sentiment</div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Google Trends — Top 4 models (index)</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
              <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="lc300" stroke="#f59e0b" strokeWidth={2} name="Land Cruiser 300" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="lx600" stroke="#3b82f6" strokeWidth={2} name="Lexus LX 600" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="prado" stroke="#22c55e" strokeWidth={2} name="Prado GXR" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="patrol" stroke="#a78bfa" strokeWidth={2} name="Nissan Patrol" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Land Cruiser 300', value: '↑ 94', sub: 'Rising 4 weeks', color: 'var(--gold)' },
          { label: 'Lexus LX 600', value: '↑ 70', sub: 'Stable', color: 'var(--blue)' },
          { label: 'Prado GXR', value: '↑ 75', sub: 'Peak interest', color: 'var(--green)' },
          { label: 'Nissan Patrol', value: '↑ 60', sub: 'Growing', color: 'var(--purple)' },
        ].map((t, i) => (
          <div key={i} className="card" style={{ borderLeft: `4px solid ${t.color}` }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: t.color }}>{t.value}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)' }}>{t.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Oil price tracker</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: (kpis.oil_price_usd ?? 0) > 85 ? 'var(--green)' : 'var(--gold)' }}>${kpis.oil_price_usd ?? 88}/bbl</div>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>{(kpis.oil_price_usd ?? 0) > 85 ? 'Above $85 — fleet demand signal' : 'Below peak'}</div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Upcoming events</div>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12 }}>
            {events.length === 0 ? <li style={{ color: 'var(--muted)' }}>No events in DB</li> : null}
            {events.slice(0, 5).map((e, i) => (
              <li key={i} style={{ marginBottom: 6 }}><strong>{e.event_name}</strong> — {e.start_date} (×{e.demand_multiplier})</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Social media sentiment by brand</div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SENTIMENT} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} horizontal={false} />
              <XAxis dataKey="brand" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="var(--gold)" name="Sentiment score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
