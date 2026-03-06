import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import kittyImg from '/kitty.png'

const WORLD_W = 1200
const WORLD_H = 650
const GRAVITY = 0.2
const TANK_W = 32
const TANK_H = 22

const mapThemes = {
    1: { bg: 'linear-gradient(to bottom, #0a192f, #112240)', fill: '#2c3e50', stroke: '#1abc9c', name: 'Đồng Bằng', color: '#ff007f' },
    2: { bg: 'linear-gradient(to bottom, #1a0b2e, #3a1c71)', fill: '#3d1c4f', stroke: '#ffaa00', name: 'Thung Lũng', color: '#ffaa00' },
    3: { bg: 'linear-gradient(to bottom, #2b0c0c, #000000)', fill: '#4a0e0e', stroke: '#ff003c', name: 'Răng Cưa', color: '#ff003c' },
    4: { bg: 'linear-gradient(to bottom, #00223e, #1d976c)', fill: '#14383c', stroke: '#00f3ff', name: 'Khối Phố', color: '#00f3ff' },
    5: { bg: 'linear-gradient(to bottom, #111, #333)', fill: '#444', stroke: '#ff003c', name: 'Đảo Lơ Lửng', color: '#ff003c' },
    6: { bg: 'linear-gradient(to bottom, #000, #222)', fill: '#222', stroke: '#b8860b', name: 'Tháp Đôi', color: '#ffea00' },
    7: { bg: 'linear-gradient(to bottom, #4a2e00, #d48e28)', fill: '#b86a14', stroke: '#ffcc00', name: 'Sa Mạc Cát', color: '#ffcc00' },
    8: { bg: 'linear-gradient(to bottom, #001a33, #003366)', fill: '#004080', stroke: '#00ccff', name: 'Biển Đêm', color: '#00ccff' },
    9: { bg: 'linear-gradient(to bottom, #8bb0c2, #ffffff)', fill: '#d9e8ed', stroke: '#ffffff', name: 'Đỉnh Băng', color: '#ffffff' }
}

const generateTerrain = (lvl) => {
    let t = new Array(WORLD_W).fill(WORLD_H)
    if (lvl === 1) { // Đồi lượn sóng nhẹ
        for (let i = 0; i < WORLD_W; i++) t[i] = WORLD_H - 150 - Math.sin(i / 150) * 80
    } else if (lvl === 2) { // Vách núi 2 bên
        for (let i = 0; i < WORLD_W; i++) {
            let d = Math.abs(i - WORLD_W / 2)
            t[i] = WORLD_H - 100 - (d * d) / 1000 + (Math.sin(i / 10) * 5)
        }
    } else if (lvl === 3) { // Răng cưa địa ngục
        for (let i = 0; i < WORLD_W; i++) {
            t[i] = WORLD_H - 200 - Math.abs(Math.sin(i / 80)) * 150 + Math.random() * 5
        }
    } else if (lvl === 4) { // Thành phố khối (Bậc thang vuông)
        for (let i = 0; i < WORLD_W; i++) {
            let block = Math.floor(i / 120)
            t[i] = WORLD_H - 100 - (block % 3 === 0 ? 0 : (block % 2 === 0 ? 150 : 80))
        }
    } else if (lvl === 5) { // Đảo nổi (Rớt là chết)
        for (let i = 0; i < WORLD_W; i++) {
            let gap = Math.sin(i / 60) > 0.8 || Math.cos(i / 90) > 0.9
            if (gap) t[i] = WORLD_H + 200 // Thủng đáy
            else t[i] = WORLD_H - 200 - Math.sin(i / 100) * 50
        }
    } else if (lvl === 6) { // Tháp đôi tử thần
        for (let i = 0; i < WORLD_W; i++) {
            let d1 = Math.abs(i - WORLD_W / 4)
            let d2 = Math.abs(i - WORLD_W * 3 / 4)
            t[i] = WORLD_H - 50 - Math.max(0, 300 - d1 * 2, 300 - d2 * 2) + Math.random() * 10
        }
    } else if (lvl === 7) { // Sa mạc đụn cát nhấp nhô
        for (let i = 0; i < WORLD_W; i++) {
            t[i] = WORLD_H - 100 - Math.sin(i / 200) * 150 - Math.cos(i / 70) * 40
        }
    } else if (lvl === 8) { // Bờ biển ngập nước (vực ở 2 phần 3 màn hình)
        for (let i = 0; i < WORLD_W; i++) {
            if (i > WORLD_W * 0.3 && i < WORLD_W * 0.7) t[i] = WORLD_H + 200 // Biển lớn
            else t[i] = WORLD_H - 120 - Math.random() * 5 - Math.sin(i / 50) * 20
        }
    } else if (lvl === 9) { // Núi băng
        for (let i = 0; i < WORLD_W; i++) {
            t[i] = WORLD_H - 100 - Math.abs(Math.sin(i / 90)) * 250 + Math.random() * 15
        }
    }
    for (let i = 0; i < WORLD_W; i++) t[i] = Math.max(0, Math.min(WORLD_H + 200, t[i]))
    return t
}

function MapPreview({ lvl }) {
    const t = generateTerrain(lvl)
    const pts = t.map((y, x) => `${x},${Math.min(y, WORLD_H)}`).join(' ')
    const poly = `${pts} ${WORLD_W},${WORLD_H} 0,${WORLD_H}`
    const theme = mapThemes[lvl] || mapThemes[1]

    return (
        <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} style={{ width: '100%', height: '120px', background: theme.bg, borderRadius: '10px', marginBottom: '10px', boxShadow: 'inset 0 0 10px black' }}>
            <polygon points={poly} fill={theme.fill} stroke={theme.stroke} strokeWidth="4" />
            <rect x="150" y={t[150] - TANK_H} width={TANK_W} height={TANK_H} fill="#ffea00" />
            <circle cx={WORLD_W - 200} cy={t[WORLD_W - 200] - 12} r="12" fill="#ff4d6d" />
            <circle cx={WORLD_W - 100} cy={t[WORLD_W - 100] - 12} r="12" fill="#ff4d6d" />

            {/* Hiệu ứng nước nếu là biển */}
            {(lvl === 8 || lvl === 5) && <rect x="0" y={WORLD_H - 60} width={WORLD_W} height={80} fill="rgba(0, 200, 255, 0.4)" />}
        </svg>
    )
}

