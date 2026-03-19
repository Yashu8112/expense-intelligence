import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../services/api'
import { X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react'

export default function AiChatbot({ onClose }) {
  const [messages, setMessages] = useState([{
    role:'ASSISTANT',
    content:"Hi! I'm FinBot 👋 I can help you understand your spending, find savings opportunities, and answer questions about your finances. What would you like to know?",
    timestamp:new Date().toISOString(),
  }])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => { inputRef.current?.focus() }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role:'USER', content:text, timestamp:new Date().toISOString() }])
    setLoading(true)
    try {
      const res = await aiAPI.chat({ message:text, sessionId })
      const d   = res.data.data
      if (!sessionId) setSessionId(d.sessionId)
      setMessages(m => [...m, { role:d.role, content:d.content, timestamp:d.timestamp }])
    } catch(e) {
      setMessages(m => [...m, { role:'ASSISTANT', content:"I'm having trouble connecting right now. Please try again in a moment.", timestamp:new Date().toISOString() }])
    } finally { setLoading(false) }
  }

  const QUICK = ["What's my biggest expense this month?","How can I reduce my spending?","Show my top categories","Any unusual transactions?"]

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_60px_-12px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 ai-gradient flex-shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-white text-sm">FinBot</p>
          <p className="text-blue-100 text-[11px]">AI Financial Assistant</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-80 scrollbar-hide">
        {messages.map((msg,i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role==='USER' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role==='USER' ? 'bg-blue-600' : 'ai-gradient'}`}>
              {msg.role==='USER' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role==='USER'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full ai-gradient flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1.5">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {QUICK.map((q,i) => (
            <button key={i} onClick={() => setInput(q)}
              className="text-[11px] px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors border border-blue-100 dark:border-blue-900">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2 flex-shrink-0">
        <input ref={inputRef} type="text" placeholder="Ask FinBot anything..."
          className="input-field flex-1 py-2 text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
          disabled={loading} />
        <button onClick={sendMessage} disabled={!input.trim()||loading} className="btn btn-primary p-2 rounded-xl disabled:opacity-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
