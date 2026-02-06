import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Compass,
  Users,
  UserCircle,
  Wallet,
  Send,
  ChevronRight,
  FileText,
  TrendingUp,
  Award,
  Settings,
  Bell,
  FileJson,
  Sparkles
} from 'lucide-react'
import './index.css'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// --- Reusable UI Components ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" } : {}}
    className={`glass-premium ${className}`}
  >
    {children}
  </motion.div>
)

const BackgroundElements = () => (
  <div className="bg-elements" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
    <div className="bg-orb orb-1" />
    <div className="bg-orb orb-2" />
    <div className="grid-overlay" style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
      backgroundSize: '40px 40px',
      opacity: 0.5
    }} />
  </div>
)

// --- Main App Component ---

function App() {
  const [wallet, setWallet] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [onboarding, setOnboarding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [vScore, setVScore] = useState(0)

  // Learning Portal Dynamic States
  const [curriculum, setCurriculum] = useState({})
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [noteContent, setNoteContent] = useState('Select a chapter to start learning.')

  // Tab States
  const [doubtText, setDoubtText] = useState('')
  const [chat, setChat] = useState([])
  const [skills, setSkills] = useState([])
  const [matches, setMatches] = useState([])
  const [guidance, setGuidance] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: '', role: 'School Student', level: '10', department: '', interests: []
  })

  // Converter States
  const [converterResult, setConverterResult] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [textInput, setTextInput] = useState('')

  // Journal & Quiz States
  const [activeQuiz, setActiveQuiz] = useState(null) // { entryId, questions }
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null) // { total_score, overall_feedback }
  const [journalEntries, setJournalEntries] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [manualInterestInput, setManualInterestInput] = useState('')
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  // 1. MetaMask Auth
  const connectWallet = async () => {
    setLoading(true)
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install the MetaMask extension.")
        setLoading(false)
        return
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      setWallet(address)

      const res = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, signature: 'verified' })
      })
      const data = await res.json()
      setUser(data.user)
      setProfileForm({
        name: data.user.name || '',
        role: data.user.role || 'School Student',
        level: data.user.level || '10',
        department: data.user.department || '',
        interests: data.user.interests || []
      })

      if (data.onboarding_complete === 0) setOnboarding(true)
      else {
        fetchUserData(address)
        fetchJournalEntries(address)
        fetchSuggestions(address)
      }

    } catch (err) {
      console.error(err)
      if (err.code === 4001) alert("Connection rejected!")
    }
    setLoading(false)
  }

  const logout = () => {
    setWallet(null); setUser(null); setChat([]); setSkills([]); setDepartmentGuidance(null); setRoleGuidance(null); setVScore(0); setActiveTab('Dashboard'); setJournalEntries([])
  }

  const [departmentGuidance, setDepartmentGuidance] = useState(null)
  const [roleGuidance, setRoleGuidance] = useState(null)
  const [guidanceLoading, setGuidanceLoading] = useState(null)

  const fetchGuidance = async (type) => {
    setGuidanceLoading(type)
    try {
      const endpoint = type === 'dept' ? '/guidance/department' : '/guidance/role'
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet })
      })
      const data = await res.json()
      if (type === 'dept') setDepartmentGuidance(data)
      else setRoleGuidance(data)
    } catch (e) {
      console.error(e)
    } finally {
      setGuidanceLoading(null)
    }
  }

  const fetchUserData = async (address) => {
    try {
      const res = await fetch(`${API_BASE}/get-user-data/${address}`)
      const data = await res.json()
      setUser(data.profile)
      setSkills(data.skills)
      setVScore(data.v_score || 0)
      loadCurriculum(data.profile.level)
    } catch (err) { console.error(err) }
  }

  const fetchJournalEntries = async (address) => {
    try {
      const res = await fetch(`${API_BASE}/journal/entries/${address}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setJournalEntries(data)
        } else {
          setJournalEntries([])
        }
      } else {
        setJournalEntries([])
      }
    } catch (err) {
      console.error(err)
      setJournalEntries([])
    }
  }

  const fetchSuggestions = async (address, manualInterest = null) => {
    if (!address) return
    setSuggestionsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, manual_interest: manualInterest })
      })
      const data = await res.json()
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const loadCurriculum = async (classVal) => {
    try {
      const res = await fetch(`${API_BASE}/get-curriculum/${classVal}`)
      const data = await res.json()
      setCurriculum(data)
      const firstSubj = Object.keys(data)[0]
      if (firstSubj) {
        setSelectedSubject(firstSubj)
        setSelectedChapter(data[firstSubj][0])
      }
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (selectedSubject && selectedChapter && user) fetchNoteContent()
  }, [selectedSubject, selectedChapter])

  useEffect(() => {
    if (activeTab === 'Suggestions' && wallet && suggestions.length === 0) {
      fetchSuggestions(wallet)
    }
  }, [activeTab, wallet])

  const fetchNoteContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-note-content?class_val=${user.level}&subject=${selectedSubject}&chapter=${selectedChapter}`)
      const data = await res.json()
      setNoteContent(data.content)
    } catch (err) { console.error(err) }
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/update-profile?wallet_address=${wallet}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })
      const data = await res.json()
      setUser(data.user); setOnboarding(false); setIsEditing(false); loadCurriculum(data.user.level)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const askDoubt = async () => {
    if (!doubtText) return
    const currentText = doubtText; setDoubtText(''); setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/solve-doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet, query: currentText, class_val: user.level, subject: selectedSubject, chapter: selectedChapter
        })
      })
      const data = await res.json()
      setChat(prev => [...prev, { role: 'user', text: currentText, bot: data.answer }])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const getGuidance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/get-career-guidance?wallet_address=${wallet}`, { method: 'POST' })
      const data = await res.json()
      setGuidance(data.recommendation)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // Converter Functions
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('wallet_address', wallet)

    try {
      const res = await fetch(`${API_BASE}/converter/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setConverterResult(data.data)
        if (data.quiz) {
          setActiveQuiz({ entryId: data.entry_id, questions: data.quiz })
          setQuizAnswers(new Array(data.quiz.length).fill(''))
        }
        fetchJournalEntries(wallet)
      } else {
        alert(`Error: ${data.error || 'Conversion failed'}`)
      }
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please try again.')
    }
    setLoading(false)
    e.target.value = '' // Reset file input
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = async () => {
          const base64Audio = reader.result

          setLoading(true)
          try {
            const res = await fetch(`${API_BASE}/converter/live-voice`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet_address: wallet, audio: base64Audio })
            })
            const data = await res.json()
            if (data.success) {
              setConverterResult(data.data)
              if (data.quiz) {
                setActiveQuiz({ entryId: data.entry_id, questions: data.quiz })
                setQuizAnswers(new Array(data.quiz.length).fill(''))
              }
              fetchJournalEntries(wallet)
            } else {
              const errorMsg = data.error || data.detail || 'Voice conversion failed'
              if (errorMsg.toLowerCase().includes('ffmpeg')) {
                alert('⚠️ FFmpeg Required\n\nTo use live voice recording, please install FFmpeg:\n\nmacOS: brew install ffmpeg\n\nAlternatively, use File Upload or Text Input features which work without FFmpeg!')
              } else {
                alert(`Error: ${errorMsg}`)
              }
            }
          } catch (err) {
            console.error(err)
            const errorMsg = err.message || 'Voice processing failed'
            if (errorMsg.toLowerCase().includes('ffmpeg')) {
              alert('⚠️ FFmpeg Required\n\nTo use live voice recording, please install FFmpeg:\n\nmacOS: brew install ffmpeg\n\nAlternatively, use File Upload or Text Input features!')
            } else {
              alert('Voice processing failed. Please try again.')
            }
          }
          setLoading(false)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.error(err)
      alert('Microphone access denied or not available.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleTextConversion = async () => {
    if (!textInput.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/converter/text-input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet, text: textInput })
      })
      const data = await res.json()
      if (data.success) {
        setConverterResult(data.data)
        if (data.quiz) {
          setActiveQuiz({ entryId: data.entry_id, questions: data.quiz })
          setQuizAnswers(new Array(data.quiz.length).fill(''))
        }
        setTextInput('')
        fetchJournalEntries(wallet)
      } else {
        alert(`Error: ${data.error || 'Text conversion failed'}`)
      }
    } catch (err) {
      console.error(err)
      alert('Text processing failed. Please try again.')
    }
    setLoading(false)
  }

  const submitQuiz = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/journal/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          entry_id: activeQuiz.entryId,
          answers: quizAnswers
        })
      })
      const data = await res.json()
      setQuizResult(data)
      fetchUserData(wallet)
      fetchJournalEntries(wallet)
    } catch (err) {
      console.error(err)
      alert('Quiz submission failed.')
    }
    setLoading(false)
  }

  const resetQuiz = () => {
    setActiveQuiz(null)
    setQuizAnswers([])
    setQuizResult(null)
  }

  const copyToClipboard = () => {
    if (converterResult) {
      navigator.clipboard.writeText(JSON.stringify(converterResult, null, 2))
      alert('JSON copied to clipboard!')
    }
  }

  const downloadJSON = () => {
    if (converterResult) {
      const blob = new Blob([JSON.stringify(converterResult, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `converted_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (activeTab === 'Learn') scrollToBottom()
  }, [chat, activeTab])

  // --- Render Functions ---

  if (!wallet) return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <BackgroundElements />

      {/* 3D Decorative Shape */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.6, pointerEvents: 'none' }}>
        <div className="scene-3d">
          <div className="cube">
            <div className="cube-face cube-face-front">PROOF</div>
            <div className="cube-face cube-face-back">SKILL</div>
            <div className="cube-face cube-face-right">DATA</div>
            <div className="cube-face cube-face-left">CODE</div>
            <div className="cube-face cube-face-top">AI</div>
            <div className="cube-face cube-face-bottom">WEB3</div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="hero glass-premium"
        style={{
          padding: '60px',
          borderRadius: '24px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          backdropFilter: 'blur(40px)',
          background: 'rgba(5, 5, 7, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 100px rgba(0, 242, 255, 0.1)'
        }}
      >
        <h1 className="font-heading" style={{ fontSize: '64px', marginBottom: '16px', letterSpacing: '-2px', position: 'relative', display: 'inline-block' }}>
          <span className="primary-gradient-text" style={{ textShadow: '0 0 40px rgba(0, 242, 255, 0.5)' }}>VECTOR</span>
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
          The Decentralized <span style={{ color: 'var(--primary)' }}>Proof-of-Skill Protocol</span>.<br />
          Your immutable on-chain GPA for the new age of intelligence.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 242, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          style={{
            background: 'var(--primary)',
            color: '#000',
            border: 'none',
            padding: '18px 48px',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Initialize Protocol
        </motion.button>

        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>10k+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Identities</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>AI</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Verified</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>Web3</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Secured</div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  if (onboarding || isEditing) return (
    <div className="onboarding-page">
      <BackgroundElements />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium onboarding-card"
      >
        <h2 className="font-heading" style={{ marginBottom: '32px', fontSize: '28px' }}>
          {onboarding ? 'Initialize Identity' : 'Secure Updates'}
        </h2>
        <div className="input-group">
          <label>Full Name</label>
          <input className="neo-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
        </div>
        <div className="input-group">
          <label>Career Trajectory</label>
          <select className="neo-input" value={profileForm.role} onChange={e => setProfileForm({ ...profileForm, role: e.target.value })}>
            <option>School Student</option>
            <option>College Student</option>
            <option>Early Professional</option>
          </select>
        </div>
        <div className="input-group">
          <label>Academic Milestone</label>
          <select className="neo-input" value={profileForm.level} onChange={e => setProfileForm({ ...profileForm, level: e.target.value })}>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>
        <div className="input-group">
          <label>Interests (Skill Clusters)</label>
          <input className="neo-input" value={profileForm.interests.join(', ')} placeholder="AI, Crypto, Design..." onChange={e => setProfileForm({ ...profileForm, interests: e.target.value.split(',').map(s => s.trim()) })} />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button className="neo-button" style={{ flexGrow: 1 }} onClick={saveProfile}>
            {loading ? 'Authenticating...' : 'Commit Changes'}
          </button>
          {!onboarding && (
            <button className="neo-button" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)' }} onClick={() => setIsEditing(false)}>
              Back
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )

  const SidebarItem = ({ id, label, icon: Icon }) => (
    <div
      className={`nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span>{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="active-pill"
          className="active-indicator"
          style={{ position: 'absolute', right: 0, width: '4px', height: '60%', background: 'var(--primary)', borderRadius: '4px 0 0 4px' }}
        />
      )}
    </div>
  )

  return (
    <div className="app-container">
      <BackgroundElements />

      <aside className="sidebar">
        <div className="logo font-heading" onClick={() => setActiveTab('Dashboard')} style={{ cursor: 'pointer' }}>
          <span>V</span>ECTOR
        </div>

        <nav className="nav-section">
          <SidebarItem id="Dashboard" label="Terminal" icon={LayoutDashboard} />
          <SidebarItem id="Learn" label="Deep Learning" icon={BookOpen} />
          <SidebarItem id="Skill Score" label="Verification" icon={ShieldCheck} />
          <SidebarItem id="Guidance" label="Career Oracle" icon={Compass} />
          <SidebarItem id="Converter" label="Data Converter" icon={FileJson} />
          <SidebarItem id="Journal" label="Learning Diary" icon={BookOpen} />
          <SidebarItem id="Suggestions" label="Opportunities" icon={Sparkles} />
          <SidebarItem id="Network" label="Synapse" icon={Users} />
          <SidebarItem id="Profile" label="Identity" icon={UserCircle} />
        </nav>

        <GlassCard className="passport-mini" hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar">{user?.name && user.name[0]}</div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Explorer'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>V-INDEX {vScore}</div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <Settings size={14} />
            </button>
          </div>
        </GlassCard>

        <button className="neo-button logout-btn" style={{
          background: 'rgba(239, 68, 68, 0.05)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }} onClick={logout}>
          DISCONNECT
        </button>
      </aside>

      <div className="main-wrapper">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 className="font-heading">{activeTab}</h1>
            <div className="breadcrumb" style={{ fontSize: '12px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '20px' }}>
              Vector // Mainframe // {activeTab}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="score-badge">
              V-INDEX: {vScore}
            </div>
            <Bell size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
          </div>
        </header>

        <main className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              {/* AI Quiz Overlay */}
              <AnimatePresence>
                {activeQuiz && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                      className="glass-premium" style={{ width: '90%', maxWidth: '600px', padding: '40px' }}
                    >
                      {!quizResult ? (
                        <>
                          <h2 className="font-heading" style={{ marginBottom: '8px' }}>Learning Verification</h2>
                          <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>The AI detected new knowledge signals. Confirm your mastery to earn points.</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {activeQuiz.questions.map((q, idx) => (
                              <div key={idx} className="input-group">
                                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Question {idx + 1}</label>
                                <p style={{ margin: '8px 0 16px', fontSize: '16px' }}>{q.question}</p>
                                <textarea
                                  className="neo-input"
                                  style={{ height: '80px', resize: 'none' }}
                                  placeholder="Your explanation..."
                                  value={quizAnswers[idx]}
                                  onChange={(e) => {
                                    const newAns = [...quizAnswers]
                                    newAns[idx] = e.target.value
                                    setQuizAnswers(newAns)
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                            <button className="neo-button" style={{ flexGrow: 1 }} onClick={submitQuiz} disabled={loading}>
                              {loading ? 'Evaluating...' : 'Verify Mastery'}
                            </button>
                            <button className="neo-button" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={resetQuiz}>
                              Dismiss
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{quizResult.total_score >= 80 ? '🎯' : '💪'}</div>
                          <h2 className="font-heading">Evaluation Complete</h2>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', margin: '16px 0' }}>
                            Score: {quizResult.total_score}%
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                            <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{quizResult.overall_feedback}</p>
                            <div style={{ marginTop: '16px', color: 'var(--accent)', fontWeight: 'bold' }}>
                              + {quizResult.points_earned} V-Index Growth
                            </div>
                          </div>
                          <button className="neo-button" style={{ width: '100%' }} onClick={resetQuiz}>
                            Continue to Terminal
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'Dashboard' && (
                <div className="dashboard-grid">
                  <GlassCard className="stat-card">
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Rating</div>
                    <div className="score-value v-index">{vScore}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '12px' }}>
                      <TrendingUp size={14} /> Higher than 92% of peers
                    </div>
                  </GlassCard>

                  <GlassCard className="stat-card">
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Skills</div>
                    <div className="score-value">{skills.filter(s => s.status === 'Verified' || s.status === 'Partially Verified').length}</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{skills.length} Pending authentications</p>
                  </GlassCard>

                  <GlassCard className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Award size={24} color="var(--primary)" />
                    </div>
                    <h4 style={{ fontSize: '16px' }}>Genesis Member</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Early Adopter Badge Active</p>
                  </GlassCard>

                  <div style={{ gridColumn: 'span 3', display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <GlassCard style={{ flex: 1, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                      <h3 className="font-heading" style={{ fontSize: '18px', marginBottom: '8px' }}>🚀 Academic Stream Path</h3>
                      {departmentGuidance ? (
                        <div className="animate-pulse">
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                            {departmentGuidance.department}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                            {departmentGuidance.reasoning}
                          </p>
                          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            Electives: <span style={{ color: 'var(--text-secondary)' }}>{departmentGuidance.electives?.join(', ')}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                            Based on your {journalEntries.length} diary logs, let AI suggest the best stream for 11th grade.
                          </p>
                          <button
                            className="neo-button"
                            onClick={() => fetchGuidance('dept')}
                            disabled={guidanceLoading === 'dept'}
                          >
                            {guidanceLoading === 'dept' ? 'ANALYZING...' : 'SUGGEST DEPARTMENT'}
                          </button>
                        </div>
                      )}
                    </GlassCard>

                    <GlassCard style={{ flex: 1, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--secondary)' }}></div>
                      <h3 className="font-heading" style={{ fontSize: '18px', marginBottom: '8px' }}>🔮 Future Role Predictor</h3>
                      {roleGuidance ? (
                        <div className="animate-pulse">
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>
                            {roleGuidance.role}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                            {roleGuidance.reasoning}
                          </p>
                          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            Skill Gap: <span style={{ color: 'var(--text-secondary)' }}>{roleGuidance.skills_gap?.join(', ')}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                            Extrapolate your current learning trajectory to find your ideal future job role.
                          </p>
                          <button
                            className="neo-button"
                            onClick={() => fetchGuidance('role')}
                            disabled={guidanceLoading === 'role'}
                            style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)' }}
                          >
                            {guidanceLoading === 'role' ? 'PREDICTING...' : 'SUGGEST ROLE'}
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  </div>

                  <GlassCard className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px' }}>Recent Learning Diary</h3>
                      <button onClick={() => setActiveTab('Journal')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>VIEW FULL DIARY</button>
                    </div>
                    <div className="feed-mini">
                      {Array.isArray(journalEntries) && journalEntries.length > 0 ? (
                        journalEntries.slice(0, 3).map((e, i) => (
                          <div key={i} style={{
                            padding: '16px',
                            borderBottom: i !== journalEntries.length - 1 ? '1px solid var(--border)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{e.heading}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(e.timestamp).toLocaleDateString()} | Earned {e.points_earned} Points</div>
                            </div>
                            <ChevronRight size={16} color="var(--text-dim)" />
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                          No diary logs yet. Convert some learning material to begin.
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'Learn' && (
                <div className="learning-grid">
                  <GlassCard className="notes-view" hover={false}>
                    <div className="selectors" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                      <select className="neo-input" style={{ flexGrow: 1 }} value={selectedSubject} onChange={e => {
                        const subj = e.target.value;
                        setSelectedSubject(subj);
                        if (curriculum[subj] && curriculum[subj].length > 0) {
                          setSelectedChapter(curriculum[subj][0]);
                        }
                      }}>
                        {Object.keys(curriculum).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="neo-input" style={{ flexGrow: 1 }} value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}>
                        {curriculum[selectedSubject]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="notes-content-scroll">
                      <h2 style={{ fontSize: '32px', marginBottom: '24px', background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {selectedChapter}
                      </h2>
                      <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                        {noteContent}
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard className="bot-view" hover={false}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                      <h3 style={{ fontSize: '16px' }}>Neural Tutor</h3>
                    </div>
                    <div className="chat-area">
                      {chat.map((m, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div className="chat-bubble user-bubble">{m.text}</div>
                          <div className="chat-bubble bot-bubble">{m.bot}</div>
                        </div>
                      ))}
                      {loading && <div className="chat-bubble bot-bubble">Synthesizing...</div>}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="chat-input-wrapper">
                      <input
                        className="neo-input"
                        value={doubtText}
                        onChange={e => setDoubtText(e.target.value)}
                        placeholder="Inquire further..."
                        onKeyPress={e => e.key === 'Enter' && askDoubt()}
                      />
                      <button className="neo-button" onClick={askDoubt} style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Send size={18} />
                      </button>
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'Skill Score' && (
                <div className="skill-section" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
                  <GlassCard className="skill-form-advanced" hover={false}>
                    <h3 className="font-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>Asset Authentication</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '32px' }}>Verify your intellectual property and skill mastery.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="input-group"><label>Skill Domain</label><input className="neo-input" placeholder="e.g. Neural Networks" id="s-name" /></div>
                      <div className="input-group">
                        <label>Identity Proof (Certificate)</label>
                        <div style={{ position: 'relative' }}>
                          <input type="file" id="s-file" style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                          <div className="neo-input" style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', background: 'rgba(255,255,255,0.05)' }}>
                            <FileText size={16} /> Choose File
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '10px' }}>
                      <label>Contextual Details</label>
                      <textarea className="neo-input" style={{ height: '80px', resize: 'none' }} placeholder="Provide specific achievements or curriculum highlights..." id="s-cert-text"></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                      <div className="input-group"><label>Source Artifact (Github/Portolio)</label><input className="neo-input" placeholder="github.com/archive" id="s-project" /></div>
                      <div className="input-group">
                        <label>Intensity Level</label>
                        <select className="neo-input" id="s-effort">
                          <option value="low">Self-guided</option>
                          <option value="medium">Structured Learning</option>
                          <option value="high">Intensive Mastery</option>
                        </select>
                      </div>
                    </div>

                    <button className="neo-button" style={{ width: '100%', marginTop: '32px', padding: '16px' }} onClick={async () => {
                      setLoading(true); const formData = new FormData();
                      formData.append('wallet_address', wallet);
                      formData.append('skill_name', document.getElementById('s-name').value);
                      formData.append('category', 'Technical');
                      formData.append('project_info', document.getElementById('s-project').value);
                      formData.append('effort', document.getElementById('s-effort').value);
                      formData.append('cert_text', document.getElementById('s-cert-text').value);
                      const fileInput = document.getElementById('s-file');
                      if (fileInput.files[0]) formData.append('certificate_file', fileInput.files[0]);
                      try {
                        const res = await fetch(`${API_BASE}/submit-skill`, { method: 'POST', body: formData });
                        const result = await res.json();
                        alert(`AUDIT RESULT: ${result.verification_status}\nScore: ${result.verification_score}%\n\nReason: ${result.reason}`);
                        fetchUserData(wallet);
                      } catch (e) { console.error(e); }
                      setLoading(false);
                    }}>
                      {loading ? 'Initializing Audit Protocol...' : 'COMMIT TO VECTOR'}
                    </button>
                  </GlassCard>

                  <div className="verification-log-feed">
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} color="var(--primary)" /> Synced Artifacts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {skills.slice().reverse().map(s => (
                        <GlassCard key={s.id} className="skill-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Skill</div>
                              <div style={{ fontWeight: 700, fontSize: '15px' }}>{s.skill_name}</div>
                            </div>
                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '18px' }}>{s.score}%</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`status-pill ${s.status.toLowerCase() === 'verified' ? 'verified' : 'pending'}`}>
                              {s.status}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              {s.proof_type}
                            </span>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Guidance' && (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <GlassCard className="guidance-view" hover={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                      <div>
                        <h3 className="font-heading" style={{ fontSize: '28px' }}>The Oracle</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>AI-Synthesized career roadmap based on your unique V-Index.</p>
                      </div>
                      <button className="neo-button" onClick={getGuidance} disabled={loading}>
                        {loading ? 'Consulting Synapses...' : 'Generate Roadmap'}
                      </button>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      padding: '32px',
                      borderRadius: '24px',
                      border: '1px solid var(--border)',
                      lineHeight: '1.7',
                      fontSize: '15px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {guidance || "Oracle idle. Ready to process your skill identity for growth trajectory."}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'Converter' && (
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    {/* File Upload Card */}
                    <GlassCard hover={false}>
                      <h3 className="font-heading" style={{ fontSize: '20px', marginBottom: '16px' }}>📁 File Upload</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                        Convert MP3, WAV, PDF, JPG, PNG to structured JSON
                      </p>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="file"
                          id="converter-file"
                          onChange={handleFileUpload}
                          accept=".mp3,.wav,.m4a,.flac,.pdf,.jpg,.jpeg,.png,.bmp"
                          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                        />
                        <div className="neo-input" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          pointerEvents: 'none',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '40px',
                          textAlign: 'center',
                          border: '2px dashed var(--border)'
                        }}>
                          <FileText size={24} />
                          <span>Drop file or click to browse</span>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Live Voice Card */}
                    <GlassCard hover={false}>
                      <h3 className="font-heading" style={{ fontSize: '20px', marginBottom: '16px' }}>🎤 Live Voice</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                        Record and transcribe live audio to JSON
                      </p>
                      <button
                        className="neo-button"
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{
                          width: '100%',
                          padding: '40px',
                          background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-glow)',
                          border: isRecording ? '2px solid #ef4444' : '2px solid var(--primary)',
                          color: isRecording ? '#ef4444' : 'var(--primary)'
                        }}
                      >
                        {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
                      </button>
                    </GlassCard>
                  </div>

                  {/* Text Input Card */}
                  <GlassCard hover={false} style={{ marginBottom: '24px' }}>
                    <h3 className="font-heading" style={{ fontSize: '20px', marginBottom: '16px' }}>✍️ Manual Diary Entry</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                      Tell us what you learned today (e.g. "I watched 2 ML videos...")
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <textarea
                        className="neo-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Today I learned..."
                        style={{ flexGrow: 1, height: '120px', resize: 'vertical' }}
                      />
                      <button
                        className="neo-button"
                        onClick={handleTextConversion}
                        disabled={!textInput.trim() || loading}
                        style={{ padding: '0 32px' }}
                      >
                        Log Activity
                      </button>
                    </div>
                  </GlassCard>

                  {/* Results Display */}
                  {converterResult && (
                    <GlassCard hover={false}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="font-heading" style={{ fontSize: '20px' }}>📊 Conversion Result</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="neo-button" onClick={copyToClipboard} style={{ fontSize: '12px', padding: '8px 16px' }}>
                            📋 Copy
                          </button>
                          <button className="neo-button" onClick={downloadJSON} style={{ fontSize: '12px', padding: '8px 16px' }}>
                            💾 Download
                          </button>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '13px',
                        lineHeight: '1.6'
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(converterResult, null, 2)}
                        </pre>
                      </div>

                      {/* Quick Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>Content Type</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>
                            {converterResult.content_type || 'N/A'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>Word Count</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent)' }}>
                            {converterResult.word_count || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>Processing Method</div>
                          <div style={{ fontSize: '16px', fontWeight: '700' }}>
                            {converterResult.processing_method || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
                      <div className="animate-float" style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
                      <h3>Processing your data...</h3>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Journal' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Array.isArray(journalEntries) && journalEntries.map((e, idx) => (
                      <GlassCard key={idx} hover={false} className="journal-entry">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {e.content_type} Log // {new Date(e.timestamp).toLocaleDateString()}
                            </div>
                            <h2 className="font-heading" style={{ fontSize: '24px', margin: '4px 0' }}>{e.heading}</h2>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>+{e.points_earned}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>V-POINTS earned</div>
                          </div>
                        </div>

                        <p style={{
                          color: 'var(--text-secondary)',
                          lineHeight: '1.6',
                          fontSize: '15px',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border)',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis'
                        }}>
                          {e.content}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                          {(e.extracted_topics || []).map((t, tidx) => (
                            <span key={tidx} style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', fontSize: '11px', fontWeight: 'bold' }}>
                              #{t.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </GlassCard>
                    ))}
                    {Array.isArray(journalEntries) && journalEntries.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <BookOpen size={48} style={{ color: 'var(--border)', marginBottom: '20px' }} />
                        <h3 style={{ color: 'var(--text-dim)' }}>Your Learning Diary is Empty</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Switch to the Converter tab to log your first learning activity.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Suggestions' && (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <GlassCard style={{ marginBottom: '32px', padding: '32px' }}>
                    <h2 className="font-heading" style={{ fontSize: '24px', marginBottom: '16px' }}>V-Matchmaker Opportunity Engine</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
                      Our AI analyzes your Learning Diary topics to find the perfect hackathons, events, and projects for your growth.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="Add a manual interest (e.g., 'Web3 Security', 'Generative Art')..."
                        value={manualInterestInput}
                        onChange={(e) => setManualInterestInput(e.target.value)}
                        className="glass-input"
                        style={{ flexGrow: 1 }}
                      />
                      <button
                        className={`neo-button primary ${suggestionsLoading ? 'loading' : ''}`}
                        onClick={() => fetchSuggestions(wallet, manualInterestInput)}
                        disabled={suggestionsLoading}
                      >
                        {suggestionsLoading ? 'SCANNING WEB...' : 'REFRESH OPPORTUNITIES'}
                      </button>
                    </div>
                  </GlassCard>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {suggestionsLoading ? (
                      <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px 0' }}>
                        <div className="spinner" style={{
                          width: '50px',
                          height: '50px',
                          border: '4px solid rgba(255,255,255,0.1)',
                          borderTop: '4px solid var(--primary)',
                          borderRadius: '50%',
                          margin: '0 auto 24px auto',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <h3 className="animate-pulse">Accessing Neural Search...</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Scanning Unstop, LinkedIn, and Devfolio for the latest opportunities.</p>
                      </div>
                    ) : (
                      <>
                        {suggestions.map((s, idx) => (
                          <GlassCard key={idx} className="opportunity-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'var(--primary-glow)',
                                border: '1px solid var(--primary)',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}>{s.type}</span>
                              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>{s.reward}</span>
                            </div>

                            <h3 className="font-heading" style={{ fontSize: '18px', marginBottom: '12px' }}>{s.title}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-dim)', flexGrow: 1, marginBottom: '20px', lineHeight: '1.5' }}>
                              {s.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                DIFFICULTY: <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{s.difficulty?.toUpperCase()}</span>
                              </div>
                              <a
                                href={s.link || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="neo-button"
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '12px',
                                  textDecoration: 'none',
                                  textAlign: 'center'
                                }}
                              >
                                APPLY NOW
                              </a>
                            </div>
                          </GlassCard>
                        ))}
                        {suggestions.length === 0 && (
                          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>
                            <div className="animate-float" style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                            <h3>Scanning for opportunities...</h3>
                            <p style={{ color: 'var(--text-dim)' }}>Keep logging your learning activities to help the AI match you better.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Network' && (
                <div className="network-grid">
                  {matches.length > 0 ? matches.map(m => (
                    <GlassCard key={m.userId} className="peer-card">
                      <div className="avatar" style={{ margin: '0 auto 16px', width: '60px', height: '60px' }}>{m.name[0]}</div>
                      <h4>{m.name}</h4>
                      <div className="match-score" style={{ marginTop: '12px', fontSize: '20px' }}>{m.score * 100}% Fit</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Compatible Growth Mindset</div>
                      <button className="neo-button tiny" style={{ marginTop: '20px', width: '100%', fontSize: '11px' }}>CONNECT</button>
                    </GlassCard>
                  )) : (
                    <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '100px 0' }}>
                      <Users size={48} style={{ color: 'var(--border)', marginBottom: '20px' }} />
                      <h3 style={{ color: 'var(--text-dim)' }}>Scanning for Peer Connections...</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '10px' }}>Synchronize your skills to reveal your professional network.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Profile' && (
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                  <GlassCard className="profile-view" hover={false}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
                      <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '32px' }}>{user?.name && user.name[0]}</div>
                      <div>
                        <h2 className="font-heading" style={{ fontSize: '32px' }}>{user?.name}</h2>
                        <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>Genesis Identity #8192</div>
                      </div>
                    </div>

                    <div className="wallet-box" style={{
                      background: 'rgba(0, 242, 255, 0.05)',
                      border: '1px solid var(--primary-glow)',
                      padding: '20px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Wallet size={16} color="var(--primary)" />
                      {wallet}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '40px' }}>
                      <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>Global V-Index</label>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{vScore}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>Academic Pillar</label>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>{user?.level}th Standard</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '1px' }}>Current Protocol</label>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>{user?.role}</div>
                      </div>
                    </div>

                    <button className="neo-button" style={{ marginTop: '48px', width: '100%' }} onClick={() => setIsEditing(true)}>
                      Modify Digital Identity
                    </button>
                  </GlassCard>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div >
  )
}

export default App