export default function ArmyShooter({ onBack, onFinish, avatar }) {
    const [gameState, setGameState] = useState('menu') // menu | map_select | playing | won | gameover
    const [level, setLevel] = useState(1)

    const scaleRatio = Math.min(window.innerWidth / WORLD_W, window.innerHeight / WORLD_H) * 0.95

    // Refs cho Game Loop
    const keysRef = useRef(new Set())
    const playerRef = useRef({ x: 200, y: 0, angle: 45, power: 0, hp: 100, isCharging: false, dir: 1, mp: 150 })
    const enemiesRef = useRef([])
    const projectilesRef = useRef([])
    const terrainRef = useRef(new Array(WORLD_W).fill(WORLD_H))
    const windRef = useRef(0)
    const ammoRef = useRef('normal')
    const turnRef = useRef('player') // 'player' | 'shooting' | 'enemy' | 'enemy_shooting'
    const waitTimerRef = useRef(0)

    // State cho UI React
    const [turn, setTurn] = useState('player')
    const [playerState, setPlayerState] = useState({ ...playerRef.current })
    const [enemies, setEnemies] = useState([])
    const [projectiles, setProjectiles] = useState([])
    const [terrainPolygons, setTerrainPolygons] = useState('')
    const [wind, setWind] = useState(0)
    const [ammoType, setAmmoType] = useState('normal')
    const [explosions, setExplosions] = useState([])
    const [timeLeft, setTimeLeft] = useState(40) // Kéo dài thời lượng thành 40s
    const [items, setItems] = useState({ hp: 2, hpFull: 1, helicopter: 1, saw: 1, wind: 1, x2: 1, x3: 0, x5: 0, rain: 1, poison: 1, teleport: 1 })
    const [activeMod, setActiveMod] = useState(null)
    const activeModRef = useRef(null)
    const [itemUsedThisTurn, setItemUsedThisTurn] = useState(false)
    const [drops, setDrops] = useState([])
    const dropsRef = useRef([])
    const [floatingTexts, setFloatingTexts] = useState([])
    const [isShaking, setIsShaking] = useState(false)
    const [showGuide, setShowGuide] = useState(false)
    const [ultraUsed, setUltraUsed] = useState(false)
    const ultraUsedRef = useRef(false)
    const ultraVariantRef = useRef(0) // 0=multi-shot, 1=vortex, 2=thunder
    const [showUI, setShowUI] = useState(true) // Toggle thanh điều khiển bên dưới

    // Helpers
    const spawnText = (text, cx, cy, color) => {
        const id = Math.random()
        setFloatingTexts(prev => [...prev, { id, text, x: cx, y: cy, color }])
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1500)
    }
    const getTerrainY = (cx, w = TANK_W) => {
        let minT = WORLD_H + 500 // Giả định
        let half = Math.floor(w / 2)
        let start = Math.max(0, Math.floor(cx) - half)
        let end = Math.min(WORLD_W - 1, Math.floor(cx) + half)
        // Nếu lọt ra ngoài bản đồ
        if (start >= WORLD_W || end < 0) return WORLD_H + 500

        for (let i = start; i <= end; i++) {
            if (terrainRef.current[i] && terrainRef.current[i] < minT) minT = terrainRef.current[i]
        }
        return minT
    }

    const explodeTerrain = (cx, cy, radius) => {
        let t = [...terrainRef.current]
        let changed = false
        const startX = Math.max(0, Math.floor(cx - radius))
        const endX = Math.min(WORLD_W - 1, Math.floor(cx + radius))

        for (let x = startX; x <= endX; x++) {
            let dx = x - cx
            let dy = Math.sqrt(radius * radius - dx * dx)
            let craterBottomY = cy + dy
            if (t[x] < craterBottomY) {
                t[x] = Math.max(t[x], craterBottomY) // Y hướng xuống nên tăng Y là đào hố
                changed = true
            }
        }
        if (changed) {
            terrainRef.current = t
            updateTerrainSVG()
        }
    }

    const updateTerrainSVG = () => {
        const pts = terrainRef.current.map((y, x) => `${x},${Math.min(y, WORLD_H)}`).join(' ')
        setTerrainPolygons(`${pts} ${WORLD_W},${WORLD_H} 0,${WORLD_H}`)
    }

    // Khởi tạo Map
    const initMap = useCallback((lvl) => {
        setLevel(lvl)

        let t = generateTerrain(lvl)
        terrainRef.current = t
        updateTerrainSVG()

        // Hàm Random vị trí an toàn (Không bị lọt hố và không quá gần nhau)
        const findValidX = (minX, maxX, width, excludeXs = []) => {
            let rx = minX
            for (let att = 0; att < 200; att++) {
                rx = minX + Math.random() * (maxX - minX)
                let y = getTerrainY(rx, width)
                if (y > WORLD_H - 50) continue // Bỏ qua nếu là mép vực sâu (nước/hố tàng hình)
                if (excludeXs.some(ex => Math.abs(ex - rx) < 60)) continue // Giảm khoảng cách kén chọn chồng lấn từ 80 xuống 60 cho Map hẹp
                return rx
            }

            // Xúc xắc xui quá không tìm được chỗ do map hẹp (VD: Map 8 chia cắt)
            // Ép đẻ đại ở 1 vị trí cố định an toàn
            for (let x = minX; x <= maxX; x += 10) {
                if (getTerrainY(x, width) <= WORLD_H - 50) return x
            }

            return minX + 50 // Bần cùng
        }

        // 2. Khởi tạo Player (ngẫu nhiên trái hoặc phải)
        const isLeftSpawn = Math.random() > 0.5
        const pX = isLeftSpawn ? findValidX(50, WORLD_W / 3, TANK_W) : findValidX(WORLD_W * 2 / 3, WORLD_W - 50, TANK_W)

        playerRef.current = { x: pX, y: 0, angle: 45, power: 0, hp: 500, maxHp: 500, isCharging: false, dir: isLeftSpawn ? 1 : -1, mp: 80, isMoving: false }
        playerRef.current.y = getTerrainY(pX, TANK_W) - TANK_H
        setPlayerState({ ...playerRef.current })

        // 3. Khởi tạo Quái
        let newEnemies = []
        let enemyCount = 2 + Math.floor(lvl / 2) // Càng cao càng đông
        let usedXs = [pX]

        for (let i = 0; i < enemyCount; i++) {
            // Quái được rải rác tuỳ ý, xa Player
            let ex = findValidX(50, WORLD_W - 50, 24, usedXs)
            usedXs.push(ex)

            newEnemies.push({
                id: Math.random(),
                x: ex,
                y: 0, // Sẽ tính lại
                hp: Math.floor(lvl * 120 + 200),
                maxHp: Math.floor(lvl * 120 + 200),
                hue: Math.floor(Math.random() * 360)
            })
        }
        // Đặt quái lên mặt đất
        newEnemies.forEach(e => {
            e.y = getTerrainY(e.x, 24) - 12
        })
        enemiesRef.current = newEnemies
        setEnemies([...enemiesRef.current])

        // 4. Random Gió
        windRef.current = parseFloat(((Math.random() - 0.5) * 0.3 * lvl).toFixed(3))
        setWind(windRef.current)

        projectilesRef.current = []
        setProjectiles([])

        turnRef.current = 'player'
        setTurn('player')
        waitTimerRef.current = 0
        setTimeLeft(40)

        // Tạo quà (Drops)
        const DROP_TYPES = ['hp', 'hpFull', 'wind', 'x2', 'x3', 'x5', 'helicopter', 'saw', 'rain', 'poison', 'teleport'] // Giới hạn đồ cho phép rớt
        let newDrops = []
        for (let i = 0; i < 3; i++) {
            newDrops.push({
                id: Math.random(),
                x: 100 + Math.random() * (WORLD_W - 200),
                y: -100 - Math.random() * 200, // trên trời thả xuống
                type: DROP_TYPES[Math.floor(Math.random() * DROP_TYPES.length)],
                vy: 0.5 + Math.random(),
                collected: false,
                isFloating: Math.random() > 0.5,
                targetY: 50 + Math.random() * (WORLD_H - 250)
            })
        }
        dropsRef.current = newDrops
        setDrops(newDrops)

        setItems({ hp: 2, hpFull: 1, helicopter: 1, saw: 1, wind: 1, x2: 1, x3: 0, x5: 0, rain: 1, poison: 1, teleport: 1 }) // Reset Items
        setActiveMod(null)
        activeModRef.current = null
        setItemUsedThisTurn(false)
        setFloatingTexts([])

        setGameState('playing')
    }, [])

    // Địch tự bắn (Enemy AI Turn)
    useEffect(() => {
        if (turn === 'enemy' && gameState === 'playing') {
            const timer = setTimeout(() => {
                const aliveEnemies = enemiesRef.current.filter(e => e.hp > 0)
                if (aliveEnemies.length === 0) {
                    turnRef.current = 'player'; setTurn('player'); return
                }

                // Chọn ngẫu nhiên 1 con Mèo để báo thù
                const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]

                // 😼 MÈO ĐÔI LÚC SẼ BỎ CHẠY TRƯỚC KHI BẮN 
                if (Math.random() > 0.3) { // 70% tỉ lệ nó sẽ lạch bạch tìm góc bắn
                    const moveDist = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 50) // Chạy khoảng 30->80px
                    shooter.x += moveDist
                    shooter.x = Math.max(20, Math.min(WORLD_W - 20, shooter.x))
                }

                enemiesRef.current = [...aliveEnemies]
                setEnemies([...enemiesRef.current])

                // Thuật toán nhắm bắn Player CHÍNH XÁC CAO (Quỹ đạo Vật lý)
                const pX = playerRef.current.x
                const pY = getTerrainY(pX, TANK_W) - TANK_H / 2 // Nhắm giữa thân xe
                const dx = pX - shooter.x
                const dy = pY - (shooter.y - 20)
                const dir = dx < 0 ? -1 : 1
                const absDx = Math.abs(dx)

                // Tìm góc bắn (Angle) sao cho có thể vượt qua độ dốc y
                let rad = 45 * (Math.PI / 180)
                for (let a = 20; a <= 85; a += 5) {
                    const r = a * (Math.PI / 180)
                    // Điều kiện để mẫu số > 0
                    if (dy + absDx * Math.tan(r) > 0) {
                        rad = r
                        if (Math.random() < 0.4) continue // Có tỉ lệ chọn góc cao hơn bắn cầu vồng cho ngầu
                        break
                    }
                }

                const term1 = 0.5 * GRAVITY * absDx * absDx
                const term2 = Math.pow(Math.cos(rad), 2) * (dy + absDx * Math.tan(rad))

                let neededSpeed = 15 // Mặc định
                if (term2 > 0) {
                    neededSpeed = Math.sqrt(term1 / term2)
                }

                // Gia tốc gió đẩy theo thời gian:
                // x(t) = v*cos(rad)*t + 0.5*wind*t^2. Trừ hao bằng xấp xỉ tỉ lệ thuận khoảng cách
                const estimatedTime = absDx / (neededSpeed * Math.cos(rad))
                neededSpeed -= (windRef.current * dir) * (estimatedTime / 2.5)

                // Tỉ lệ 15% Kamikaze (bay tới nổ tung x2 sát thương)
                if (Math.random() < 0.15) {
                    projectilesRef.current.push({
                        id: Math.random(),
                        x: shooter.x,
                        y: shooter.y - 20,
                        vx: (pX - shooter.x) / 30, // Tới đích trong 30 frame
                        vy: (pY - shooter.y) / 30,
                        type: 'enemy_kamikaze',
                        isEnemy: true,
                        shooterHue: shooter.hue
                    })
                    shooter.hp = 0 // Mèo hi sinh!
                    setEnemies([...enemiesRef.current])
                    spawnText('😾 Banzaiii!!!', shooter.x, shooter.y - 40, '#ff003c')
                } else {
                    // Tỉ lệ 90% Bắn Xuyên Trái Tim, 10% Trượt Nhẹ tấu hài
                    if (Math.random() > 0.9) {
                        neededSpeed += (Math.random() - 0.5) * 2
                    }

                    projectilesRef.current.push({
                        id: Math.random(),
                        x: shooter.x,
                        y: shooter.y - 20,
                        vx: Math.cos(rad) * neededSpeed * dir,
                        vy: -Math.sin(rad) * neededSpeed,
                        type: 'normal', // Enemy bắn đạn nhẹ
                        isEnemy: true
                    })
                }

                turnRef.current = 'enemy_shooting'
                setTurn('enemy_shooting')

            }, 1500) // Delay 1.5s suy nghĩ r bắn
            return () => clearTimeout(timer)
        }
    }, [turn, gameState, level])

    // Đánh bắt phím
    useEffect(() => {
        const down = (e) => keysRef.current.add(e.code)
        const up = (e) => keysRef.current.delete(e.code)
        window.addEventListener('keydown', down)
        window.addEventListener('keyup', up)
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
    }, [])

    // Đổi gió mỗi 8s
    useEffect(() => {
        if (gameState !== 'playing') return
        const timer = setInterval(() => {
            windRef.current = parseFloat(((Math.random() - 0.5) * 0.4).toFixed(3))
            setWind(windRef.current)
        }, 8000)
        return () => clearInterval(timer)
    }, [gameState])

    // Đếm ngược thời gian bắn của Player
    useEffect(() => {
        if (gameState !== 'playing' || turn !== 'player') return
        if (timeLeft <= 0) {
            turnRef.current = 'enemy'
            setTurn('enemy')
            playerRef.current.isCharging = false
            playerRef.current.power = 0
            setPlayerState({ ...playerRef.current })
            return
        }

        const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        return () => clearInterval(t)
    }, [gameState, turn, timeLeft])

    // GAME ENGINE LOOP (60FPS)
    useEffect(() => {
        if (gameState !== 'playing') return

        const loop = setInterval(() => {
            const keys = keysRef.current
            const p = playerRef.current
            let playerNeedsUpdate = false

            // --- ĐIỀU KHIỂN CHỈ KHÍ ĐẾN LƯỢT PLAYER ---
            p.isMoving = false

            if (turnRef.current === 'player') {
                const isChargingNow = p.isCharging

                // Di chuyển trái/phải - cấm khi đang nạp lực
                if (!isChargingNow && (keys.has('ArrowLeft') || keys.has('KeyA'))) {
                    if (p.dir !== -1) {
                        p.dir = -1
                        playerNeedsUpdate = true
                    }
                    if (p.mp > 0) {
                        const nextY = getTerrainY(p.x - 1.5, TANK_W) - TANK_H
                        if (p.y - nextY < 15) { // Kiểm tra leo dốc
                            p.x -= 1.5
                            p.mp -= 2.5
                            p.isMoving = true
                            if (p.mp < 0) p.mp = 0
                            if (p.x < TANK_W / 2) p.x = TANK_W / 2
                            playerNeedsUpdate = true
                        }
                    }
                }
                if (!isChargingNow && (keys.has('ArrowRight') || keys.has('KeyD'))) {
                    if (p.dir !== 1) {
                        p.dir = 1
                        playerNeedsUpdate = true
                    }
                    if (p.mp > 0) {
                        const nextY = getTerrainY(p.x + 1.5, TANK_W) - TANK_H
                        if (p.y - nextY < 15) {
                            p.x += 1.5
                            p.mp -= 2.5
                            p.isMoving = true
                            if (p.mp < 0) p.mp = 0
                            if (p.x > WORLD_W - TANK_W / 2) p.x = WORLD_W - TANK_W / 2
                            playerNeedsUpdate = true
                        }
                    }
                }
                // Chỉnh góc bắn - cấm khi đang nạp lực
                if (!isChargingNow && (keys.has('ArrowUp') || keys.has('KeyW'))) {
                    p.angle += 1.5
                    if (p.angle > 180) p.angle = 180
                    playerNeedsUpdate = true
                }
                if (!isChargingNow && (keys.has('ArrowDown') || keys.has('KeyS'))) {
                    p.angle -= 1.5
                    if (p.angle < 0) p.angle = 0
                    playerNeedsUpdate = true
                }
            }

            // --- NẠP LỰC BẮN ---
            if (keys.has('Space')) {
                if (turnRef.current === 'player') {
                    p.isCharging = true
                    p.power += 0.7
                    if (p.power > 100) p.power = 100
                    playerNeedsUpdate = true
                }
            } else {
                if (p.isCharging && turnRef.current === 'player') {
                    // KHAI HỎA!
                    const rad = p.angle * (Math.PI / 180)
                    const speed = (p.power / 100) * 18
                    let count = 1
                    if (activeModRef.current === 'x2') count = 2
                    if (activeModRef.current === 'x3') count = 3
                    if (activeModRef.current === 'x5') count = 5

                    const isUltraShot = ammoRef.current === 'ultra'
                    if (isUltraShot) {
                        // ULTRA: random 1 trong 3 hiệu ứng
                        const variant = Math.floor(Math.random() * 3)
                        ultraVariantRef.current = variant
                        setAmmoType('normal')
                        ammoRef.current = 'normal'

                        if (variant === 0) {
                            for (let i = 0; i < 3; i++) {
                                const spreadAngle = (i - 1) * 8
                                const aRad2 = (p.angle + spreadAngle) * (Math.PI / 180)
                                projectilesRef.current.push({ id: Math.random(), x: p.x + Math.cos(rad) * (TANK_W / 2), y: getTerrainY(p.x) - TANK_H - Math.sin(rad) * (TANK_W / 2), vx: Math.cos(aRad2) * speed * p.dir * 1.2, vy: -Math.sin(aRad2) * speed * 1.2, type: 'ultra', isEnemy: false, delay: i * 8 })
                            }
                            spawnText('🔥 TRIPLE SHOT!! 🔥', p.x, p.y - 60, '#ff8c00')
                        } else if (variant === 1) {
                            projectilesRef.current.push({ id: Math.random(), x: p.x + Math.cos(rad) * (TANK_W / 2), y: getTerrainY(p.x) - TANK_H - Math.sin(rad) * (TANK_W / 2), vx: Math.cos(rad) * speed * p.dir * 1.5, vy: -Math.sin(rad) * speed * 1.5, type: 'ultra_vortex', isEnemy: false, delay: 0 })
                            spawnText('🌀 VORTEX BLAST!! 🌀', p.x, p.y - 60, '#cc00ff')
                        } else {
                            projectilesRef.current.push({ id: Math.random(), x: p.x + Math.cos(rad) * (TANK_W / 2), y: getTerrainY(p.x) - TANK_H, vx: Math.cos(rad) * speed * p.dir, vy: -Math.sin(rad) * speed, type: 'ultra_thunder', isEnemy: false, delay: 0 })
                            spawnText('⚡ THUNDER STORM!! ⚡', p.x, p.y - 60, '#ffea00')
                        }
                        setIsShaking(true)
                        setTimeout(() => setIsShaking(false), 300)
                    } else {
                        // NORMAL / ITEM shots
                        if (['helicopter', 'saw', 'rain', 'poison', 'teleport'].includes(ammoRef.current)) {
                            const amt = ammoRef.current
                            setItems(prev => ({ ...prev, [amt]: Math.max(0, prev[amt] - 1) }))
                        }
                        if (activeModRef.current) {
                            const amod = activeModRef.current
                            setItems(prev => ({ ...prev, [amod]: Math.max(0, prev[amod] - 1) }))
                            setActiveMod(null)
                            activeModRef.current = null
                        }
                        for (let i = 0; i < count; i++) {
                            projectilesRef.current.push({ id: Math.random(), x: p.x + Math.cos(rad) * (TANK_W / 2), y: getTerrainY(p.x) - TANK_H - Math.sin(rad) * (TANK_W / 2), vx: Math.cos(rad) * speed * p.dir, vy: -Math.sin(rad) * speed, type: ammoRef.current, isEnemy: false, delay: i * 15 })
                        }
                        if (['helicopter', 'saw', 'rain', 'poison', 'teleport'].includes(ammoRef.current)) {
                            setAmmoType('normal')
                            ammoRef.current = 'normal'
                        }
                    }

                    p.power = 0
                    p.isCharging = false
                    playerNeedsUpdate = true
                    turnRef.current = 'shooting'
                    setTurn('shooting')
                }
            } // end else (Space not held)

            // Luôn update player state để tránh render lag
            setPlayerState({ ...p })

            // --- LÝ THUYẾT ĐẠN BAY CHI TIẾT ---
            let aliveProjs = []
            let hitTriggered = false

            for (let i = 0; i < projectilesRef.current.length; i++) {
                let proj = projectilesRef.current[i]

                if (proj.delay && proj.delay > 0) {
                    proj.delay -= 1
                    aliveProjs.push(proj)
                    continue
                }

                const isHeavy = proj.type === 'heavy'
                const isSaw = proj.type === 'saw'
                const isFlare = proj.type === 'helicopter'
                const isNuke = proj.type === 'nuke'
                const isRainDrop = proj.type === 'rain_drop'
                const isUltra = proj.type === 'ultra'
                const isVortex = proj.type === 'ultra_vortex'
                const isThunder = proj.type === 'ultra_thunder'
                const isKamikaze = proj.type === 'enemy_kamikaze'

                // Trọng lực và Gió
                if (!isSaw && !isNuke && !isRainDrop && !isKamikaze) {
                    proj.vy += (isHeavy ? GRAVITY * 1.5 : GRAVITY)
                    proj.vx += windRef.current * (isHeavy ? 0.3 : 1)
                } else if (isNuke || isRainDrop) {
                    proj.vy += (isRainDrop ? GRAVITY * 0.8 : GRAVITY * 1.5)
                }

                proj.x += proj.vx
                proj.y += proj.vy

                let hit = false

                // 1. Va chạm màn hình ngoài
                if (proj.x < -200 || proj.x > WORLD_W + 200 || proj.y > WORLD_H + 200) {
                    continue // Biến mất
                }

                let dmgRadius = isHeavy ? 60 : (isNuke ? 150 : (isSaw ? 0 : (isRainDrop ? 20 : ((isUltra || isVortex || isThunder) ? 70 : 35))))
                let dmgAmount = isHeavy ? 60 : (isNuke ? 9999 : (isSaw ? 0 : (isRainDrop ? 15 : ((isUltra || isVortex || isThunder) ? 100 : 25))))

                // Xử lý đạn Răng Cưa (Khoan liên tục không điểm dừng)
                if (isSaw) {
                    explodeTerrain(proj.x, proj.y, 25)
                    if (!proj.hitIds) proj.hitIds = new Set()

                    for (let j = 0; j < enemiesRef.current.length; j++) {
                        const e = enemiesRef.current[j]
                        if (Math.hypot(proj.x - e.x, proj.y - e.y) < 35 && !proj.hitIds.has(e.id)) {
                            // Cưa bay trúng: Trừ 80% Max HP
                            let dmg = Math.floor((e.maxHp || 100) * 0.8)
                            e.hp -= dmg
                            proj.hitIds.add(e.id)
                            setExplosions(ex => [...ex, { id: Math.random(), x: e.x, y: e.y, radius: 40 }])
                            spawnText(`-${dmg}`, e.x, e.y - 40, '#9c27b0')
                            setIsShaking(true)
                            setTimeout(() => setIsShaking(false), 300)

                            if (turnRef.current === 'shooting' && !proj.hasDropped) {
                                proj.hasDropped = true
                                const activeDrops = dropsRef.current.filter(d => !d.collected).length
                                if (activeDrops < 5) {
                                    const DROP_TYPES = ['hp', 'hpFull', 'wind', 'x2', 'x3', 'x5', 'helicopter', 'saw', 'rain', 'poison', 'teleport']
                                    dropsRef.current.push({
                                        id: Math.random(),
                                        x: 100 + Math.random() * (WORLD_W - 200),
                                        y: -50 - Math.random() * 100, // trên trời thả xuống
                                        type: DROP_TYPES[Math.floor(Math.random() * DROP_TYPES.length)],
                                        vy: 0.5 + Math.random(),
                                        collected: false,
                                        isFloating: Math.random() > 0.5,
                                        targetY: 50 + Math.random() * (WORLD_H - 250)
                                    })
                                }
                            }
                        }
                    }
                } else {
                    if (proj.isEnemy) {
                        // Cú nổ của Mèo nhắm vào Player
                        const playerCenterY = getTerrainY(p.x, TANK_W) - TANK_H / 2
                        if (Math.hypot(proj.x - p.x, proj.y - playerCenterY) < (isKamikaze ? 60 : 40)) {
                            hit = true
                            const eDmg = isKamikaze ? 50 : 25   // Kamikaze = x2 sát thương (50 HP)
                            p.hp -= eDmg
                            playerNeedsUpdate = true
                            spawnText(`-${eDmg}`, p.x, playerCenterY - 40, '#ff003c')
                            if (isKamikaze) {
                                spawnText('💥 KAMIKAZE!', p.x, playerCenterY - 60, '#ff003c')
                                setIsShaking(true)
                                setTimeout(() => setIsShaking(false), 800)
                            }
                            if (p.hp <= 0) {
                                p.hp = 0
                                setGameState('gameover')
                            }
                        }
                    } else {
                        // Player Nã vào Cỏ cây Quái thú
                        for (let j = 0; j < enemiesRef.current.length; j++) {
                            const e = enemiesRef.current[j]
                            if (Math.hypot(proj.x - e.x, proj.y - e.y) < (isRainDrop ? 20 : 30)) {
                                hit = true
                                let realDmg = (isNuke ? 9999 : dmgAmount)
                                e.hp -= realDmg
                                spawnText(`-${realDmg}`, e.x, e.y - 30, isNuke ? '#ff003c' : (isUltra ? '#ff8c00' : (proj.type === 'poison' ? '#00ffaa' : '#ffea00')))
                                if (isUltra) {
                                    spawnText('🔥 ĐẠU KỲ ULTRA!! 🔥', e.x, e.y - 60, '#ff4500')
                                    for (let k = 0; k < 4; k++) {
                                        setTimeout(() => {
                                            setExplosions(ex => [...ex, { id: Math.random(), x: e.x + (Math.random() - 0.5) * 60, y: e.y + (Math.random() - 0.5) * 60, radius: 50 + Math.random() * 40, color: ['#ff4500', '#ff8c00', '#ffea00', '#ff007f'][k] }])
                                        }, k * 80)
                                    }
                                    setIsShaking(true)
                                    setTimeout(() => setIsShaking(false), 600)
                                }

                                if (proj.type === 'poison') {
                                    e.poisonTurns = 3
                                    spawnText('BỊ NHIỄM ĐỘC!', e.x, e.y - 50, '#00ffaa')
                                }

                                if (turnRef.current === 'shooting' && !proj.hasDropped) {
                                    proj.hasDropped = true
                                    const activeDrops = dropsRef.current.filter(d => !d.collected).length
                                    if (activeDrops < 5) {
                                        const DROP_TYPES = ['hp', 'hpFull', 'wind', 'x2', 'x3', 'x5', 'helicopter', 'saw', 'rain', 'poison', 'teleport']
                                        dropsRef.current.push({
                                            id: Math.random(),
                                            x: 100 + Math.random() * (WORLD_W - 200),
                                            y: -50 - Math.random() * 100,
                                            type: DROP_TYPES[Math.floor(Math.random() * DROP_TYPES.length)],
                                            vy: 0.5 + Math.random(),
                                            collected: false,
                                            isFloating: Math.random() > 0.5,
                                            targetY: 50 + Math.random() * (WORLD_H - 250)
                                        })
                                    }
                                }
                                break
                            }
                        }
                    }

                    // 2.5 Va chạm Hộp Quà (Drops)
                    if (!hit) {
                        for (let d of dropsRef.current) {
                            if (!d.collected && Math.hypot(proj.x - d.x, proj.y - d.y) < 25) {
                                d.collected = true
                                setItems(prev => ({ ...prev, [d.type]: (prev[d.type] || 0) + 1 }))
                                spawnText(`+1 ${d.type.toUpperCase()}`, d.x, d.y - 20, '#ffea00')
                                setExplosions(ex => [...ex, { id: Math.random(), x: d.x, y: d.y, radius: 25, color: '#00ffaa' }])
                                hit = true // Đạn nổ
                                hitTriggered = true
                                break
                            }
                        }
                    }

                    // 3. Va chạm Đất (Terrain Raycast)
                    if (!hit) {
                        const tx = Math.max(0, Math.min(WORLD_W - 1, Math.floor(proj.x)))
                        if (proj.y >= terrainRef.current[tx]) hit = true
                    }

                    if (hit) {
                        if (isFlare) {
                            // Điểm ném trúng -> Thả một quả Nuke ở tọa độ Y rất cao
                            projectilesRef.current.push({
                                id: Math.random(),
                                x: proj.x, y: -400,
                                vx: 0, vy: 5,
                                type: 'nuke',
                                isEnemy: false
                            })
                            // Lắp khói xanh đánh dấu vị trí Flare
                            setExplosions(ex => [...ex, { id: Math.random(), x: proj.x, y: proj.y, radius: 30, color: '#00ffaa' }])
                            spawnText('Nuke Calling...', proj.x, proj.y - 40, '#00ffaa')
                            setIsShaking(true)
                            setTimeout(() => setIsShaking(false), 200)
                        } else if (proj.type === 'rain') {
                            for (let k = 0; k < 15; k++) {
                                projectilesRef.current.push({
                                    id: Math.random(),
                                    x: proj.x + (Math.random() * 200 - 100),
                                    y: -100 - Math.random() * 300,
                                    vx: (Math.random() - 0.5) * 2, vy: 4 + Math.random() * 3,
                                    type: 'rain_drop',
                                    isEnemy: false
                                })
                            }
                            setExplosions(ex => [...ex, { id: Math.random(), x: proj.x, y: proj.y, radius: 30, color: '#00ccff' }])
                            spawnText('🌧️ MƯA ĐẠN!', proj.x, proj.y - 40, '#00ccff')
                        } else if (proj.type === 'teleport') {
                            explodeTerrain(proj.x, proj.y, 15)
                            setExplosions(ex => [...ex, { id: Math.random(), x: proj.x, y: proj.y, radius: 30, color: '#cc00ff' }])
                            p.x = proj.x
                            p.y = proj.y - TANK_H - 10
                            playerNeedsUpdate = true
                            spawnText('✨ DỊCH CHUYỂN!', p.x, p.y - 40, '#cc00ff')
                        } else if (isVortex) {
                            // Ultra-Vortex: hiệu ứng xương tím, nổ tâm rộng, địch trong vòng 150px nhận 125 dmg
                            for (let k = 0; k < 8; k++) {
                                const angle = (k / 8) * Math.PI * 2
                                const ox = Math.cos(angle) * 60
                                const oy = Math.sin(angle) * 60
                                setTimeout(() => {
                                    explodeTerrain(proj.x + ox * 0.5, proj.y + oy * 0.5, 40)
                                    setExplosions(ex => [...ex, { id: Math.random(), x: proj.x + ox, y: proj.y + oy, radius: 40, color: k % 2 === 0 ? '#cc00ff' : '#ff007f' }])
                                    setTimeout(() => setExplosions(ex => ex.slice(1)), 700)
                                }, k * 50)
                            }
                            explodeTerrain(proj.x, proj.y, 80)
                            setExplosions(ex => [...ex, { id: Math.random(), x: proj.x, y: proj.y, radius: 100, color: '#cc00ff' }])
                            // Địch trong vòng 150px nhận võ ngoài
                            enemiesRef.current.forEach(e => {
                                if (e.hp > 0 && Math.hypot(proj.x - e.x, proj.y - e.y) < 150) {
                                    e.hp -= 125
                                    spawnText('-125 🌀VORTEX', e.x, e.y - 40, '#cc00ff')
                                }
                            })
                            setIsShaking(true)
                            setTimeout(() => setIsShaking(false), 1000)
                            spawnText('🌀 VORTEX BLAST!! 🌀', proj.x, proj.y - 60, '#cc00ff')
                        } else if (isThunder) {
                            // Ultra-Thunder: sét đánh xuống tất cả địch đang sống
                            enemiesRef.current.forEach((e, idx) => {
                                if (e.hp <= 0) return
                                const delay = idx * 250
                                setTimeout(() => {
                                    e.hp -= 90
                                    spawnText('-90 ⚡SÉT', e.x, e.y - 40, '#ffea00')
                                    for (let k = 0; k < 3; k++) {
                                        setTimeout(() => {
                                            setExplosions(ex => [...ex, { id: Math.random(), x: e.x + (Math.random() - 0.5) * 30, y: e.y - Math.random() * 60, radius: 30, color: '#ffea00' }])
                                            setTimeout(() => setExplosions(ex => ex.slice(1)), 400)
                                        }, k * 80)
                                    }
                                    explodeTerrain(e.x, e.y, 30)
                                    setEnemies([...enemiesRef.current])
                                }, delay)
                            })
                            setIsShaking(true)
                            setTimeout(() => setIsShaking(false), 1200)
                            spawnText('⚡ THUNDER STORM!! ⚡', proj.x, proj.y - 60, '#ffea00')
                        } else if (isUltra) {
                            // Ultra-A: Triple Shot Explosion — Siêu nổ hàng loạt
                            for (let k = 0; k < 6; k++) {
                                const ox = (Math.random() - 0.5) * 100
                                const oy = (Math.random() - 0.5) * 80
                                setTimeout(() => {
                                    explodeTerrain(proj.x + ox, proj.y + oy, 50)
                                    setExplosions(ex => [...ex, { id: Math.random(), x: proj.x + ox, y: proj.y + oy, radius: 60 + Math.random() * 40, color: ['#ff4500', '#ff8c00', '#ffea00', '#ff007f', '#cc00ff', '#00f3ff'][k] }])
                                    setTimeout(() => setExplosions(ex => ex.slice(1)), 600)
                                }, k * 60)
                            }
                            setIsShaking(true)
                            setTimeout(() => setIsShaking(false), 800)
                            spawnText('🔥 ULTRA BLAST!! 🔥', proj.x, proj.y - 50, '#ff8c00')
                        } else {
                            // PHÁT NỔ TẠI ĐÂY!
                            explodeTerrain(proj.x, proj.y, dmgRadius)
                            setExplosions(ex => [...ex, { id: Math.random(), x: proj.x, y: proj.y, radius: dmgRadius, color: isNuke ? '#ff003c' : undefined }])
                            setTimeout(() => setExplosions(ex => ex.slice(1)), 500)
                            if (isHeavy || isNuke) {
                                setIsShaking(true)
                                setTimeout(() => setIsShaking(false), isNuke ? 800 : 300)
                            }
                        }

                        hitTriggered = true
                        continue // Đạn biến mất
                    }
                }

                aliveProjs.push(proj)
            }

            if (projectilesRef.current.length !== aliveProjs.length || aliveProjs.length > 0) {
                projectilesRef.current = aliveProjs
                setProjectiles([...aliveProjs])
            }

            // --- XỬ LÝ QUÀ RƠI ---
            let dropsUpdated = false
            dropsRef.current.forEach(d => {
                if (d.collected) return
                let ty = d.isFloating ? d.targetY : getTerrainY(d.x, 24) - 15
                if (d.y < ty) {
                    d.y += d.vy
                    if (d.y > ty) d.y = ty
                    dropsUpdated = true
                }
            })
            if (dropsUpdated || hitTriggered) {
                setDrops([...dropsRef.current])
            }

            // --- WAIT TIMER LOGIC XỬ LÝ LƯỢT ---
            // Chờ đạn và hiệu ứng bay xong PLUS player/mèo rơi xong mới tiếp tục
            const playerSettled = Math.abs(p.y - (getTerrainY(p.x, TANK_W) - TANK_H)) < 14
            const enemiesSettled = enemiesRef.current.every(e => {
                const ey = getTerrainY(e.x, 24) - 12
                return Math.abs(e.y - ey) < 14 || ey >= WORLD_H - 20
            })
            if (projectilesRef.current.length === 0 && playerSettled && enemiesSettled) {
                waitTimerRef.current += 1
                if (waitTimerRef.current > 60) { // ~1s sau khi mọi thứ ổn định
                    if (turnRef.current === 'shooting') {
                        // Player vừa bắn xong đạn rớt thì tới lượt AI Enemy!
                        turnRef.current = 'enemy'
                        setTurn('enemy')

                        // Xử lý nọc độc mỗi đầu turn địch
                        let poisonChanged = false
                        enemiesRef.current.forEach(e => {
                            if (e.poisonTurns && e.poisonTurns > 0) {
                                let pdmg = Math.floor(e.maxHp * 0.15)
                                e.hp -= pdmg
                                e.poisonTurns -= 1
                                spawnText(`☠️ -${pdmg} ĐỘC!`, e.x, e.y - 40, '#00ffaa')
                                setExplosions(ex => [...ex, { id: Math.random(), x: e.x, y: e.y, radius: 25, color: '#00ffaa' }])
                                poisonChanged = true
                            }
                        })
                        if (poisonChanged) setEnemies([...enemiesRef.current])

                    } else if (turnRef.current === 'enemy_shooting') {
                        // AI bắn xong thì back turn Player
                        turnRef.current = 'player'
                        setTurn('player')
                        playerRef.current.mp = 80 // Hồi lại xăng hạn chế
                        setPlayerState({ ...playerRef.current })
                        setItemUsedThisTurn(false)
                        setTimeLeft(40) // Reset thời gian bắn mảng 40s
                    }
                }
            } else {
                waitTimerRef.current = 0
            }

            // --- XỬ LÝ RƠI (GRAVITY) CHO PLAYER ---
            let targetPY = getTerrainY(p.x, TANK_W) - TANK_H

            // Nếu targetPY >= WORLD_H - 10: vực quá sâu = chết ngay
            if (targetPY >= WORLD_H - 10 && p.hp > 0) {
                p.hp = 0
                p.y = WORLD_H + 100
                keysRef.current.clear()
                spawnText('Cún ơiii~ Ngã xuống vực rồiiiii 😭', p.x, WORLD_H - 120, '#ff003c')
                setTimeout(() => setGameState('gameover'), 1500)
            } else if (p.y < targetPY) {
                p.y += 12 // Tăng tốc rơi để xử lý nhanh hơn
                if (p.y > targetPY) p.y = targetPY
            } else if (p.y > targetPY + 2) {
                p.y -= 12
                if (p.y < targetPY) p.y = targetPY
            }

            // Dự phòng vự thảm - quá sâu so với đáy map
            if (p.y > WORLD_H + 20 && p.hp > 0) {
                p.hp = 0
                playerNeedsUpdate = true
                keysRef.current.clear()
                spawnText('Cún ơiii~ Ngã xuống vực rồiiiii 😭', p.x, WORLD_H - 120, '#ff003c')
                setTimeout(() => setGameState('gameover'), 1500)
            }

            let enemiesUpdated = false
            let aliveEnemies = enemiesRef.current
            aliveEnemies.forEach(e => {
                let targetEY = getTerrainY(e.x, 24) - 12
                if (e.y < targetEY) {
                    e.y += 12 // Mèo rơi nhanh hơn
                    enemiesUpdated = true
                } else if (e.y > targetEY + 2) {
                    e.y -= 12
                    if (e.y < targetEY) e.y = targetEY
                    enemiesUpdated = true
                }

                if ((e.y > WORLD_H + 50) || (targetEY >= WORLD_H - 20 && e.hp > 0)) {
                    e.hp = 0
                    enemiesUpdated = true
                    spawnText('Byebye bạn Mèo hihi~ 🐾', e.x, Math.min(e.y, WORLD_H - 100), '#fff')
                }
            })

            if (hitTriggered || enemiesUpdated) {
                let remaining = aliveEnemies.filter(e => e.hp > 0)
                if (remaining.length !== aliveEnemies.length || hitTriggered) {
                    enemiesRef.current = remaining
                    setEnemies([...remaining])
                } else if (enemiesUpdated) {
                    setEnemies([...aliveEnemies]) // Just update positions when falling
                }

                const flyingProjs = projectilesRef.current.filter(p => p.isEnemy || p.type.startsWith('enemy_')).length
                if (remaining.length === 0 && p.hp > 0 && flyingProjs === 0) {
                    setGameState('won')
                }
            }

        }, 16) // ~60fps Physics Update

        return () => clearInterval(loop)
    }, [gameState])

    // --- DẮ CÓ HOOKS này TRưỚC mọi early return (Rules of Hooks) ---
    const trajectoryDots = useMemo(() => {
        if (turn !== 'player' || gameState !== 'playing') return []
        try {
            const p = playerState
            const rad = p.angle * (Math.PI / 180)
            // Dùng power thật (nếu đang nạp lực), không thì preview ở 60%
            const previewPower = p.power > 0 ? p.power : 60
            const speed = (previewPower / 100) * 18
            const isHeavyAmmo = ammoType === 'heavy'
            const isSaw = ammoType === 'saw'
            // Dùng đúng gravity và gió như engine thật
            const GRAV = isSaw ? 0 : (isHeavyAmmo ? GRAVITY * 1.5 : GRAVITY)
            const windPerFrame = isSaw ? 0 : (windRef.current * (isHeavyAmmo ? 0.3 : 1.0))
            let vx = Math.cos(rad) * speed * p.dir
            let vy = -Math.sin(rad) * speed
            let px = p.x
            let py = (getTerrainY(p.x, TANK_W) - TANK_H) - 2
            const dots = []
            for (let i = 0; i < 200; i++) {
                vx += windPerFrame
                vy += GRAV
                px += vx
                py += vy
                if (px < 0 || px > WORLD_W || py > WORLD_H + 50) break
                const tx = Math.max(0, Math.min(WORLD_W - 1, Math.floor(px)))
                if (terrainRef.current[tx] && py >= terrainRef.current[tx]) break
                if (i % 2 === 0) {
                    dots.push({ x: px, y: py, alpha: Math.max(0.08, 1 - i / 200) })
                }
            }
            return dots
        } catch (e) {
            return []
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerState.angle, playerState.dir, playerState.power, wind, ammoType, turn, gameState])

    const TRAJ_COLOR = ammoType === 'heavy' ? '#ffaa00' : (ammoType === 'saw' ? '#cc44ff' : (ammoType === 'poison' ? '#00ffaa' : '#00f3ff'))

    // --- RENDERERS ---
    if (gameState === 'menu') {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#020205', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
                    <h1 style={{ color: '#ffea00', textShadow: '0 0 20px #ffea00', fontSize: '3rem', margin: '0', textTransform: 'uppercase' }}>🎀 Cún Đại Chiến Mèo 🎀</h1>
                    <p style={{ color: '#00f3ff', fontSize: '1.1rem', maxWidth: '600px', margin: '10px auto', lineHeight: '1.6' }}>
                        Em Cún xinh xắn đang bị bọn Mèo nghịch ngợm tấn công rồi chủ ơi! Chọn chiến trường và giúp Cún nào~ 🐶💕
                    </p>
                    <button
                        onClick={() => setShowGuide(true)}
                        style={{ marginTop: '10px', padding: '10px 30px', background: 'linear-gradient(135deg, #ff007f, #cc00ff)', border: 'none', borderRadius: '25px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,0,127,0.5)', letterSpacing: '1px' }}
                    >
                        📖 Luật Chơi & Hướng Dẫn
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', width: '90%', maxWidth: '1000px' }}>

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => {
                        const th = mapThemes[m]
                        return (
                            <div key={m} style={{ background: '#111', border: `2px solid ${th.color}`, borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 0 15px ${th.color}` }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: th.color, marginBottom: '10px' }}>Map {m}: {th.name}</div>
                                <MapPreview lvl={m} />
                                <button onClick={() => initMap(m)} style={{ padding: '10px 30px', background: th.color, border: 'none', borderRadius: '20px', color: m === 4 ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>Vào Trận</button>
                            </div>
                        )
                    })}

                </div>
                <button onClick={onBack} style={{ marginTop: '30px', paddingBottom: '30px', background: 'transparent', color: '#888', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.2rem' }}>Quay lại Menu Chính</button>

                {/* POPUP HƯỚNG DẪN */}
                {showGuide && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowGuide(false)}>
                        <div style={{ background: 'linear-gradient(160deg,#0a0a1a,#1a0a2e)', border: '2px solid #ff007f', borderRadius: '24px', padding: '36px 48px', maxWidth: '700px', width: '90%', boxShadow: '0 0 60px rgba(255,0,127,0.4)', color: 'white', position: 'relative' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowGuide(false)} style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', color: '#ff4d6d', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            <h2 style={{ color: '#ffea00', textAlign: 'center', fontSize: '1.8rem', marginBottom: '20px', textShadow: '0 0 10px #ffea00' }}>🐶 Cẩm Nang Chiến Đấu Của Cún! 🐶</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem', lineHeight: '1.8' }}>
                                <div style={{ background: 'rgba(0,243,255,0.1)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(0,243,255,0.3)' }}>
                                    <div style={{ color: '#00f3ff', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.05rem' }}>🎮 Điều Khiển</div>
                                    <div>⬅ ➡ hoặc A/D — Di chuyển Cún</div>
                                    <div>⬆ ⬇ hoặc W/S — Chỉnh góc súng</div>
                                    <div>🔘 Giữ <strong>SPACE</strong> — Nạp lực bắn</div>
                                    <div>🔘 Thả <strong>SPACE</strong> — Khai hoả!</div>
                                </div>
                                <div style={{ background: 'rgba(255,0,127,0.1)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,0,127,0.3)' }}>
                                    <div style={{ color: '#ff4d6d', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.05rem' }}>⚔️ Luật Chơi</div>
                                    <div>🐾 Mỗi lượt 40 giây — Hết giờ mất lượt</div>
                                    <div>🎒 Mỗi lượt chỉ dùng 1 Item trong Rương</div>
                                    <div>💥 Bắn trúng địch → Hộp Quà rơi từ trời</div>
                                    <div>🎯 Tiêu diệt hết bọn Mèo để qua màn!</div>
                                </div>
                                <div style={{ background: 'rgba(255,234,0,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,234,0,0.3)' }}>
                                    <div style={{ color: '#ffea00', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.05rem' }}>🎁 Items Rương Đồ</div>
                                    <div>❤️ Hồi 50 HP — 💖 Hồi đầy 100% HP</div>
                                    <div>🌀 Ngưng Gió — x2/x3/x5 Đạn Chùm</div>
                                    <div>🚁 Nuke — ⚙️ Cưa Xuyên Map</div>
                                    <div>🌧️ Mưa Đạn — ☠️ Tơ Độc (3 lượt -15%HP)</div>
                                    <div>✨ Teleport — Dịch chuyển đến điểm bắn!</div>
                                </div>
                                <div style={{ background: 'rgba(0,255,170,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(0,255,170,0.3)' }}>
                                    <div style={{ color: '#00ffaa', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.05rem' }}>💡 Mẹo Cún Thông Thái</div>
                                    <div>🎯 Bắn trúng Hộp Quà lơ lửng để nhặt!</div>
                                    <div>💨 Chú ý chiều Gió trước khi bắn nha~</div>
                                    <div>🛡️ Đứng ở chỗ cao để có lợi thế bắn!</div>
                                    <div>☠️ Tơ Độc + Đạn Chùm = Siêu sát thương!</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '24px', color: '#aaa', fontSize: '0.9rem' }}>💕 Nhấn vào đây để đóng lại nha Cún ơi~</div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const pY = playerState.y
    const currTheme = mapThemes[level] || mapThemes[1]

    return (
        <div style={{ width: '100vw', height: '100vh', background: currTheme.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* HUD TOP BAR - gọn nhẹ, không chồng map */}
            <div style={{ position: 'absolute', top: 8, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', pointerEvents: 'none' }}>

                {/* Trái: Nút thoát */}
                <button
                    onClick={() => setGameState('menu')}
                    style={{ pointerEvents: 'auto', padding: '5px 14px', background: 'rgba(0,0,0,0.65)', color: '#00f3ff', border: '1.5px solid #00f3ff', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                >🏳️ Thoát</button>

                {/* Giữa: Lượt đánh */}
                <div style={{ padding: '6px 22px', borderRadius: '22px', background: turn === 'player' ? '#00ffaa' : (turn === 'enemy' ? '#ff003c' : '#333'), color: turn === 'player' ? 'black' : 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 0 5px rgba(255,255,255,0.5)', transition: 'background 0.3s', boxShadow: `0 0 16px ${turn === 'player' ? '#00ffaa' : '#ff4d6d'}` }}>
                    {turn === 'player' ? `🐶 Cún tới lượt! ⏱ ${timeLeft}s` : (turn === 'enemy' ? '😼 Mèo đang ngắm...' : '🚀 Đạn đang bay~')}
                </div>

                {/* Phải: Lực gió compact */}
                <div style={{ pointerEvents: 'none', background: 'rgba(0,0,0,0.65)', padding: '5px 12px', borderRadius: '14px', border: `1.5px solid ${wind > 0 ? '#00ffaa' : (wind < 0 ? '#ff4d6d' : '#555')}`, color: wind > 0 ? '#00ffaa' : (wind < 0 ? '#ff4d6d' : '#aaa'), fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🌬️</span>
                    <span>{wind > 0 ? '▶▶' : (wind < 0 ? '◀◀' : '—')}</span>
                    <span>{Math.abs(wind).toFixed(2)}</span>
                </div>
            </div>

            {/* BOTTOM TOOLBAR - nút toggle ẩn/hiện */}
            <div style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 100, pointerEvents: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '4px' }}>

                    {/* Nút thu/mở */}
                    <button
                        onClick={() => setShowUI(prev => !prev)}
                        style={{ pointerEvents: 'auto', marginBottom: '3px', padding: '3px 20px', background: 'rgba(0,0,0,0.7)', border: '1px solid #555', borderRadius: '10px', color: '#aaa', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                        {showUI ? '▼ Thu Gọn' : '▲ Mở Rương & Đạn'}
                    </button>

                    {showUI && (
                        <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '7px 14px', background: 'rgba(0,0,0,0.88)', borderRadius: '18px', border: '1px solid #444', maxWidth: '99vw' }}>

                            {/* KHO ĐẠN */}
                            <span style={{ color: '#aaa', fontWeight: 'bold', fontSize: '0.78rem', alignSelf: 'center' }}>🔫</span>
                            <button onClick={() => { setAmmoType('normal'); ammoRef.current = 'normal' }} style={{ padding: '5px 11px', borderRadius: '11px', background: ammoType === 'normal' ? '#00f3ff' : 'transparent', color: ammoType === 'normal' ? 'black' : '#00f3ff', border: '2px solid #00f3ff', cursor: 'pointer', fontWeight: 'bold', outline: 'none', fontSize: '0.78rem' }}>Đạn</button>
                            <button onClick={() => { setAmmoType('heavy'); ammoRef.current = 'heavy' }} style={{ padding: '5px 11px', borderRadius: '11px', background: ammoType === 'heavy' ? '#ffaa00' : 'transparent', color: ammoType === 'heavy' ? 'black' : '#ffaa00', border: '2px solid #ffaa00', cursor: 'pointer', fontWeight: 'bold', outline: 'none', fontSize: '0.78rem' }}>Bom Tạ</button>

                            <div style={{ width: '1px', height: '22px', background: '#555', alignSelf: 'center' }} />

                            {/* RƯƠNG ĐỒ */}
                            <span style={{ color: '#ffea00', fontWeight: 'bold', fontSize: '0.78rem', alignSelf: 'center' }}>🎒</span>

                            <button
                                onClick={() => {
                                    if (!itemUsedThisTurn && items.hp > 0 && turn === 'player' && playerRef.current.hp < 500) {
                                        setItems(prev => ({ ...prev, hp: prev.hp - 1 }))
                                        let healAmt = Math.min(500 - playerRef.current.hp, 150)
                                        playerRef.current.hp += healAmt
                                        setPlayerState({ ...playerRef.current })
                                        spawnText(`+${healAmt} HP`, playerRef.current.x, playerRef.current.y - 60, '#00ffaa')
                                        setItemUsedThisTurn(true)
                                    }
                                }}
                                style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: '#ff4d6d', color: 'white', border: 'none', cursor: (!itemUsedThisTurn && items.hp > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.hp > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.hp > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.72rem' }}
                                title="Bơm 150HP"
                            >❤️{items.hp}</button>

                            <button
                                onClick={() => {
                                    if (!itemUsedThisTurn && items.hpFull > 0 && turn === 'player' && playerRef.current.hp < 500) {
                                        setItems(prev => ({ ...prev, hpFull: prev.hpFull - 1 }))
                                        playerRef.current.hp = 500
                                        setPlayerState({ ...playerRef.current })
                                        spawnText(`+MAX HP`, playerRef.current.x, playerRef.current.y - 60, '#00ffaa')
                                        setItemUsedThisTurn(true)
                                    }
                                }}
                                style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: '#ff003c', color: 'white', border: 'none', cursor: (!itemUsedThisTurn && items.hpFull > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.hpFull > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.hpFull > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.72rem' }}
                                title="Hồi Sinh Đầy 100% Máu!"
                            >💖{items.hpFull}</button>

                            <button
                                onClick={() => {
                                    if (!itemUsedThisTurn && items.wind > 0 && turn === 'player') {
                                        setItems(prev => ({ ...prev, wind: prev.wind - 1 }))
                                        setWind(0); windRef.current = 0
                                        spawnText('Gió Ngừng Thổi!', playerRef.current.x, playerRef.current.y - 60, '#00ffaa')
                                        setItemUsedThisTurn(true)
                                    }
                                }}
                                style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: '#00ccff', color: 'white', border: 'none', cursor: (!itemUsedThisTurn && items.wind > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.wind > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.wind > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.72rem' }}
                                title="Hủy Lực Gió"
                            >🌀{items.wind}</button>

                            <button onClick={() => { if (!itemUsedThisTurn && items.x2 > 0 && turn === 'player') { setActiveMod('x2'); activeModRef.current = 'x2'; setItemUsedThisTurn(true); } }} style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: activeMod === 'x2' ? '#ffaa00' : '#444', color: 'white', border: activeMod === 'x2' ? '2px solid white' : 'none', cursor: (!itemUsedThisTurn && items.x2 > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.x2 > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.x2 > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.7rem' }} title="x2 Đạn">x2<br /><span style={{ fontSize: '0.6rem', color: '#ffea00' }}>{items.x2}</span></button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.x3 > 0 && turn === 'player') { setActiveMod('x3'); activeModRef.current = 'x3'; setItemUsedThisTurn(true); } }} style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: activeMod === 'x3' ? '#ff3300' : '#444', color: 'white', border: activeMod === 'x3' ? '2px solid white' : 'none', cursor: (!itemUsedThisTurn && items.x3 > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.x3 > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.x3 > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.7rem' }} title="x3 Đạn">x3<br /><span style={{ fontSize: '0.6rem', color: '#ffea00' }}>{items.x3}</span></button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.x5 > 0 && turn === 'player') { setActiveMod('x5'); activeModRef.current = 'x5'; setItemUsedThisTurn(true); } }} style={{ padding: '5px', borderRadius: '50%', width: '34px', height: '34px', background: activeMod === 'x5' ? '#cc00ff' : '#444', color: 'white', border: activeMod === 'x5' ? '2px solid white' : 'none', cursor: (!itemUsedThisTurn && items.x5 > 0 && turn === 'player') ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.x5 > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.x5 > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.7rem' }} title="x5 Đạn">x5<br /><span style={{ fontSize: '0.6rem', color: '#ffea00' }}>{items.x5}</span></button>

                            <div style={{ width: '1px', height: '22px', background: '#555', alignSelf: 'center' }} />

                            <button onClick={() => { if (!itemUsedThisTurn && items.helicopter > 0) { setAmmoType('helicopter'); ammoRef.current = 'helicopter'; setItemUsedThisTurn(true); } }} style={{ padding: '5px 9px', borderRadius: '11px', background: ammoType === 'helicopter' ? '#00ffaa' : 'transparent', color: ammoType === 'helicopter' ? 'black' : '#00ffaa', border: '2px solid #00ffaa', cursor: (!itemUsedThisTurn && items.helicopter > 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.helicopter > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.helicopter > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.75rem' }} title="Nuke">🚁{items.helicopter}</button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.saw > 0) { setAmmoType('saw'); ammoRef.current = 'saw'; setItemUsedThisTurn(true); } }} style={{ padding: '5px 9px', borderRadius: '11px', background: ammoType === 'saw' ? '#9c27b0' : 'transparent', color: ammoType === 'saw' ? 'white' : '#9c27b0', border: '2px solid #9c27b0', cursor: (!itemUsedThisTurn && items.saw > 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.saw > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.saw > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.75rem' }} title="Răng Cưa">⚙️{items.saw}</button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.rain > 0) { setAmmoType('rain'); ammoRef.current = 'rain'; setItemUsedThisTurn(true); } }} style={{ padding: '5px 9px', borderRadius: '11px', background: ammoType === 'rain' ? '#00ccff' : 'transparent', color: ammoType === 'rain' ? 'black' : '#00ccff', border: '2px solid #00ccff', cursor: (!itemUsedThisTurn && items.rain > 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.rain > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.rain > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.75rem' }} title="Mưa Đạn">🌧️{items.rain}</button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.poison > 0) { setAmmoType('poison'); ammoRef.current = 'poison'; setItemUsedThisTurn(true); } }} style={{ padding: '5px 9px', borderRadius: '11px', background: ammoType === 'poison' ? '#00ffaa' : 'transparent', color: ammoType === 'poison' ? 'black' : '#00ffaa', border: '2px solid #00ffaa', cursor: (!itemUsedThisTurn && items.poison > 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.poison > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.poison > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.75rem' }} title="Độc">☠️{items.poison}</button>
                            <button onClick={() => { if (!itemUsedThisTurn && items.teleport > 0) { setAmmoType('teleport'); ammoRef.current = 'teleport'; setItemUsedThisTurn(true); } }} style={{ padding: '5px 9px', borderRadius: '11px', background: ammoType === 'teleport' ? '#cc00ff' : 'transparent', color: ammoType === 'teleport' ? 'white' : '#cc00ff', border: '2px solid #cc00ff', cursor: (!itemUsedThisTurn && items.teleport > 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', outline: 'none', opacity: (!itemUsedThisTurn && items.teleport > 0) ? 1 : 0.25, filter: (!itemUsedThisTurn && items.teleport > 0) ? 'none' : 'grayscale(100%)', fontSize: '0.75rem' }} title="Dịch Chuyển">✨{items.teleport}</button>

                        </div>
                    )}
                </div>
            </div>

            {/* NÚT ULTRA - chỉ hiện khi HP < 50% (500 MAX HP => < 250) và chưa dùng */}
            {playerState.hp > 0 && playerState.hp < 250 && !ultraUsed && turn === 'player' && (
                <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 150 }}>
                    <button
                        onClick={() => {
                            if (!itemUsedThisTurn) {
                                setUltraUsed(true)
                                ultraUsedRef.current = true
                                setAmmoType('ultra')
                                ammoRef.current = 'ultra'
                                setItemUsedThisTurn(true)
                                spawnText('🔥 ULTRA CHẾN BẨU! 🔥', playerRef.current.x, playerRef.current.y - 60, '#ff4500')
                            }
                        }}
                        style={{
                            padding: '14px 40px', background: 'linear-gradient(135deg, #ff4500, #ff007f, #cc00ff)',
                            border: '3px solid #ff8c00', borderRadius: '40px', color: 'white',
                            fontWeight: 'bold', fontSize: '1.2rem', cursor: itemUsedThisTurn ? 'not-allowed' : 'pointer',
                            boxShadow: '0 0 30px #ff4500, 0 0 60px rgba(255,69,0,0.5)',
                            animation: 'ultra-pulse 1s ease-in-out infinite alternate',
                            opacity: itemUsedThisTurn ? 0.4 : 1,
                            letterSpacing: '2px', textShadow: '0 0 10px #fff'
                        }}
                        title="Kỹ Năng Đặc Biệt! Bắn 3 viên phân tán x4 sát thương! Dùng 1 lần duy nhất!"
                    >
                        🔥 ULTRA SKILL 🔥 {ammoType === 'ultra' ? '(Sẵn Sàng!)' : ''}
                    </button>
                </div>
            )}

            {/* GỢI Ý khi HP < 50% (250) và chưa dùng ultra */}
            {playerState.hp > 0 && playerState.hp < 250 && !ultraUsed && turn === 'player' && (
                <div style={{
                    position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(255,69,0,0.9)', padding: '8px 20px', borderRadius: '20px',
                    color: 'white', fontWeight: 'bold', fontSize: '0.95rem', zIndex: 110,
                    animation: 'ultra-pulse 0.8s ease-in-out infinite alternate',
                    boxShadow: '0 0 15px rgba(255,69,0,0.7)', whiteSpace: 'nowrap'
                }}>
                    🔥 Cún đang bị thương! Hãy dùng kỹ năng đặc biệt ULTRA nào~
                </div>
            )}

            {/* BẢN ĐỒ GAME BOX SCALED (Tối ưu responsive, 1200x650 cứng) */}
            <div style={{
                width: `${WORLD_W}px`, height: `${WORLD_H}px`,
                position: 'relative',
                transform: `scale(${scaleRatio})`,
                transformOrigin: 'center center',
            }}>
                <div className={isShaking ? 'screen-shake' : ''} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8)'
                }}>

                    {/* --- SVG MAP RENDER --- */}
                    <div style={{ position: 'absolute', left: 0, top: 0, width: WORLD_W, height: WORLD_H }}>

                        {/* Lớp Thời Tiết (Weather Layer Overlay) */}
                        {level === 8 && <div className="weather-rain" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />}
                        {level === 9 && <div className="weather-snow" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />}
                        {level === 7 && <div className="weather-sun" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />}

                        {/* Trang trí Biển / Vực Nước */}
                        {(level === 8 || level === 5) && <div style={{ position: 'absolute', bottom: 0, width: WORLD_W, height: '100px', background: 'rgba(0, 150, 255, 0.35)', zIndex: 2, boxShadow: '0 -10px 30px rgba(0,200,255,0.3)', pointerEvents: 'none' }} />}

                        <svg width={WORLD_W} height={WORLD_H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                            <polygon points={terrainPolygons} fill={currTheme.fill} stroke={currTheme.stroke} strokeWidth="6" strokeLinejoin="round" />
                            {/* TRAJECTORY PREVIEW */}
                            {trajectoryDots.map((dot, i) => (
                                <circle
                                    key={i}
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={i === 0 ? 4 : (dot.alpha > 0.6 ? 3 : 2)}
                                    fill={TRAJ_COLOR}
                                    opacity={dot.alpha * 0.8}
                                    style={{ filter: `drop-shadow(0 0 3px ${TRAJ_COLOR})` }}
                                />
                            ))}
                        </svg>

                        {/* --- RENDER PLAYER NHÂN VẬT --- */}
                        <div style={{
                            position: 'absolute', left: playerState.x, top: pY,
                            width: TANK_W, height: TANK_H,
                            transform: `translate(-50%, 0) rotate(${pY > WORLD_H - 100 ? 540 : 0}deg)`, zIndex: 5,
                            opacity: pY > WORLD_H - 50 ? 0 : 1,
                            transition: 'transform 1s ease-in, opacity 0.5s'
                        }}>
                            {/* Thanh Máu & MP */}
                            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '40px', background: 'rgba(255, 0, 0, 0.7)', height: '6px', borderRadius: '3px', overflow: 'hidden', border: '1px solid #000' }}>
                                <div style={{ width: `${(playerState.hp / 500) * 100}%`, background: '#00ffaa', height: '100%', transition: 'width 0.3s' }} />
                            </div>
                            <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', width: '40px', background: 'rgba(51, 51, 51, 0.7)', height: '5px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #000' }}>
                                <div style={{ width: `${Math.max(0, (playerState.mp / 80) * 100)}%`, background: '#ffea00', height: '100%' }} />
                            </div>

                            {/* Container Hình Nộm */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: '50%',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                transform: `translate(-50%, 0) scaleX(${playerState.dir})`
                            }}>
                                {/* Đầu = Avatar */}
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%', background: '#fff',
                                    backgroundImage: `url(${avatar || kittyImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                    border: '2px solid #ff4d6d', zIndex: 3, boxShadow: '0 0 10px #ff4d6d'
                                }} />
                                {/* Thân = Váy Hồng Phát Sáng (Css hình thang/Tam giác) */}
                                <div style={{
                                    width: '0px', height: '0px',
                                    borderLeft: '10px solid transparent',
                                    borderRight: '10px solid transparent',
                                    borderBottom: '16px solid #ff007f',
                                    marginTop: '-2px', zIndex: 2,
                                    filter: 'drop-shadow(0 0 8px #ff007f)'
                                }} />

                                {/* 2 Chân */}
                                <div style={{ display: 'flex', gap: '5px', marginTop: '-2px', zIndex: 1 }}>
                                    <div style={{ width: '4px', height: '10px', background: '#ffe3e8', borderRadius: '2px', transformOrigin: 'top', animation: playerState.isMoving ? 'walk-leg-1 0.4s infinite alternate ease-in-out' : 'rotate(-10deg)', boxShadow: '0 0 5px #ff007f' }} />
                                    <div style={{ width: '4px', height: '10px', background: '#ffe3e8', borderRadius: '2px', transformOrigin: 'top', animation: playerState.isMoving ? 'walk-leg-2 0.4s infinite alternate ease-in-out' : 'rotate(10deg)', boxShadow: '0 0 5px #ff007f' }} />
                                </div>
                            </div>

                            {/* Cánh Tay & Nòng Súng cầm tay */}
                            <div style={{
                                position: 'absolute', top: '10px', left: '50%', width: '25px', height: '5px',
                                background: '#ff4d6d', border: '1px solid #ff007f', borderRadius: '2px',
                                transformOrigin: '0% 50%',
                                transform: `translate(0, -50%) rotate(${playerState.dir === 1 ? -playerState.angle : playerState.angle - 180}deg)`,
                                zIndex: 4, boxShadow: '0 0 8px #ff4d6d'
                            }}>
                                {/* Nòng đỏ */}
                                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '6px', background: '#fff', boxShadow: '0 0 5px white' }} />
                            </div>

                            {/* Vạch kẻ góc hiển thị ảo */}
                            <div style={{ position: 'absolute', top: '-65px', left: '50%', transform: 'translateX(-50%)', width: '60px', textAlign: 'center', color: '#ffea00', fontWeight: 'bold', fontSize: '13px', textShadow: '0px 0px 4px #000, 1px 1px 0px #000' }}>
                                {playerState.angle}°
                            </div>

                            {/* Thanh gồng LỰC BẮN */}
                            {playerState.power > 0 && (
                                <div style={{ position: 'absolute', bottom: '-20px', left: '-10px', width: '60px', height: '10px', background: '#333', border: '2px solid white', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ width: `${playerState.power}%`, height: '100%', background: playerState.power > 80 ? '#ff003c' : '#00ffaa', transition: 'width 0.1s' }} />
                                </div>
                            )}
                            {/* Lửa CSS thuần - đẹp hơn emoji khi HP < 50% */}
                            {playerState.hp > 0 && playerState.hp < 250 && (
                                <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '36px', zIndex: 6, pointerEvents: 'none' }}>
                                    {/* Tầng lửa dưới - đỏ cam */}
                                    <div style={{ position: 'absolute', bottom: 0, left: '5px', width: '12px', height: '20px', background: 'radial-gradient(ellipse at 50% 100%, #ff4500, #ff8c00 60%, transparent)', borderRadius: '50% 50% 20% 20%', animation: 'flame-a 0.25s ease-in-out infinite alternate', transformOrigin: 'bottom center' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: '14px', width: '15px', height: '28px', background: 'radial-gradient(ellipse at 50% 100%, #ff6000, #ffaa00 50%, transparent)', borderRadius: '50% 50% 20% 20%', animation: 'flame-b 0.2s ease-in-out infinite alternate', transformOrigin: 'bottom center' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: '24px', width: '11px', height: '18px', background: 'radial-gradient(ellipse at 50% 100%, #ff3000, #ff7700 60%, transparent)', borderRadius: '50% 50% 20% 20%', animation: 'flame-a 0.3s ease-in-out infinite alternate', transformOrigin: 'bottom center', animationDelay: '0.1s' }} />
                                    {/* Tầng lửa giữ - vàng */}
                                    <div style={{ position: 'absolute', bottom: '6px', left: '8px', width: '10px', height: '16px', background: 'radial-gradient(ellipse at 50% 100%, #ffea00, #ff8c00 70%, transparent)', borderRadius: '50% 50% 20% 20%', animation: 'flame-b 0.18s ease-in-out infinite alternate', transformOrigin: 'bottom center', opacity: 0.9 }} />
                                    <div style={{ position: 'absolute', bottom: '4px', left: '18px', width: '12px', height: '22px', background: 'radial-gradient(ellipse at 50% 100%, #fff176, #ffea00 60%, transparent)', borderRadius: '50% 50% 20% 20%', animation: 'flame-a 0.22s ease-in-out infinite alternate', transformOrigin: 'bottom center', opacity: 0.85 }} />
                                    {/* Tầng lửa trên - trắng vàng */}
                                    <div style={{ position: 'absolute', bottom: '12px', left: '13px', width: '8px', height: '12px', background: 'radial-gradient(ellipse at 50% 100%, #ffffff, #fff9c4 80%, transparent)', borderRadius: '50% 50% 30% 30%', animation: 'flame-b 0.15s ease-in-out infinite alternate', transformOrigin: 'bottom center', opacity: 0.6 }} />
                                </div>
                            )}
                        </div>

                        {/* --- RENDER QUÁI VẬT MÈO --- */}
                        {enemies.map((enemy) => (
                            <div key={enemy.id} style={{
                                position: 'absolute', left: enemy.x, top: enemy.y,
                                width: '24px', height: '24px',
                                transform: `translate(-50%, -50%) rotate(${enemy.y > WORLD_H - 100 ? 540 : 0}deg)`,
                                opacity: enemy.y > WORLD_H - 50 ? 0 : 1,
                                backgroundImage: `url(${kittyImg})`, backgroundSize: 'cover',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px #ff4d6d',
                                filter: `hue-rotate(${enemy.hue}deg)`,
                                zIndex: 4,
                                transition: 'left 0.5s ease-out, transform 1s ease-in, opacity 0.5s'
                            }}>
                                {/* HP Của Quái */}
                                <div style={{ position: 'absolute', top: '-22px', width: '60px', left: '-18px', textAlign: 'center', color: '#ff4d6d', fontWeight: 'bold', fontSize: '13px', textShadow: '0 0 5px black', filter: `hue-rotate(-${enemy.hue}deg)` }}>
                                    {enemy.hp} HP
                                </div>
                            </div>
                        ))}

                        {/* --- RENDER QUÀ RƠI --- */}
                        {drops.filter(d => !d.collected).map(d => (
                            <div key={'drop' + d.id} style={{
                                position: 'absolute', left: d.x, top: d.y,
                                width: '24px', height: '24px',
                                background: '#fff', border: '2px solid #ffea00',
                                borderRadius: '4px', transform: 'translate(-50%, -50%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '10px', color: '#000',
                                boxShadow: '0 0 10px #ffea00, inset 0 0 5px #ffcc00',
                                zIndex: 4,
                                animation: (d.y < WORLD_H - 100 || d.isFloating) ? 'parachute-sway 2s infinite alternate ease-in-out' : 'none'
                            }}>
                                {d.type.toUpperCase()}
                                {/* Dù nhỏ trên nắp */}
                                {(d.y < WORLD_H - 100 || d.isFloating) && <div style={{ position: 'absolute', top: '-15px', width: '30px', height: '15px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '15px 15px 0 0', zIndex: -1, border: '1px solid #aaa' }} />}
                            </div>
                        ))}

                        {/* --- RENDER ĐẠN --- */}
                        {projectiles.filter(p => !p.delay || p.delay <= 0).map(proj => {
                            const isSaw = proj.type === 'saw'
                            const isNuke = proj.type === 'nuke'
                            const isRainDrop = proj.type === 'rain_drop'
                            const isKamikaze = proj.type === 'enemy_kamikaze'

                            const typeColors = {
                                'heavy': '#ffaa00',
                                'helicopter': '#00ffaa',
                                'poison': '#00ffaa',
                                'rain': '#00ccff',
                                'rain_drop': '#00f3ff',
                                'teleport': '#cc00ff',
                                'enemy_kamikaze': '#ff003c',
                                'normal': '#00f3ff'
                            }
                            const pColor = typeColors[proj.type] || '#00f3ff'

                            return (
                                <div key={proj.id} style={{
                                    position: 'absolute', left: proj.x, top: proj.y, zIndex: 10,
                                    ...(isKamikaze ? {
                                        width: '40px', height: '40px',
                                        backgroundImage: `url(${kittyImg})`, backgroundSize: 'cover',
                                        borderRadius: '50%', boxShadow: '0 0 20px #ff003c',
                                        transform: 'translate(-50%, -50%) rotate(720deg)',
                                        transition: 'transform 1s',
                                        filter: `hue-rotate(${proj.shooterHue || 0}deg)`
                                    } : isSaw || isNuke ? {} : {
                                        width: (proj.type === 'heavy' || isRainDrop) ? '16px' : '10px',
                                        height: (proj.type === 'heavy' || isRainDrop) ? '16px' : '10px',
                                        background: pColor,
                                        borderRadius: isRainDrop ? '0 50% 50% 50%' : '50%',
                                        transform: isRainDrop ? 'translate(-50%, -50%) rotate(45deg)' : 'translate(-50%, -50%)',
                                        boxShadow: `0 0 10px ${pColor}`
                                    })
                                }}>
                                    {isSaw && <div style={{ width: '40px', height: '40px', background: 'radial-gradient(circle, #fff, #9c27b0)', border: '4px dashed #fff', borderRadius: '50%', animation: 'spin-saw 0.2s linear infinite', transform: 'translate(-50%, -50%)' }} />}
                                    {isNuke && <div style={{ width: '20px', height: '60px', background: '#333', border: '3px solid #ff003c', borderRadius: '50% 50% 10px 10px', transform: 'translate(-50%, -50%)' }} />}
                                </div>
                            )
                        })}

                        {/* --- TRỰC THĂNG NÉM BOM --- */}
                        {projectiles.filter(p => p.type === 'nuke').map(n => (
                            <div key={'heli' + n.id} style={{ position: 'absolute', left: n.x, top: n.y - 120, fontSize: '60px', transform: 'translateX(-50%)', animation: 'heli-fly 1.5s ease-out', zIndex: 9 }}>
                                🚁
                            </div>
                        ))}

                        {/* --- RENDER VẾT NỔ BÙM --- */}
                        {explosions.map(ex => (
                            <div key={ex.id} style={{
                                position: 'absolute', left: ex.x, top: ex.y,
                                width: `${ex.radius * 2}px`, height: `${ex.radius * 2}px`,
                                background: `radial-gradient(circle, #fff 10%, ${ex.color || '#ffaa00'} 40%, ${ex.color || '#ff003c'} 70%, transparent 100%)`,
                                transform: 'translate(-50%, -50%) scale(1.5)',
                                opacity: 0,
                                animation: 'army-explode 0.5s ease-out forwards',
                                pointerEvents: 'none', zIndex: 100
                            }} />
                        ))}

                        {/* --- RENDER FLOATING TEXTS --- */}
                        {floatingTexts.map(ft => (
                            <div key={ft.id} style={{
                                position: 'absolute', left: ft.x, top: ft.y,
                                color: ft.color, fontWeight: 'bold', fontSize: '24px',
                                textShadow: '0 0 8px #000, 2px 2px 0px #000, -2px -2px 0px #000',
                                animation: 'float-up 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                                zIndex: 200, pointerEvents: 'none', transform: 'translateX(-50%)'
                            }}>
                                {ft.text}
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                @keyframes parachute-sway {
                    0% { transform: translate(-50%, -50%) rotate(-10deg) translateX(-5px); }
                    100% { transform: translate(-50%, -50%) rotate(10deg) translateX(5px); }
                }
                @keyframes walk-leg-1 {
                    0% { transform: rotate(-30deg); }
                    100% { transform: rotate(30deg); }
                }
                @keyframes walk-leg-2 {
                    0% { transform: rotate(30deg); }
                    100% { transform: rotate(-30deg); }
                }
                @keyframes screen-shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-10px, -10px) rotate(-1deg); }
                    20%, 40%, 60%, 80% { transform: translate(10px, 10px) rotate(1deg); }
                }
                .screen-shake {
                    animation: screen-shake 0.3s cubic-bezier(.36,.07,.19,.97) both infinite;
                }
                @keyframes float-up {
                    0% { transform: translateX(-50%) translate(0, 0) scale(0.5); opacity: 1; filter: brightness(2); }
                    20% { transform: translateX(-50%) translate(0, -30px) scale(1.2); opacity: 1; filter: brightness(1); }
                    100% { transform: translateX(-50%) translate(0, -60px) scale(1); opacity: 0; }
                }
                @keyframes army-explode {
                    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; filter: brightness(2); }
                    50% { opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; filter: brightness(1); }
                }
                @keyframes heli-fly {
                    0% { transform: translate(-800px, -50px) rotate(-10deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(-50%) rotate(0deg); opacity: 1; }
                }
                @keyframes spin-saw {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes fall-snow {
                    0% { background-position: 0px 0px, 0px 0px, 0px 0px; }
                    100% { background-position: 500px 1000px, 400px 400px, 300px 300px; }
                }
                @keyframes fall-rain {
                    0% { background-position: 0px 0px; }
                    100% { background-position: -200px 1000px; }
                }
                @keyframes sun-pulsate {
                    0% { opacity: 0.3; transform: scale(1); }
                    100% { opacity: 0.6; transform: scale(1.1); }
                }

                .weather-snow {
                    background-image: 
                    radial-gradient(circle, white 2px, transparent 3px),
                    radial-gradient(circle, white 1px, transparent 2px),
                    radial-gradient(circle, rgba(255,255,255,0.5) 3px, transparent 4px);
                    background-size: 100px 100px, 50px 50px, 200px 200px;
                    animation: fall-snow 10s linear infinite;
                }
                .weather-rain {
                    background-image: linear-gradient(-15deg, transparent 40%, rgba(200, 230, 255, 0.8) 45%, transparent 50%);
                    background-size: 40px 120px;
                    animation: fall-rain 0.6s linear infinite;
                }
                .weather-sun {
                    background-image: radial-gradient(circle at 50% 10%, rgba(255, 200, 50, 0.5) 0%, transparent 60%);
                    animation: sun-pulsate 4s ease-in-out infinite alternate;
                }
                @keyframes popup-in {
                    0% { transform: scale(0.5) translateY(40px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes bounce-icon {
                    0% { transform: translateY(0px) scale(1); }
                    100% { transform: translateY(-12px) scale(1.1); }
                }
                @keyframes fire-flicker {
                    0% { transform: translateY(0) scale(1); opacity: 0.9; }
                    100% { transform: translateY(-6px) scale(1.2); opacity: 1; }
                }
                @keyframes flame-a {
                    0% { transform: scaleX(1) scaleY(1) skewX(-3deg); opacity: 0.95; }
                    100% { transform: scaleX(0.85) scaleY(1.25) skewX(5deg); opacity: 1; }
                }
                @keyframes flame-b {
                    0% { transform: scaleX(0.9) scaleY(1.1) skewX(4deg); opacity: 0.85; }
                    100% { transform: scaleX(1.1) scaleY(0.85) skewX(-4deg); opacity: 1; }
                }
                @keyframes ultra-pulse {
                    0% { transform: translateX(-50%) scale(1); box-shadow: 0 0 20px #ff4500, 0 0 40px rgba(255,69,0,0.4); }
                    100% { transform: translateX(-50%) scale(1.06); box-shadow: 0 0 35px #ff8c00, 0 0 70px rgba(255,140,0,0.6); }
                }
            `}</style>

                {/* THÔNG BÁO CHIẾN THẮNG MAP */}
                {gameState === 'won' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'linear-gradient(160deg, #051a0a, #0a2e14)', border: '2px solid #00ffaa', borderRadius: '28px', padding: '50px 70px', textAlign: 'center', boxShadow: '0 0 80px rgba(0,255,170,0.5)', maxWidth: '600px', width: '90%', animation: 'popup-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '10px', animation: 'bounce-icon 1s ease infinite alternate' }}>🏆</div>
                            <h2 style={{ color: '#00ffaa', fontSize: '2.2rem', margin: '0 0 10px', textShadow: '0 0 20px #00ffaa' }}>Cún Chiến Thắng Rồii~! 🎉</h2>
                            <p style={{ color: '#aaffcc', fontSize: '1.1rem', marginBottom: '8px' }}>Bọn Mèo quậy đã bị dạy dỗ xong xuôi rồi chủ nhân ơi! 💕</p>
                            <p style={{ color: '#ffea00', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '30px' }}>Map {level} — Cleared! ✨</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={() => setGameState('menu')} style={{ padding: '14px 30px', background: 'transparent', border: '2px solid #ffea00', borderRadius: '30px', color: '#ffea00', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>🏠 Về Nhà Cún</button>
                                <button onClick={() => initMap(level + 1)} style={{ padding: '14px 30px', background: 'linear-gradient(135deg,#00ffaa,#00cc88)', border: 'none', borderRadius: '30px', color: 'black', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,255,170,0.5)' }}>Chiến Tiếp Nào Cún! 🐾➡</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* THÔNG BÁO THUA CUỘC */}
                {gameState === 'gameover' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'linear-gradient(160deg, #1a0505, #2e0a0a)', border: '2px solid #ff4d6d', borderRadius: '28px', padding: '50px 70px', textAlign: 'center', boxShadow: '0 0 80px rgba(255,77,109,0.5)', maxWidth: '600px', width: '90%', animation: 'popup-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '10px', animation: 'bounce-icon 1s ease infinite alternate' }}>😭</div>
                            <h2 style={{ color: '#ff4d6d', fontSize: '2.2rem', margin: '0 0 10px', textShadow: '0 0 20px #ff4d6d' }}>Cún Ơi Đứng Dậy Nào~!</h2>
                            <p style={{ color: '#ffaaaa', fontSize: '1.1rem', marginBottom: '8px' }}>Bọn Mèo lần này tinh ranh quá... nhưng Cún chắc chắn làm được! 💪</p>
                            <p style={{ color: '#ffea00', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '30px' }}>Map {level} — Thất Bại 💔</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={() => setGameState('menu')} style={{ padding: '14px 30px', background: 'transparent', border: '2px solid #00f3ff', borderRadius: '30px', color: '#00f3ff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>🏠 Về Nhà Nghỉ Ngơi</button>
                                <button onClick={() => initMap(level)} style={{ padding: '14px 30px', background: 'linear-gradient(135deg,#ff4d6d,#ff007f)', border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,0,127,0.5)' }}>🔄 Cún Thử Lại Nào!</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
