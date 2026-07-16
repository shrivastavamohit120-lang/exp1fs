import { useState } from 'react'
import { ToastProvider } from './hooks/useToast.jsx'
import { useDrafts } from './hooks/useDrafts'
import PostComposer from './components/PostComposer'
import DraftList from './components/DraftList'
import './App.css'

function AppShell() {
  const { drafts, saveDraft, deleteDraft, saving } = useDrafts()
  const [editingDraft, setEditingDraft] = useState(null)

  return (
    <div className="app">
      <header className="hero">
        <span className="hero__eyebrow">Unit 1 · Experiment 1</span>
        <h1 className="hero__title">
          One draft. <span className="hero__title-accent">Every platform's rules.</span>
        </h1>
        <p className="hero__sub">
          Twitter counts every character. LinkedIn gives you room to think. Instagram wants the
          hook before the fold. Write once here, and the gauge tells you exactly where you stand.
        </p>
      </header>

      <main className="layout">
        <PostComposer
          saveDraft={saveDraft}
          saving={saving}
          editingDraft={editingDraft}
          onDoneEditing={() => setEditingDraft(null)}
        />
        <DraftList drafts={drafts} onEdit={setEditingDraft} onDelete={deleteDraft} />
      </main>

      <footer className="footer">
        Drafts persist to your browser's localStorage — refresh freely, nothing is lost.
      </footer>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}

export default App
