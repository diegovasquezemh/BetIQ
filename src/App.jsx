import { useEffect, useState } from 'react'
import AccountGate from './components/AccountGate.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Analytics from './pages/Analytics.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import NewBet from './pages/NewBet.jsx'
import Profile from './pages/Profile.jsx'
import {
  getActiveSession,
  logoutAccount,
  updateAccountAlias,
  updateAccountBets,
} from './utils/accountStorage.js'

const STORAGE_KEY = 'betiq-bets-v1'

export default function App() {
  const initialSession = getActiveSession()
  const [user, setUser] = useState(initialSession.user)
  const [bets, setBets] = useState(initialSession.bets)
  const [page, setPage] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBet, setEditingBet] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
    } catch {
      /* Almacenamiento local lleno o no disponible */
    }
  }, [user, bets])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function handleLogin(sessionData) {
    setUser(sessionData.user)
    setBets(sessionData.bets)
    setPage('dashboard')
  }

  function handleLogout() {
    logoutAccount()
    try {
      sessionStorage.removeItem('betiq-active-user')
    } catch {
      /* sessionStorage opcional */
    }
    setUser(null)
    setBets([])
    setPage('dashboard')
  }

  function saveBetsToStorage(nextBets) {
    setBets(nextBets)
    updateAccountBets(nextBets)
  }

  function showToast(message, previousBets = null) {
    setToast({ message: message, previousBets: previousBets })
  }

  function handleUndo() {
    if (toast && toast.previousBets) {
      saveBetsToStorage(toast.previousBets)
      setToast({ message: 'Acción deshecha.', previousBets: null })
    }
  }

  function openNewBetModal() {
    setEditingBet(null)
    setIsModalOpen(true)
  }

  function openEditBetModal(bet) {
    setEditingBet(bet)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingBet(null)
  }

  function saveBet(betData) {
    const previousBets = [...bets]
    const exists = bets.some((item) => item.id === betData.id)
    const nextBets = exists
      ? bets.map((item) => (item.id === betData.id ? betData : item))
      : [betData, ...bets]

    saveBetsToStorage(nextBets)
    showToast(exists ? 'Registro actualizado.' : 'Registro guardado en tu bitácora.', previousBets)
    closeModal()
  }

  function updateStatus(id, status) {
    const target = bets.find((bet) => bet.id === id)
    if (!target || target.status === status) return
    const previousBets = [...bets]
    const nextBets = bets.map((bet) => (bet.id === id ? { ...bet, status: status } : bet))

    saveBetsToStorage(nextBets)
    showToast('Estado actualizado.', previousBets)
  }

  function deleteBet(id) {
    const previousBets = [...bets]
    const nextBets = bets.filter((bet) => bet.id !== id)

    saveBetsToStorage(nextBets)
    showToast('Registro eliminado.', previousBets)
  }

  function handleSaveAlias(alias) {
    const updated = updateAccountAlias(alias)
    if (updated.user) {
      setUser(updated.user)
      showToast('Apodo guardado.')
    }
  }

  if (!user) {
    return <AccountGate onLogin={handleLogin} />
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
              onLogout={handleLogout}
              onSave={handleSaveAlias}
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
