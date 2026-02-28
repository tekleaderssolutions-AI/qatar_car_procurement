import { Routes, Route, NavLink } from 'react-router-dom'
import MarketHub from './pages/MarketHub'
import InventoryHealth from './pages/InventoryHealth'
import PricingTool from './pages/PricingTool'
import MarketTrends from './pages/MarketTrends'
import BuyerMatcher from './pages/BuyerMatcher'
import AIAdvisor from './pages/AIAdvisor'
import CompetitorPrices from './pages/CompetitorPrices'

const nav = [
  { to: '/', label: 'Market Hub', icon: '📊' },
  { to: '/inventory', label: 'Inventory', icon: '🏪' },
  { to: '/pricing', label: 'Pricing Tool', icon: '💰' },
  { to: '/competitors', label: 'Competitors', icon: '⚔️' },
  { to: '/trends', label: 'Trends', icon: '📈' },
  { to: '/matching', label: 'Buyer Matcher', icon: '🤝' },
  { to: '/chat', label: 'AI Advisor', icon: '🤖' },
]

export default function App() {
  return (
    <div style={{ fontFamily: 'var(--font)', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Nav — same as qatar_dashboard.html */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1020, #0f1729)',
        borderBottom: '1px solid rgba(245,158,11,0.18)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}>🚗</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--gold)', letterSpacing: '0.05em' }}>QAUTO-AI</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Qatar Used Car Intelligence</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, flex: 1, justifyContent: 'center' }}>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '7px 12px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: isActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: isActive ? '#080e1c' : 'var(--dim)',
                textDecoration: 'none',
              })}
            >
              <span style={{ marginRight: 4 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 20,
          padding: '5px 12px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 7px var(--green)' }} />
          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      <div style={{ padding: '22px 24px' }}>
        <Routes>
          <Route path="/" element={<MarketHub />} />
          <Route path="/inventory" element={<InventoryHealth />} />
          <Route path="/pricing" element={<PricingTool />} />
          <Route path="/competitors" element={<CompetitorPrices />} />
          <Route path="/trends" element={<MarketTrends />} />
          <Route path="/matching" element={<BuyerMatcher />} />
          <Route path="/chat" element={<AIAdvisor />} />
        </Routes>
      </div>
    </div>
  )
}
