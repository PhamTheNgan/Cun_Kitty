import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import kittyImg from '/kitty.png'
import KittyMiner from './KittyMiner'
import Game3D from './Game3D'
import ArmyShooter from './ArmyShooter'

function App() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    // App screen: 'login' | 'menu' | 'game' | 'miner'
    const [screen, setScreen] = useState(isLocal ? 'menu' : 'login')
    const [showProfile, setShowProfile] = useState(false)
    const [totalPoints, setTotalPoints] = useState(() => parseInt(localStorage.getItem('kitty_points') || '0'))
    const [checkinToast, setCheckinToast] = useState('')
    const [showCheckinPopup, setShowCheckinPopup] = useState(false)
    const [checkinOptions, setCheckinOptions] = useState([])
    const [avatar, setAvatar] = useState(() => localStorage.getItem('kitty_avatar') || '')
    const avatarInputRef = useRef(null)

    const generateNganVariations = () => {
        const withDiacritics = ['n', 'g', 'â', 'n']
        const withoutDiacritics = ['n', 'g', 'a', 'n']
        const makeVariation = () => {
            const useDiacritics = Math.random() > 0.5
            const letters = useDiacritics ? [...withDiacritics] : [...withoutDiacritics]
            return letters.map(c => Math.random() > 0.5 ? c.toUpperCase() : c).join('')
        }
        const set = new Set()
        while (set.size < 3) set.add(makeVariation())
        return [...set]
    }

    // Login
    const [birthDay, setBirthDay] = useState('')
    const [birthMonth, setBirthMonth] = useState('')
    const [birthYear, setBirthYear] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loginShake, setLoginShake] = useState(false)

    const addPoints = (amount) => {
        setTotalPoints(prev => {
            const updated = Math.max(0, prev + amount)
            localStorage.setItem('kitty_points', String(updated))
            return updated
        })
    }

    const handleCheckinAnswer = () => {
        localStorage.setItem('kitty_last_checkin', new Date().toDateString())
        addPoints(100)
        setShowCheckinPopup(false)
        setCheckinToast('✨ Điểm danh thành công: +100 điểm!')
        setTimeout(() => setCheckinToast(''), 3000)
    }

    const handleLogin = () => {
        if (birthDay === '24' && birthMonth === '9' && birthYear === '2001') {
            setLoginError('')
            setCheckinOptions(generateNganVariations())
            setShowCheckinPopup(true)
            setScreen('menu')
        } else {
            setLoginError('nhầm mấc tiêu goy')
            setLoginShake(true)
            setTimeout(() => setLoginShake(false), 500)
        }
    }

    const handleLogout = () => {
        setBirthDay(''); setBirthMonth(''); setBirthYear('')
        setShowProfile(false)
        setScreen('login')
    }

    // Game states
    const [position, setPosition] = useState({ x: 50, y: 50 })
    const [food, setFood] = useState({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })
    const [bombs, setBombs] = useState(() =>
        Array.from({ length: 5 }).map(() => ({
            id: Math.random(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10
        }))
    )
    const [score, setScore] = useState(0)
    const [particles, setParticles] = useState([])
    const [gameState, setGameState] = useState('playing')
    const [screenShake, setScreenShake] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isMoving, setIsMoving] = useState(false)

    const WIN_SCORE = 25
    const LOSS_SCORE = -10
    const MAX_BOMBS = 25
    const BASE_SIZE = 40
    const GROWTH_RATE = 15
    const MAX_SPEED = 0.35
    const FRICTION = 0.92
    const ACCELERATION = 0.04

    const kittySize = Math.max(20, Math.min(BASE_SIZE + score * GROWTH_RATE, Math.min(window.innerWidth, window.innerHeight) / 2))

    const posRef = useRef({ x: 50, y: 50 })
    const velRef = useRef({ x: 0, y: 0 })
    const targetRef = useRef(null)
    const keysPressed = useRef(new Set())

    useEffect(() => {
        const img = new Image()
        img.src = kittyImg
        img.onload = () => setIsLoaded(true)
    }, [])

    const createParticles = useCallback((x, y, type) => {
        const count = type === 'win' ? 30 : 15
        const colors = type === 'eat' ? ['#ffea00', '#ff00ff', '#00ffff'] : ['#ff4d6d', '#ff758d', '#333']
        const newParticles = Array.from({ length: count }).map(() => ({
            id: Math.random(), x, y,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360, type
        }))
        setParticles(prev => [...prev, ...newParticles])
        setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 800)
    }, [])

    const triggerShake = () => { setScreenShake(true); setTimeout(() => setScreenShake(false), 300) }

    const checkCollision = useCallback((pos, objPos) => {
        const dx = (pos.x - objPos.x) * (window.innerWidth / 100)
        const dy = (pos.y - objPos.y) * (window.innerHeight / 100)
        return Math.sqrt(dx * dx + dy * dy) < (kittySize / 2) + 12
    }, [kittySize])

    const restartGame = () => {
        setScore(0)
        setBombs(Array.from({ length: 5 }).map(() => ({ id: Math.random(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })))
        posRef.current = { x: 50, y: 50 }
        velRef.current = { x: 0, y: 0 }
        targetRef.current = null
        setGameState('playing')
    }

    const goBackToMenu = () => {
        restartGame()
        setScreen('menu')
    }

    useEffect(() => {
        if (!isLoaded || gameState !== 'playing' || screen !== 'game') return
        const gameLoop = () => {
            let ax = 0, ay = 0
            if (targetRef.current) {
                const dx = targetRef.current.x - posRef.current.x
                const dy = targetRef.current.y - posRef.current.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 1) targetRef.current = null
                else { ax += (dx / dist) * ACCELERATION; ay += (dy / dist) * ACCELERATION }
            }
            if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) ay -= ACCELERATION
            if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) ay += ACCELERATION
            if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) ax -= ACCELERATION
            if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) ax += ACCELERATION
            velRef.current.x = (velRef.current.x + ax) * FRICTION
            velRef.current.y = (velRef.current.y + ay) * FRICTION
            const currentSpeed = Math.sqrt(velRef.current.x ** 2 + velRef.current.y ** 2)
            if (currentSpeed > MAX_SPEED) {
                velRef.current.x = (velRef.current.x / currentSpeed) * MAX_SPEED
                velRef.current.y = (velRef.current.y / currentSpeed) * MAX_SPEED
            }
            posRef.current.x = Math.max(0, Math.min(100, posRef.current.x + velRef.current.x))
            posRef.current.y = Math.max(0, Math.min(100, posRef.current.y + velRef.current.y))
            setPosition({ ...posRef.current })
            setIsMoving(currentSpeed > 0.05)
            if (checkCollision(posRef.current, food)) {
                createParticles(food.x, food.y, 'eat')
                setScore(s => { if (s + 1 >= WIN_SCORE) setGameState('won'); return s + 1 })
                setFood({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })
            }
            bombs.forEach(bomb => {
                if (checkCollision(posRef.current, bomb)) {
                    createParticles(bomb.x, bomb.y, 'bomb'); triggerShake()
                    setScore(s => { if (s - 1 <= LOSS_SCORE) setGameState('lost'); return s - 1 })
                    setBombs(prev => {
                        const updated = prev.map(b => b.id === bomb.id ? { ...b, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 } : b)
                        if (prev.length >= MAX_BOMBS) return updated
                        const toAdd = Math.min(2, MAX_BOMBS - prev.length)
                        return [...updated, ...Array.from({ length: toAdd }).map(() => ({ id: Math.random(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }))]
                    })
                }
            })
        }
        const interval = setInterval(gameLoop, 16)
        return () => clearInterval(interval)
    }, [isLoaded, gameState, screen, food, bombs, checkCollision, createParticles])

    useEffect(() => {
        const down = (e) => keysPressed.current.add(e.key.toLowerCase())
        const up = (e) => keysPressed.current.delete(e.key.toLowerCase())
        window.addEventListener('keydown', down); window.addEventListener('keyup', up)
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
    }, [])

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const dataUrl = ev.target.result
            localStorage.setItem('kitty_avatar', dataUrl)
            setAvatar(dataUrl)
        }
        reader.readAsDataURL(file)
    }

    // ========== USER INFO BAR (shown on menu & game) ==========
    const userInfoBar = (
        <div className="user-bar">
            <div className="user-avatar" onClick={() => setShowProfile(!showProfile)}>
                {avatar ? <img src={avatar} alt="avatar" /> : '🐱'}
            </div>
            <span className="user-name" onClick={() => setShowProfile(!showProfile)}>Player 🎀</span>
            <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} />
            {showProfile && (
                <div className="profile-dropdown">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {avatar ? <img src={avatar} alt="avatar" /> : '🐱'}
                            <button className="avatar-edit-btn" onClick={() => avatarInputRef.current?.click()}>✏️</button>
                        </div>
                        <span>Cún Kitty</span>
                    </div>
                    <div className="profile-info">
                        <p><strong>Ngày sinh:</strong> 24/09/2001</p>
                        <p><strong>Level:</strong> Người chơi bí ẩn 🌸</p>
                        <p><strong>🏆 Tổng điểm:</strong> <span style={{ color: '#ff4d6d', fontSize: '1.1rem' }}>{totalPoints}</span></p>
                    </div>
                    {!isLocal && <button className="logout-btn" onClick={handleLogout}>Đăng xuất 👋</button>}
                </div>
            )}
        </div>
    )

    // ========== LOGIN SCREEN ==========
    if (screen === 'login') {
        return (
            <div className="login-screen">
                <div className={`login-box ${loginShake ? 'shake' : ''}`}>
                    <div className="login-icon">🎀</div>
                    <h2>hãy chọn ngày tháng năm sinh của bạn để vào chơi ẩn nhé =)))</h2>
                    <div className="date-selects">
                        <div className="select-group">
                            <label>Ngày</label>
                            <select value={birthDay} onChange={(e) => { setBirthDay(e.target.value); setLoginError('') }} className="date-select">
                                <option value="">--</option>
                                {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}
                            </select>
                        </div>
                        <div className="select-group">
                            <label>Tháng</label>
                            <select value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setLoginError('') }} className="date-select">
                                <option value="">--</option>
                                {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].map((m, i) => <option key={i + 1} value={String(i + 1)}>{m}</option>)}
                            </select>
                        </div>
                        <div className="select-group">
                            <label>Năm</label>
                            <select value={birthYear} onChange={(e) => { setBirthYear(e.target.value); setLoginError('') }} className="date-select">
                                <option value="">--</option>
                                {Array.from({ length: 40 }, (_, i) => <option key={2010 - i} value={String(2010 - i)}>{2010 - i}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleLogin} className="login-btn">Vào chơi 🎮</button>
                    {loginError && <p className="login-error">{loginError}</p>}
                </div>
            </div>
        )
    }

    // ========== MENU SCREEN ==========
    if (screen === 'menu') {
        return (
            <div className="menu-screen">
                {userInfoBar}
                {checkinToast && <div className="checkin-toast">{checkinToast}</div>}
                <div className="menu-content">
                    <h1 className="menu-title">🎀 Kitty Game Zone 🎀</h1>
                    <p className="menu-subtitle">🏆 Tổng điểm: {totalPoints} | Chọn game để chơi nào!</p>
                    <div className="game-list">
                        <div className="game-card" onClick={() => { restartGame(); setScreen('game'); }}>
                            <div className="game-card-icon">🐱</div>
                            <div className="game-card-info">
                                <h3>Kitty Ăn Táo</h3>
                                <p>Điều khiển Kitty ăn táo, né bom, to lên thật lớn!</p>
                                <span className="game-card-badge">🎮 Chơi ngay</span>
                            </div>
                        </div>
                        <div className="game-card" onClick={() => setScreen('miner')}>
                            <div className="game-card-icon">⛏️</div>
                            <div className="game-card-info">
                                <h3>Đào Kitty</h3>
                                <p>Thả móc câu đào các Kitty dưới biển nhớ!</p>
                                <span className="game-card-badge">⛏️ Chơi ngay</span>
                            </div>
                        </div>
                        <div className="game-card" onClick={() => setScreen('game3')}>
                            <div className="game-card-icon">🐍</div>
                            <div className="game-card-info">
                                <h3>Rắn Không Gian 3D</h3>
                                <p>Khám phá không gian vô định và ánh sáng neon!</p>
                                <span className="game-card-badge">🌟 Quẩy lunn</span>
                            </div>
                        </div>
                        <div className="game-card" onClick={() => setScreen('army')}>
                            <div className="game-card-icon">🚀</div>
                            <div className="game-card-info">
                                <h3>Đại Pháo Bắn Mèo</h3>
                                <p>Căn lực bắn, tính gió và càn quét kẻ thù đi nào!</p>
                                <span className="game-card-badge">💥 Ngắm Bắn</span>
                            </div>
                        </div>
                    </div>
                </div>

                {showCheckinPopup && (
                    <div className="checkin-overlay">
                        <div className="checkin-popup">
                            <div className="checkin-popup-icon">💕</div>
                            <h2>Điểm danh hàng ngày</h2>
                            <p className="checkin-question">Tên người iu của cậu là gì?</p>
                            <div className="checkin-answers">
                                {checkinOptions.map((opt, i) => (
                                    <button key={i} onClick={handleCheckinAnswer}>{opt}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ========== MINER SCREEN ==========
    if (screen === 'miner') {
        return (
            <KittyMiner
                onBack={() => setScreen('menu')}
                onFinish={(pts) => { addPoints(pts); setScreen('menu'); }}
                avatar={avatar}
            />
        )
    }

    // ========== GAME3 SCREEN ==========
    if (screen === 'game3') {
        return (
            <Game3D
                onBack={() => setScreen('menu')}
                onFinish={(pts) => { addPoints(pts); setScreen('menu'); }}
            />
        )
    }

    // ========== ARMY SHOOTER SCREEN ==========
    if (screen === 'army') {
        return (
            <ArmyShooter
                onBack={() => setScreen('menu')}
                onFinish={(pts) => { addPoints(pts); setScreen('menu'); }}
                avatar={avatar}
            />
        )
    }

    // ========== GAME SCREEN ==========
    return (
        <div className={`app-container ${isLoaded ? 'loaded' : ''} ${screenShake ? 'shake' : ''}`}
            onClick={(e) => {
                if (gameState !== 'playing') return
                targetRef.current = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 }
            }}>
            {!isLoaded && <div className="loading-screen">🎀 Magic Loading...</div>}

            {userInfoBar}
            <button className="back-to-menu-btn" onClick={goBackToMenu}>← Menu</button>

            <div className="game-world">
                {isLoaded && (
                    <>
                        <div className="food-item" style={{ left: `${food.x}%`, top: `${food.y}%` }}>🍎</div>
                        {bombs.map(bomb => <div key={bomb.id} className="bomb-item" style={{ left: `${bomb.x}%`, top: `${bomb.y}%` }}>💣</div>)}
                        {particles.map(p => (
                            <div key={p.id} className="particle" style={{
                                left: `${p.x}%`, top: `${p.y}%`,
                                backgroundColor: p.color, width: p.size, height: p.size,
                                transform: `translate(${p.vx * 40}px, ${p.vy * 40}px) rotate(${p.rotation}deg)`
                            }} />
                        ))}
                        <div className={`player-kitty ${isMoving ? 'moving' : ''}`} style={{
                            left: `${position.x}%`, top: `${position.y}%`,
                            width: `${kittySize}px`, height: `${kittySize}px`,
                            transform: `translate(-50%, -50%)`
                        }}>
                            <img src={kittyImg} alt="Kitty" />
                        </div>
                    </>
                )}
            </div>

            <div className="score-board">
                <span>Score: {score}</span>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.max(0, (score - LOSS_SCORE) / (WIN_SCORE - LOSS_SCORE) * 100)}%` }}></div></div>
                <span>💣 {bombs.length}</span>
            </div>

            {gameState !== 'playing' && (
                <div className="game-overlay">
                    <div className="overlay-content">
                        <h2>{gameState === 'won' ? '🎉 YOU WIN! 🎉' : '💀 GAME OVER 💀'}</h2>
                        <p>{gameState === 'won' ? 'Kitty is now a GIANT! +100 điểm 🏆' : 'Too many bombs... -50 điểm 😢'}</p>
                        <button onClick={() => { if (gameState === 'won') addPoints(100); else addPoints(-50); restartGame(); }}>Play Again 🎀</button>
                        <button onClick={() => { if (gameState === 'won') addPoints(100); else addPoints(-50); goBackToMenu(); }} style={{ marginLeft: '10px', background: '#888' }}>Menu 🏠</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
