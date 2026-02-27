import { useEffect, useState, useRef, useCallback } from 'react'
import './KittyMiner.css'

const GAME_WIDTH = 1200
const GAME_HEIGHT = 800
const HOOK_ORIGIN = { x: 600, y: 80 }
const ROPE_BASE_LEN = 30
const SWING_SPEED = 0.025
const DROP_SPEED = 4
const REEL_SPEED = 2.5 // harder to pull
const GAME_TIME = 45
const TARGET_SCORE = 600

import kittyImgSrc from '/kitty.png'
import kittyImg1Src from '/kitty_1.png'
import kittyImg2Src from '/kitty_2.png'

const ITEM_TYPES = [
    { type: 'kitty', size: 60, points: 50, weight: 1.2, speed: 0.35 },
    { type: 'kitty', size: 75, points: 100, weight: 1.5, speed: 0.5 },
    { type: 'kitty', size: 90, points: 30, weight: 2.2, speed: 0.25 },
    { type: 'kitty', size: 45, points: 200, weight: 0.8, speed: 0.8 },
    { type: 'bomb', emoji: '💣', size: 40, points: -100, weight: 3.5, speed: 0 }
]

function generateItems() {
    const items = []
    // 16 Kitties
    for (let i = 0; i < 16; i++) {
        const typeInfo = ITEM_TYPES[Math.floor(Math.random() * 4)]
        items.push({
            id: i,
            x: 40 + Math.random() * (GAME_WIDTH - 80),
            y: 160 + Math.random() * (GAME_HEIGHT - 200),
            ...typeInfo,
            vx: typeInfo.speed * (Math.random() > 0.5 ? 1 : -1),
            imgIdx: Math.floor(Math.random() * 3), // 0, 1, or 2
            flip: false,
            caught: false,
        })
    }
    // 10 Bombs (increased difficulty)
    for (let i = 0; i < 10; i++) {
        items.push({
            id: 16 + i,
            x: 50 + Math.random() * (GAME_WIDTH - 100),
            y: 160 + Math.random() * (GAME_HEIGHT - 200),
            ...ITEM_TYPES[4],
            vx: 0,
            flip: false,
            caught: false,
        })
    }
    return items
}

