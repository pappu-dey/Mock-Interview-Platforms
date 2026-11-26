/**
 * components/Tripa/Tripa.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Tripa" — Education AI Chatbot powered by Gemini 1.5 Flash
 *
 * • Only answers education-related questions (enforced via system prompt)
 * • API key is read from import.meta.env.VITE_GEMINI_API_KEY (hidden in .env)
 * • Floating FAB button → click opens full popup chat window
 * • Premium glassmorphism dark UI matching project design system
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { API_BASE_URL } from '../../config/apiConfig'
import './Tripa.css'

// ─── Config ────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL    = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// ─── System instruction — restricts Tripa to education topics only ─────────────
const SYSTEM_INSTRUCTION = `You are Tripa, a friendly and knowledgeable AI education assistant for the PrepPilot mock interview platform. Your role is to help students with education-related topics ONLY.

You CAN help with:
- Programming concepts (Java, Python, JavaScript, SQL, C++, etc.)
- Data structures & algorithms
- Computer science fundamentals (OS, DBMS, Networks, OOP)
- Aptitude & quantitative math
- Logical reasoning
- Interview preparation tips
- Career advice for tech roles
- Exam tips and study strategies
- Company interview processes (TCS, Infosys, Google, etc.)
- Resume and soft skills advice
- Explaining concepts with examples and code snippets

You CANNOT help with:
- Non-educational or unrelated topics (entertainment, politics, sports, personal issues, etc.)
- Anything outside education, tech, or career preparation

If a user asks something off-topic, politely decline and redirect them to ask something education-related. Keep responses concise, clear, and helpful. Use bullet points and code examples when relevant. Always be encouraging and supportive.`

// ─── Suggestion prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  '📐 Explain Big O notation',
  '☕ Java OOP concepts',
  '🗄️ SQL JOIN types',
  '🧠 Solve this aptitude problem',
  '🏢 TCS interview process',
  '📝 How to write a good resume',
  '🔁 What is recursion?',
  '🌐 Explain REST API',
]

// ─── Topic quick-access pills ──────────────────────────────────────────────────
const TOPICS = [
  { label: '💻 DSA',       prompt: 'Explain the most important Data Structures and Algorithms for interviews.' },
  { label: '☕ Java',      prompt: 'What are the key Java concepts I must know for tech interviews?' },
  { label: '🗄️ SQL',       prompt: 'Explain the most important SQL concepts for a fresher interview.' },
  { label: '📐 Aptitude',  prompt: 'Give me the most important aptitude topics for campus placement.' },
  { label: '🧠 Reasoning', prompt: 'What are the key logical reasoning topics for placement exams?' },
  { label: '🏢 Companies', prompt: 'What is the general interview process for top IT companies like TCS, Infosys and Wipro?' },
  { label: '📝 Resume',    prompt: 'How should a fresher write a strong tech resume?' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Render message text with basic markdown-like formatting */
