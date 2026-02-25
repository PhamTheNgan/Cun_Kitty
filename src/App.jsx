import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'

function App() {
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

    // Game Constants
    const WIN_SCORE = 25
    const LOSS_SCORE = -10
    const MAX_BOMBS = 25
    const BASE_SIZE = 40
    const GROWTH_RATE = 15
    const MAX_SPEED = 0.35 // Restricted top speed for smoothness
    const FRICTION = 0.92 // Damping factor for smooth stop
    const ACCELERATION = 0.04 // How fast it picks up speed

    const kittySize = Math.max(20, Math.min(BASE_SIZE + score * GROWTH_RATE, Math.min(window.innerWidth, window.innerHeight) / 2))

    // Refs for physics to ensure high performance and zero lag
    const posRef = useRef({ x: 50, y: 50 })
    const velRef = useRef({ x: 0, y: 0 })
    const targetRef = useRef(null) // Only set when clicking
    const keysPressed = useRef(new Set())

    useEffect(() => {
        const img = new Image()
        img.src = '/kitty.png'
        img.onload = () => setIsLoaded(true)
    }, [])

    const createParticles = useCallback((x, y, type) => {
        const count = type === 'win' ? 30 : 15
        const colors = type === 'eat' ? ['#ffea00', '#ff00ff', '#00ffff'] : ['#ff4d6d', '#ff758d', '#333']
        const newParticles = Array.from({ length: count }).map(() => ({
            id: Math.random(),
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            type
        }))
        setParticles(prev => [...prev, ...newParticles])
        setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 800)
    }, [])

    const triggerShake = () => {
        setScreenShake(true)
        setTimeout(() => setScreenShake(false), 300)
    }

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

    // High-performance movement loop
    useEffect(() => {
        if (!isLoaded || gameState !== 'playing') return

        const gameLoop = () => {
            let ax = 0
            let ay = 0

            // 1. Mouse Attraction (Smooth pull towards target)
            if (targetRef.current) {
                const dx = targetRef.current.x - posRef.current.x
                const dy = targetRef.current.y - posRef.current.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < 1) {
                    targetRef.current = null // Arrived
                } else {
                    ax += (dx / dist) * ACCELERATION
                    ay += (dy / dist) * ACCELERATION
                }
            }

            // 2. Keyboard Input (Direct acceleration)
            if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) ay -= ACCELERATION
            if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) ay += ACCELERATION
            if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) ax -= ACCELERATION
            if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) ax += ACCELERATION

            // 3. Physics update
            velRef.current.x = (velRef.current.x + ax) * FRICTION
            velRef.current.y = (velRef.current.y + ay) * FRICTION

            // Speed Cap for mượt mà
            const currentSpeed = Math.sqrt(velRef.current.x ** 2 + velRef.current.y ** 2)
            if (currentSpeed > MAX_SPEED) {
                velRef.current.x = (velRef.current.x / currentSpeed) * MAX_SPEED
                velRef.current.y = (velRef.current.y / currentSpeed) * MAX_SPEED
            }

            // Update Position
            posRef.current.x = Math.max(0, Math.min(100, posRef.current.x + velRef.current.x))
            posRef.current.y = Math.max(0, Math.min(100, posRef.current.y + velRef.current.y))

            // Sync with React State for rendering
            setPosition({ ...posRef.current })
            setIsMoving(currentSpeed > 0.05)

            // 4. Collisions
            if (checkCollision(posRef.current, food)) {
                createParticles(food.x, food.y, 'eat')
                setScore(s => {
                    if (s + 1 >= WIN_SCORE) setGameState('won')
                    return s + 1
                })
                setFood({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })
            }

            bombs.forEach(bomb => {
                if (checkCollision(posRef.current, bomb)) {
                    createParticles(bomb.x, bomb.y, 'bomb')
                    triggerShake()
                    setScore(s => {
                        if (s - 1 <= LOSS_SCORE) setGameState('lost')
                        return s - 1
                    })
                    setBombs(prev => {
                        const updated = prev.map(b => b.id === bomb.id ? { ...b, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 } : b)
                        if (prev.length >= MAX_BOMBS) return updated

                        const bombsToAdd = Math.min(2, MAX_BOMBS - prev.length)
                        const newBombs = Array.from({ length: bombsToAdd }).map(() => ({
                            id: Math.random(),
                            x: Math.random() * 80 + 10,
                            y: Math.random() * 80 + 10
                        }))
                        return [...updated, ...newBombs]
                    })
                }
            })
        }

        const interval = setInterval(gameLoop, 16)
        return () => clearInterval(interval)
    }, [isLoaded, gameState, food, bombs, checkCollision, createParticles])

    useEffect(() => {
        const down = (e) => keysPressed.current.add(e.key.toLowerCase())
        const up = (e) => keysPressed.current.delete(e.key.toLowerCase())
        window.addEventListener('keydown', down); window.addEventListener('keyup', up)
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); }
    }, [])

    return (
        <div className={`app-container ${isLoaded ? 'loaded' : ''} ${screenShake ? 'shake' : ''}`}
            onClick={(e) => {
                if (gameState !== 'playing') return
                targetRef.current = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 }
            }}>
            {!isLoaded && <div className="loading-screen">🎀 Magic Loading...</div>}

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
                            <img src="/kitty.png" alt="Kitty" />
                        </div>
                    </>
                )}
            </div>

            <div className="score-board">
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.max(0, (score - LOSS_SCORE) / (WIN_SCORE - LOSS_SCORE) * 100)}%` }}></div></div>
                <div>Score: {score} | Bombs: {bombs.length}</div>
            </div>

            {gameState !== 'playing' && (
                <div className="game-overlay">
                    <div className="overlay-content">
                        <h2>{gameState === 'won' ? '🎉 YOU WIN! 🎉' : '💀 GAME OVER 💀'}</h2>
                        <p>{gameState === 'won' ? 'Kitty is now a GIANT!' : 'Too many bombs...'}</p>
                        <button onClick={restartGame}>Play Again 🎀</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