export default function KittyMiner({ onBack, onFinish, avatar }) {
    const canvasRef = useRef(null)
    const avatarImgRef = useRef(null)
    const [gameState, setGameState] = useState('playing') // playing | won | lost
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_TIME)
    const itemsRef = useRef(generateItems())
    const [particles, setParticles] = useState([])
    const kittyImgRef = useRef(null)
    const kittyImg1Ref = useRef(null)
    const kittyImg2Ref = useRef(null)
    const [isExploding, setIsExploding] = useState(false)
    const [showRules, setShowRules] = useState(false)

    // Hook state
    const hookRef = useRef({
        angle: 0, // current swing angle (radians)
        dir: 1,
        state: 'swinging', // swinging | dropping | reeling
        length: ROPE_BASE_LEN,
        caughtItem: null,
        tipX: HOOK_ORIGIN.x,
        tipY: HOOK_ORIGIN.y + ROPE_BASE_LEN,
    })

    const scoreRef = useRef(0)

    // Timer
    useEffect(() => {
        if (gameState !== 'playing' || showRules) return
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState(scoreRef.current >= TARGET_SCORE ? 'won' : 'lost')
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [gameState, showRules])

    // Load avatar & kitty images
    useEffect(() => {
        if (avatar) {
            const img = new Image()
            img.src = avatar
            img.onload = () => { avatarImgRef.current = img }
        }
        const kImg = new Image()
        kImg.src = kittyImgSrc
        kImg.onload = () => { kittyImgRef.current = kImg }

        const kImg1 = new Image()
        kImg1.src = kittyImg1Src
        kImg1.onload = () => { kittyImg1Ref.current = kImg1 }

        const kImg2 = new Image()
        kImg2.src = kittyImg2Src
        kImg2.onload = () => { kittyImg2Ref.current = kImg2 }
    }, [avatar])

    const spawnParticles = useCallback((x, y, emoji) => {
        const p = Array.from({ length: 8 }).map((_, i) => ({
            id: Date.now() + i,
            x, y, emoji,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
        }))
        setParticles(prev => [...prev, ...p])
        setTimeout(() => setParticles(prev => prev.filter(pp => !p.find(q => q.id === pp.id))), 600)
    }, [])

    // Bubbles for underwater effect
    const bubblesRef = useRef(
        Array.from({ length: 25 }).map(() => ({
            x: Math.random() * GAME_WIDTH,
            y: 120 + Math.random() * (GAME_HEIGHT - 120),
            r: 2 + Math.random() * 6,
            speed: 0.3 + Math.random() * 0.8,
            wobble: Math.random() * Math.PI * 2,
        }))
    )
    const splashesRef = useRef([])
    const frameRef = useRef(0)

    // Main game loop
    useEffect(() => {
        if (gameState !== 'playing' || showRules) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let animId
        const WATER_LINE = 100

        const loop = () => {
            frameRef.current++
            const h = hookRef.current
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

            // Sky area (above water) - transparent with pink tint
            const skyGrad = ctx.createLinearGradient(0, 0, 0, WATER_LINE)
            skyGrad.addColorStop(0, 'rgba(255, 182, 193, 0.4)')
            skyGrad.addColorStop(1, 'rgba(255, 105, 180, 0.2)')
            ctx.fillStyle = skyGrad
            ctx.fillRect(0, 0, GAME_WIDTH, WATER_LINE)

            // Water body - glowing pink gradient
            const waterGrad = ctx.createLinearGradient(0, WATER_LINE, 0, GAME_HEIGHT)
            waterGrad.addColorStop(0, 'rgba(255, 105, 180, 0.35)')
            waterGrad.addColorStop(0.3, 'rgba(255, 20, 147, 0.45)')
            waterGrad.addColorStop(0.7, 'rgba(199, 21, 133, 0.6)')
            waterGrad.addColorStop(1, 'rgba(139, 0, 139, 0.75)')
            ctx.fillStyle = waterGrad
            ctx.fillRect(0, WATER_LINE, GAME_WIDTH, GAME_HEIGHT - WATER_LINE)

            // Animated water surface waves
            ctx.strokeStyle = 'rgba(255, 192, 203, 0.6)'
            ctx.lineWidth = 2.5
            ctx.beginPath()
            for (let x = 0; x < GAME_WIDTH; x += 2) {
                const waveY = WATER_LINE + Math.sin((x * 0.02) + frameRef.current * 0.04) * 4
                    + Math.sin((x * 0.035) + frameRef.current * 0.025) * 2
                if (x === 0) ctx.moveTo(x, waveY)
                else ctx.lineTo(x, waveY)
            }
            ctx.stroke()

            // Second wave layer
            ctx.strokeStyle = 'rgba(255, 228, 242, 0.35)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            for (let x = 0; x < GAME_WIDTH; x += 2) {
                const waveY = WATER_LINE + 5 + Math.sin((x * 0.025) + frameRef.current * 0.03 + 2) * 3
                if (x === 0) ctx.moveTo(x, waveY)
                else ctx.lineTo(x, waveY)
            }
            ctx.stroke()

            // Light rays underwater
            ctx.save()
            for (let i = 0; i < 5; i++) {
                const rx = 100 + i * 160 + Math.sin(frameRef.current * 0.008 + i) * 30
                const rayGrad = ctx.createLinearGradient(rx, WATER_LINE, rx + 40, GAME_HEIGHT)
                rayGrad.addColorStop(0, 'rgba(255, 230, 240, 0.15)')
                rayGrad.addColorStop(1, 'rgba(255, 230, 240, 0)')
                ctx.fillStyle = rayGrad
                ctx.beginPath()
                ctx.moveTo(rx - 10, WATER_LINE)
                ctx.lineTo(rx + 50, WATER_LINE)
                ctx.lineTo(rx + 80, GAME_HEIGHT)
                ctx.lineTo(rx - 40, GAME_HEIGHT)
                ctx.closePath()
                ctx.fill()
            }
            ctx.restore()

            // Animate & draw bubbles
            bubblesRef.current.forEach(b => {
                b.y -= b.speed
                b.wobble += 0.03
                if (b.y < WATER_LINE) {
                    b.y = GAME_HEIGHT - 10
                    b.x = 40 + Math.random() * (GAME_WIDTH - 80)
                }
                const bx = b.x + Math.sin(b.wobble) * 8
                ctx.beginPath()
                ctx.arc(bx, b.y, b.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + b.r * 0.03})`
                ctx.fill()
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + b.r * 0.04})`
                ctx.lineWidth = 0.5
                ctx.stroke()
                // Bubble shine
                ctx.beginPath()
                ctx.arc(bx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
                ctx.fill()
            })

            // Draw splashes
            splashesRef.current = splashesRef.current.filter(s => s.life > 0)
            splashesRef.current.forEach(s => {
                s.life--
                s.particles.forEach(p => {
                    p.x += p.vx
                    p.y += p.vy
                    p.vy += 0.15
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 182, 193, ${s.life / 30})`
                    ctx.fill()
                })
            })

            // Draw items with underwater glow
            itemsRef.current.forEach(item => {
                if (item.caught) return

                // Move kitties horizontally
                if (item.type === 'kitty') {
                    item.x += item.vx
                    // Bounce off walls
                    if (item.x < item.size / 2 || item.x > GAME_WIDTH - item.size / 2) {
                        item.vx *= -1
                    }
                    item.flip = item.vx > 0
                }

                // Gentle floating animation
                const floatY = item.y + Math.sin(frameRef.current * 0.02 + item.id) * 3

                if (item.type === 'kitty') {
                    const kImg = item.imgIdx === 0 ? kittyImgRef.current : (item.imgIdx === 1 ? kittyImg1Ref.current : kittyImg2Ref.current)
                    if (kImg) {
                        ctx.save()
                        ctx.translate(item.x, floatY)
                        // Lắc lắc effect (wobble)
                        const wobbleAngle = Math.sin(frameRef.current * 0.05 + item.id) * 0.15
                        ctx.rotate(wobbleAngle)

                        if (item.flip) {
                            ctx.scale(-1, 1)
                        }
                        ctx.shadowColor = 'rgba(255, 20, 147, 0.8)'
                        ctx.shadowBlur = 20
                        ctx.drawImage(kImg, -item.size / 2, -item.size / 2, item.size, item.size)
                        ctx.restore()
                    }
                } else if (item.type === 'bomb') {
                    ctx.font = `${item.size}px serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.shadowColor = 'rgba(255, 50, 50, 0.6)'
                    ctx.shadowBlur = 15
                    ctx.fillText(item.emoji, item.x, floatY)
                    ctx.shadowBlur = 0
                }
            })

            // Hook physics
            if (h.state === 'swinging') {
                h.angle += SWING_SPEED * h.dir
                if (h.angle > 1.3) h.dir = -1
                if (h.angle < -1.3) h.dir = 1
                h.length = ROPE_BASE_LEN
                h.caughtItem = null
            } else if (h.state === 'dropping') {
                h.length += DROP_SPEED
                const tipX = HOOK_ORIGIN.x + Math.sin(h.angle) * h.length
                const tipY = HOOK_ORIGIN.y + Math.cos(h.angle) * h.length

                // Splash when entering water
                if (h.length > 45 && h.length < 50) {
                    splashesRef.current.push({
                        life: 25,
                        particles: Array.from({ length: 6 }).map(() => ({
                            x: tipX, y: WATER_LINE,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -1 - Math.random() * 3,
                        }))
                    })
                }

                if (tipX < 0 || tipX > GAME_WIDTH || tipY > GAME_HEIGHT - 10) {
                    h.state = 'reeling'
                }
                if (!h.caughtItem) {
                    for (const item of itemsRef.current) {
                        if (item.caught) continue
                        const floatY = item.y + Math.sin(frameRef.current * 0.02 + item.id) * 3
                        const dx = tipX - item.x
                        const dy = tipY - floatY
                        if (Math.sqrt(dx * dx + dy * dy) < item.size * 0.6) {
                            h.caughtItem = item.id
                            h.state = 'reeling'
                            break
                        }
                    }
                }
            } else if (h.state === 'reeling') {
                const caughtItem = h.caughtItem !== null ? itemsRef.current.find(i => i.id === h.caughtItem) : null
                const reelSpeed = caughtItem ? REEL_SPEED / caughtItem.weight : REEL_SPEED * 2
                h.length -= reelSpeed

                // Splash when exiting water
                if (caughtItem && h.length < 55 && h.length > 50) {
                    const tipX = HOOK_ORIGIN.x + Math.sin(h.angle) * h.length
                    splashesRef.current.push({
                        life: 20,
                        particles: Array.from({ length: 8 }).map(() => ({
                            x: tipX, y: WATER_LINE,
                            vx: (Math.random() - 0.5) * 5,
                            vy: -2 - Math.random() * 4,
                        }))
                    })
                }

                if (h.length <= ROPE_BASE_LEN) {
                    h.length = ROPE_BASE_LEN
                    h.state = 'swinging'
                    if (caughtItem && !caughtItem.caught) {
                        setScore(s => {
                            const newScore = s + caughtItem.points
                            scoreRef.current = newScore
                            if (newScore >= TARGET_SCORE) setGameState('won')
                            return newScore
                        })
                        caughtItem.caught = true
                        const pEmoji = caughtItem.type === 'kitty' ? '🌸' : '💥'
                        spawnParticles(HOOK_ORIGIN.x, HOOK_ORIGIN.y + 20, pEmoji)

                        if (caughtItem.type === 'bomb') {
                            setIsExploding(true)
                            setTimeout(() => setIsExploding(false), 500)
                        }
                    }
                    h.caughtItem = null
                }
            }

            // Calculate tip position
            h.tipX = HOOK_ORIGIN.x + Math.sin(h.angle) * h.length
            h.tipY = HOOK_ORIGIN.y + Math.cos(h.angle) * h.length

            // Draw fishing line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
            ctx.lineWidth = 2
            ctx.setLineDash([])
            ctx.beginPath()
            ctx.moveTo(HOOK_ORIGIN.x, HOOK_ORIGIN.y)
            ctx.lineTo(h.tipX, h.tipY)
            ctx.stroke()

            // Draw hook - rotated along rope direction
            ctx.save()
            ctx.translate(h.tipX, h.tipY)
            ctx.rotate(-h.angle) // rotate hook to follow rope

            // Hook circle
            ctx.fillStyle = '#FF7043'
            ctx.beginPath()
            ctx.arc(0, 0, 7, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.lineWidth = 2
            ctx.stroke()

            // Hook claws (pointing along rope direction)
            ctx.strokeStyle = '#FF7043'
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.moveTo(-5, 3)
            ctx.lineTo(-9, 12)
            ctx.moveTo(5, 3)
            ctx.lineTo(9, 12)
            ctx.stroke()

            // Draw caught item on hook
            if (h.caughtItem !== null && h.state === 'reeling') {
                const ci = itemsRef.current.find(i => i.id === h.caughtItem)
                if (ci) {
                    if (ci.type === 'kitty') {
                        const kImg = ci.imgIdx === 0 ? kittyImgRef.current : (ci.imgIdx === 1 ? kittyImg1Ref.current : kittyImg2Ref.current)
                        if (kImg) {
                            ctx.save()
                            ctx.translate(0, 18)
                            if (ci.flip) ctx.scale(-1, 1)
                            ctx.drawImage(kImg, -ci.size / 2, -ci.size / 2, ci.size, ci.size)
                            ctx.restore()
                        }
                    } else if (ci.type === 'bomb') {
                        ctx.font = `${ci.size}px serif`
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillText(ci.emoji, 0, 18)
                    }
                }
            }
            ctx.restore()

            // Draw player character (avatar or fallback)
            if (avatarImgRef.current) {
                const sz = 40
                ctx.save()
                ctx.beginPath()
                ctx.arc(HOOK_ORIGIN.x, HOOK_ORIGIN.y - 10, sz / 2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.drawImage(avatarImgRef.current, HOOK_ORIGIN.x - sz / 2, HOOK_ORIGIN.y - 10 - sz / 2, sz, sz)
                ctx.restore()
                // Border around avatar
                ctx.beginPath()
                ctx.arc(HOOK_ORIGIN.x, HOOK_ORIGIN.y - 10, sz / 2, 0, Math.PI * 2)
                ctx.strokeStyle = 'rgba(255, 179, 193, 0.9)'
                ctx.lineWidth = 3
                ctx.stroke()
            } else {
                ctx.font = '38px serif'
                ctx.textAlign = 'center'
                ctx.fillText('🐱', HOOK_ORIGIN.x, HOOK_ORIGIN.y - 8)
            }

            // Boat/platform
            ctx.fillStyle = 'rgba(255, 171, 145, 0.85)'
            ctx.beginPath()
            ctx.ellipse(HOOK_ORIGIN.x, HOOK_ORIGIN.y + 10, 35, 8, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255, 112, 67, 0.8)'
            ctx.lineWidth = 2
            ctx.stroke()

            animId = requestAnimationFrame(loop)
        }

        animId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(animId)
    }, [gameState, spawnParticles])

    // Input handler
    useEffect(() => {
        const handleKey = (e) => {
            if (showRules) return
            if (e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault()
                if (hookRef.current.state === 'swinging') {
                    hookRef.current.state = 'dropping'
                }
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [showRules])

    const handleClick = () => {
        if (showRules) return
        if (hookRef.current.state === 'swinging' && gameState === 'playing') {
            hookRef.current.state = 'dropping'
        }
    }

    const handleRestart = () => {
        setScore(0)
        scoreRef.current = 0
        setTimeLeft(GAME_TIME)
        itemsRef.current = generateItems()
        hookRef.current = {
            angle: 0, dir: 1, state: 'swinging',
            length: ROPE_BASE_LEN, caughtItem: null,
            tipX: HOOK_ORIGIN.x, tipY: HOOK_ORIGIN.y + ROPE_BASE_LEN,
        }
        setGameState('playing')
    }

    return (
        <div className={`miner-container ${isExploding ? 'shake' : ''}`}>
            {isExploding && <div className="explosion-flash" />}
            <div className="miner-hud">
                <button className="miner-back-btn" onClick={onBack}>← Menu</button>
                <div className="miner-score">⭐ {score} / {TARGET_SCORE}</div>
                <div className={`miner-timer ${timeLeft <= 10 ? 'urgent' : ''}`}>⏱️ {timeLeft}s</div>
                <button className="miner-rules-btn" onClick={() => setShowRules(true)}>📖 Luật chơi</button>
            </div>

            <div className="miner-game-area" onClick={handleClick}>
                <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="miner-canvas" />
                <div className="miner-hint">
                    {gameState === 'playing' && '👆 Bấm hoặc nhấn Space để thả móc!'}
                </div>
            </div>

            {/* Particles */}
            {particles.map(p => (
                <div key={p.id} className="miner-particle" style={{
                    left: `calc(50% - ${GAME_WIDTH / 2 - p.x}px)`,
                    top: `${p.y}px`,
                    transform: `translate(${p.vx * 30}px, ${p.vy * 30}px)`,
                }}>
                    {p.emoji}
                </div>
            ))}

            {/* Rules Overlay */}
            {showRules && (
                <div className="miner-overlay rules-overlay" onClick={() => setShowRules(false)}>
                    <div className="miner-overlay-content" onClick={e => e.stopPropagation()}>
                        <h2>📖 Luật Chơi Đào Kitty</h2>
                        <ul className="miner-rules-list">
                            <li>🎣 Nhấn <strong>Space</strong> hoặc chạm vào màn hình để thả móc xuống.</li>
                            <li>🐱 Gắp các bé Kitty đang bơi để ghi điểm! Kitty càng nhỏ, bơi càng nhanh thì điểm càng cao (lên tới 200 điểm/bé).</li>
                            <li>💣 Tuyệt đối tránh xa vật phẩm có hình <strong>BOM (💣)</strong>. Nếu gắp nhầm sẽ bị <strong>trừ 100 điểm</strong>, rung màn hình cực căng! Đồng thời vì bom nặng quá nên gắp lên siêu chậm sảy chân là chết luôn!</li>
                            <li>⏱️ Gắp đủ <strong>{TARGET_SCORE} điểm</strong> trong <strong>{GAME_TIME} giây</strong> để giành chiến thắng.</li>
                        </ul>
                        <button className="miner-close-rules" onClick={() => setShowRules(false)}>Đã hiểu! Bắt đầu chơi 🎮</button>
                    </div>
                </div>
            )}

            {/* Game Over / Win Overlay */}
            {gameState !== 'playing' && !showRules && (
                <div className="miner-overlay">
                    <div className="miner-overlay-content">
                        <h2>{gameState === 'won' ? '🎉 THẮNG RỒI! 🎉' : '⏱️ HẾT GIỜ!'}</h2>
                        <p className="miner-final-score">Điểm: {score} / {TARGET_SCORE}</p>
                        <p>{gameState === 'won' ? 'Cún đào giỏi lắm! +100 điểm 🏆' : 'Chưa đủ điểm rồi... -50 điểm 😢'}</p>
                        <div className="miner-overlay-btns">
                            <button onClick={() => { onFinish(gameState === 'won' ? 100 : -50); handleRestart(); }}>Chơi lại ⛏️</button>
                            <button onClick={() => onFinish(gameState === 'won' ? 100 : -50)} className="miner-menu-btn">Menu 🏠</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
