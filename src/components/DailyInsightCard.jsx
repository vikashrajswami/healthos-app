import { useState } from 'react'
import { getTodayInsight } from '../lib/insights'

export default function DailyInsightCard({ quizAnswers, onAskAbout }) {
  const insight = getTodayInsight(quizAnswers)
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0c4a4a 0%, #0a2e2e 100%)',
      borderRadius: 18,
      padding: '18px 18px 16px',
      marginBottom: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blur circle */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100,
        background: 'rgba(20,184,166,0.15)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          background: 'rgba(20,184,166,0.2)',
          borderRadius: 10, padding: '4px 10px',
          fontSize: 10, fontWeight: 800, color: '#5eead4',
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>
          Today's Insight
        </div>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Icon + Title */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{insight.icon}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.35 }}>
          {insight.title}
        </div>
      </div>

      {/* Body */}
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6,
        marginBottom: expanded ? 12 : 6,
        display: '-webkit-box',
        WebkitLineClamp: expanded ? 'unset' : 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {insight.body}
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(e => !e)} style={{
        background: 'none', border: 'none', padding: '0 0 10px',
        color: 'rgba(94,234,212,0.8)', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', display: 'block',
      }}>
        {expanded ? 'Show less ↑' : 'Read more ↓'}
      </button>

      {/* Action step */}
      <div style={{
        background: 'rgba(20,184,166,0.12)',
        border: '1px solid rgba(20,184,166,0.25)',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#5eead4', marginBottom: 3, letterSpacing: 0.5 }}>
            TODAY'S ACTION
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            {insight.action}
          </div>
        </div>
      </div>

      {/* Ask Health Guide */}
      {onAskAbout && (
        <button onClick={() => onAskAbout(`Tell me more about: ${insight.title}`)} style={{
          width: '100%', marginTop: 12,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '9px 14px',
          color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>💬</span>
          <span>Ask Health Guide about this topic →</span>
        </button>
      )}
    </div>
  )
}