function MessageText({ text }) {
  // Convert **bold**, `code`, and ```code blocks``` to HTML
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        // Code fence detection
        if (line.startsWith('```')) return null
        // Bullet points
        const isBullet = line.match(/^[\-\*]\s/)
        const clean = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/^[\-\*]\s/, '')
        return (
          <p
            key={i}
            style={{ margin: isBullet ? '2px 0' : '4px 0', paddingLeft: isBullet ? '12px' : 0, position: 'relative' }}
            dangerouslySetInnerHTML={{
              __html: (isBullet ? '• ' : '') + clean || '&nbsp;',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Main Tripa Component ──────────────────────────────────────────────────────
export default function Tripa() {
  const [open, setOpen]           = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showDot, setShowDot]     = useState(true)
  const [history, setHistory]     = useState([])   // Gemini multi-turn history

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const textareaRef    = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when popup opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300)
      setShowDot(false)
    }
  }, [open])

  // Auto-resize textarea
  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  // ── Call Gemini API (via gitignored backend key first, .env fallback) ───────
  const callGemini = useCallback(async (userText, currentHistory) => {
    try {
      const backendRes = await fetch(`${API_BASE_URL}/api/ai/tripa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: currentHistory,
          systemInstruction: SYSTEM_INSTRUCTION,
        }),
      })
      const backendData = await backendRes.json().catch(() => ({}))
      if (backendRes.ok && backendData.reply) {
        return backendData.reply
      }
      if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('<YOUR_')) {
        throw new Error(backendData.error || `API error ${backendRes.status}`)
      }
    } catch (backendErr) {
      if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('<YOUR_')) {
        throw backendErr
      }
    }

    // Fallback to VITE_GEMINI_API_KEY from gitignored .env
    const contents = [
      ...currentHistory,
      { role: 'user', parts: [{ text: userText }] },
    ]

    const body = {
      systemInstruction: {
        role: 'user',
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature:     0.7,
        topK:            40,
        topP:            0.95,
        maxOutputTokens: 1024,
      },
    }

    const res = await fetch(GEMINI_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API error ${res.status}`)
    }

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.'
  }, [])

  // ── Send a message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = {
      id:      Date.now(),
      role:    'user',
      text:    trimmed,
      time:    formatTime(new Date()),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const reply = await callGemini(trimmed, history)

      const botMsg = {
        id:    Date.now() + 1,
        role:  'bot',
        text:  reply,
        time:  formatTime(new Date()),
      }
      setMessages(prev => [...prev, botMsg])

      // Update multi-turn history
      setHistory(prev => [
        ...prev,
        { role: 'user',  parts: [{ text: trimmed }] },
        { role: 'model', parts: [{ text: reply }] },
      ])
    } catch (err) {
      const errMsg = {
        id:    Date.now() + 1,
        role:  'bot',
        text:  `❌ ${err.message || 'Something went wrong. Please try again.'}`,
        time:  formatTime(new Date()),
        error: true,
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [loading, history, callGemini])

  // ── Keyboard handler ─────────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearChat() {
    setMessages([])
    setHistory([])
    textareaRef.current?.focus()
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Popup Chat Window ──────────────────────────────────────────────── */}
      {open && (
        <div className={`tripa-popup ${isFullScreen ? 'full-screen' : ''}`} role="dialog" aria-label="Tripa AI Chatbot">
          {/* Header */}
          <div className="tripa-header">
            <div className="tripa-avatar">
              🎓
              <div className="tripa-avatar__status" />
            </div>
            <div className="tripa-header__info">
              <div className="tripa-header__name">Tripa</div>
              <div className="tripa-header__sub">✨ Education AI · Always here to help</div>
            </div>
            <div className="tripa-header__actions">
              <button
                className="tripa-header__btn"
                title="Clear chat"
                onClick={clearChat}
                id="tripa-clear-btn"
              >
                🗑️
              </button>
              <button
                className="tripa-header__btn"
                title={isFullScreen ? "Exit full screen" : "Full screen"}
                onClick={() => setIsFullScreen(fs => !fs)}
                id="tripa-fullscreen-btn"
              >
                {isFullScreen ? '🗗' : '⛶'}
              </button>
              <button
                className="tripa-header__btn close"
                title="Close"
                onClick={() => setOpen(false)}
                id="tripa-close-btn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Topic Pills */}
          <div className="tripa-topics">
            {TOPICS.map((t, i) => (
              <button
                key={i}
                className="tripa-topic-pill"
                onClick={() => sendMessage(t.prompt)}
                disabled={loading}
                id={`tripa-topic-${i}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="tripa-messages" id="tripa-messages">
            {messages.length === 0 && (
              <div className="tripa-welcome">
                <div className="tripa-welcome__icon">🎓</div>
                <h3>Hi, I'm Tripa!</h3>
                <p>
                  Your personal AI education assistant. Ask me anything about
                  programming, aptitude, interviews, or your career — I'm here to help!
                </p>
                <div className="tripa-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="tripa-suggestion"
                      onClick={() => sendMessage(s.replace(/^[^\w]+/, ''))}
                      id={`tripa-suggestion-${i}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`tripa-msg ${msg.role}`}>
                <div className="tripa-msg__avatar">
                  {msg.role === 'bot' ? '🎓' : '👤'}
                </div>
                <div className="tripa-msg__content">
                  <div className={`tripa-msg__bubble ${msg.error ? 'error' : ''}`}>
                    <MessageText text={msg.text} />
                  </div>
                  <div className="tripa-msg__time">{msg.time}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="tripa-typing">
                <div className="tripa-typing__avatar">🎓</div>
                <div className="tripa-typing__dots">
                  <div className="tripa-dot" />
                  <div className="tripa-dot" />
                  <div className="tripa-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="tripa-input-area">
            <div className="tripa-input-row">
              <textarea
                ref={textareaRef}
                className="tripa-input"
                id="tripa-input"
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  autoResize(e.target)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything educational… (Enter to send)"
                rows={1}
                disabled={loading}
              />
              <button
                className="tripa-send-btn"
                id="tripa-send-btn"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                title="Send (Enter)"
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
            <div className="tripa-input-footer">
              <span>🔒 Education topics only · Shift+Enter for new line</span>
              {messages.length > 0 && (
                <button className="tripa-clear-btn" onClick={clearChat}>
                  Clear chat ↺
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ─────────────────────────────────────────── */}
      <div className="tripa-fab" id="tripa-fab">
        <button
          className={`tripa-fab__btn ${open ? 'open' : ''}`}
          id="tripa-fab-btn"
          onClick={() => setOpen(o => !o)}
          title={open ? 'Close Tripa' : 'Open Tripa — Education AI'}
          aria-label="Tripa Education Chatbot"
        >
          {showDot && !open && <span className="tripa-fab__dot" />}
          <span className="tripa-fab__icon">{open ? '✕' : '🎓'}</span>
        </button>
        {!open && <span className="tripa-fab__label">Tripa AI</span>}
      </div>
    </>
  )
}
