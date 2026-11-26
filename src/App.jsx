import { useEffect, useState } from 'react'
import AccountGate, { accountApi } from './components/AccountGate.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Analytics from './pages/Analytics.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import NewBet from './pages/NewBet.jsx'
import Profile from './pages/Profile.jsx'

const STORAGE_KEY = 'betiq-bets-v1'

export default function App() {
  return (
    <AccountGate>
      {(initial, onExit) => <Tracker key={initial.user.id} initial={initial} onExit={onExit} />}
    </AccountGate>
  )
}

function Tracker({ initial, onExit }) {
  const [snapshot, setSnapshot] = useState(initial)
  const { user, bets, revision } = snapshot
  const [isSaving, setIsSaving] = useState(false)
  const [problem, setProblem] = useState('')
  const [page, setPage] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBet, setEditingBet] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
    } catch {
      /* Sincronizado en cuenta */
    }
  }, [bets])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function persist(payload, onSuccess) {
    if (isSaving) return
    setIsSaving(true)

    accountApi({ ...payload, userId: user.id, revision })
      .then((next) => {
        if (next.user) {
          setSnapshot(next)
          setProblem('')
          if (onSuccess) onSuccess()
        } else {
          onExit()
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          onExit()
        } else {
          setProblem(err.message || 'No se pudieron guardar los cambios.')
        }
      })
      .then(() => {
        setIsSaving(false)
      })
  }

  const showToast = (message, previousBets = null) => {
    setToast({ message, previousBets, id: Date.now() })
  }

  const handleUndo = () => {
    if (toast && toast.previousBets) {
      persist({ action: 'bets', bets: toast.previousBets }, () => {
        setToast({ message: 'Acción deshecha.', previousBets: null, id: Date.now() })
      })
    }
  }

  const openNewBetModal = () => {
    setEditingBet(null)
    setIsModalOpen(true)
  }

  const openEditBetModal = (bet) => {
    setEditingBet(bet)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBet(null)
  }

  const saveBet = (betData) => {
    const previousBets = [...bets]
    const exists = bets.some((item) => item.id === betData.id)
    const nextBets = exists
      ? bets.map((item) => (item.id === betData.id ? betData : item))
      : [betData, ...bets]

    persist({ action: 'bets', bets: nextBets }, () => {
      showToast(exists ? 'Registro actualizado.' : 'Registro guardado en tu bitácora.', previousBets)
      closeModal()
    })
  }

  const updateStatus = (id, status) => {
    const target = bets.find((bet) => bet.id === id)
    if (!target || target.status === status) return
    const previousBets = [...bets]
    const nextBets = bets.map((bet) => (bet.id === id ? { ...bet, status } : bet))

    persist({ action: 'bets', bets: nextBets }, () => {
      showToast('Estado actualizado.', previousBets)
    })
  }

  const deleteBet = (id) => {
    const previousBets = [...bets]
    const nextBets = bets.filter((bet) => bet.id !== id)

    persist({ action: 'bets', bets: nextBets }, () => {
      showToast('Registro eliminado.', previousBets)
    })
  }

  return (
    <div className="app-shell">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="main-content">
        <Header page={page} onNewBet={openNewBetModal} />
        <div className="content-area">
          {page === 'dashboard' && (
            <Dashboard
              bets={bets}
              onNavigate={setPage}
              onEditBet={openEditBetModal}
              onUpdateStatus={updateStatus}
              onDelete={deleteBet}
            />
          )}
          {page === 'history' && (
            <History
              bets={bets}
              onUpdateStatus={updateStatus}
              onEditBet={openEditBetModal}
              onDelete={deleteBet}
              onNewBet={openNewBetModal}
            />
          )}
          {page === 'analytics' && <Analytics bets={bets} />}
          {page === 'profile' && (
            <Profile
              user={user}
              onLogout={() => persist({ action: 'logout' })}
              onSave={(alias) => {
                persist({ action: 'profile', alias }, () => {
                  showToast('Apodo guardado.')
                })
              }}
            />
          )}
        </div>
        <Footer />
      </main>
      {isModalOpen && (
        <NewBet
          initialBet={editingBet}
          onSave={saveBet}
          onCancel={closeModal}
        />
      )}
      {problem && (
        <div role="alert" className="account-notice">
          <span>{problem}</span>
          <button type="button" onClick={() => window.location.reload()}>Recargar</button>
        </div>
      )}
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        <span>{toast ? toast.message : ''}</span>
        {toast && toast.previousBets && (
          <button type="button" className="toast-undo" onClick={handleUndo}>
            Deshacer
          </button>
        )}
      </div>
    </div>
  )
}
