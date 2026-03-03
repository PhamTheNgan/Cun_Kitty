import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles, Float, Box } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

function SceneWrapper({ gameState, setGameState, onScoreUpdate, tickRate }) {
    // Luôn bắt đầu từ 0
    const segmentsRef = useRef([
        [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3]
    ])
    // Hướng di chuyển - Dùng hàng chờ để ghi nhớ phím (chống sượng khi bấm nhanh)
    const dirRef = useRef([0, 0, -1])
    const inputQueueRef = useRef([])

    // Cấu hình sinh tồn ảo diệu: Mồi và Bom khởi tạo hoàn toàn độc lập và ngẫu nhiên
    const foodRef = useRef(null)
    if (!foodRef.current) {
        let rx = Math.round((Math.random() - 0.5) * 30)
        let rz = Math.round((Math.random() - 0.5) * 30)
        // Nếu lỡ sinh gần đầu rắn ban đầu quá thì ép nó văng xa ra xíu
        if (Math.abs(rx) < 5 && Math.abs(rz) < 5) {
            rx = 10; rz = 10
        }
        foodRef.current = { pos: [rx, 0, rz], type: Math.random() < 0.2 ? 'big' : 'small' }
    }

    const bombsRef = useRef(null)
    if (!bombsRef.current) {
        bombsRef.current = Array.from({ length: 15 }, () => {
            const rx = Math.round((Math.random() - 0.5) * 50)
            const rz = Math.round((Math.random() - 0.5) * 50)
            // Tránh spawn đè vào vùng an toàn lúc đầu 
            if (Math.abs(rx) < 5 && Math.abs(rz) < 5) return [15, 0, 15]
            return [rx, 0, rz]
        })
    }

    const [segments, setSegments] = useState([...segmentsRef.current])
    const [food, setFood] = useState({ ...foodRef.current })
    const [bombs, setBombs] = useState([...bombsRef.current])

    const pendingGrowthRef = useRef(0)
    const scoreRef = useRef(0)

    const targetCamPos = useMemo(() => new THREE.Vector3(0, 25, 20), [])
    const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault() // Tránh cuộn trang ngẫu nhiên
                setGameState(prev => {
                    if (prev === 'playing') return 'paused'
                    if (prev === 'paused') return 'playing'
                    return prev
                })
                return
            }

            if (gameState !== 'playing') return

            // Xác định hướng tính toán dựa trên thao tác gần nhất trong hàng chờ
            const lastQueuedDir = inputQueueRef.current.length > 0
                ? inputQueueRef.current[inputQueueRef.current.length - 1]
                : dirRef.current

            const [dx, dy, dz] = lastQueuedDir
            let newDir = null

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    if (dz !== 1) newDir = [0, 0, -1]
                    break
                case 'arrowdown':
                case 's':
                    if (dz !== -1) newDir = [0, 0, 1]
                    break
                case 'arrowleft':
                case 'a':
                    if (dx !== 1) newDir = [-1, 0, 0]
                    break
                case 'arrowright':
                case 'd':
                    if (dx !== -1) newDir = [1, 0, 0]
                    break
            }

            // Nếu hướng xoay hợp lệ mới, đưa vào hàng chờ xử lý (tối đa 3 phím bấm trước)
            if (newDir && inputQueueRef.current.length < 3) {
                // Chống bấm đè 2 nút giống nhau liên tiếp
                if (newDir[0] !== dx || newDir[2] !== dz) {
                    inputQueueRef.current.push(newDir)
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState])

    const lastTick = useRef(0)
    const snakeMeshesRef = useRef([])

    useFrame((state, delta) => {
        if (gameState !== 'playing') return

        lastTick.current += delta
        if (lastTick.current > tickRate) {
            lastTick.current %= Math.max(0.01, tickRate)

            if (inputQueueRef.current.length > 0) {
                dirRef.current = inputQueueRef.current.shift()
            }

            const currDir = dirRef.current
            const currHead = segmentsRef.current[0]

            const newHead = [
                currHead[0] + currDir[0],
                0,
                currHead[2] + currDir[2]
            ]

            // Tự ăn chính mình (Rắn đâm đuôi)
            let died = false
            for (let i = 0; i < segmentsRef.current.length; i++) {
                if (segmentsRef.current[i][0] === newHead[0] && segmentsRef.current[i][2] === newHead[2]) {
                    died = true; break
                }
            }

            // Chạm Bẫy (Bombs)
            for (let i = 0; i < bombsRef.current.length; i++) {
                if (Math.abs(bombsRef.current[i][0] - newHead[0]) < 1 && Math.abs(bombsRef.current[i][2] - newHead[2]) < 1) {
                    died = true; break
                }
            }

            if (died) {
                setGameState('gameover')
                onScoreUpdate(segmentsRef.current.length - 4, true)
                return
            }

            segmentsRef.current.unshift(newHead)

            // Kiểm tra ăn mồi (Food)
            const fPosCurr = foodRef.current.pos
            if (Math.abs(newHead[0] - fPosCurr[0]) < 1 && Math.abs(newHead[2] - fPosCurr[2]) < 1) {
                const isBig = foodRef.current.type === 'big'
                const gainedPoints = isBig ? 3 : 1

                scoreRef.current += gainedPoints
                pendingGrowthRef.current += gainedPoints
                onScoreUpdate(scoreRef.current)

                let fPos = null
                while (!fPos) {
                    let rx = newHead[0] + Math.floor((Math.random() - 0.5) * 30)
                    let rz = newHead[2] + Math.floor((Math.random() - 0.5) * 30)
                    rx = Math.round(rx)
                    rz = Math.round(rz)

                    let conflict = segmentsRef.current.some(s => s[0] === rx && s[2] === rz) ||
                        bombsRef.current.some(b => b[0] === rx && b[2] === rz)
                    if (!conflict) fPos = [rx, 0, rz]
                }

                foodRef.current = { pos: fPos, type: Math.random() < 0.2 ? 'big' : 'small' }
                setFood({ ...foodRef.current })

                // Cứ đạt mốc 5 điểm thì thêm 1 bãi bom cho độ khó hợp lý (không spawn dồn dập lộn xộn nữa)
                if (scoreRef.current > 0 && Math.floor(scoreRef.current / 5) > Math.floor((scoreRef.current - gainedPoints) / 5)) {
                    let bPos = null
                    while (!bPos) {
                        let rx = newHead[0] + Math.floor((Math.random() - 0.5) * 40)
                        let rz = newHead[2] + Math.floor((Math.random() - 0.5) * 40)
                        rx = Math.round(rx)
                        rz = Math.round(rz)

                        let conflict = segmentsRef.current.some(s => s[0] === rx && s[2] === rz) ||
                            bombsRef.current.some(b => b[0] === rx && b[2] === rz) ||
                            (rx === fPos[0] && rz === fPos[2]) ||
                            (Math.abs(rx - newHead[0]) < 5 && Math.abs(rz - newHead[2]) < 5)

                        if (!conflict) bPos = [rx, 0, rz]
                    }
                    bombsRef.current.push(bPos)
                    setBombs([...bombsRef.current])
                }

            }

            // Xử lý logic Mọc dài hoặc giữ nguyên đuôi thông minh
            if (pendingGrowthRef.current > 0) {
                pendingGrowthRef.current--
                // Báo cho React cập nhật render dài ra
                setSegments([...segmentsRef.current])
            } else {
                segmentsRef.current.pop()
                // Không gọi setSegments ở đây để tối ưu render tối đa
            }

            // --- HỆ THỐNG MÔI TRƯỜNG VÔ TẬN: Dịch chuyển Bẫy và Mồi đi theo Rắn ---
            let envUpdated = false

            // 1. Quét Bẫy: Mang bẫy ở quá xa (bị bỏ lại phía sau) lên đằng trước
            for (let i = 0; i < bombsRef.current.length; i++) {
                const b = bombsRef.current[i]
                if (Math.abs(b[0] - newHead[0]) > 40 || Math.abs(b[2] - newHead[2]) > 40) {
                    let bPos = null
                    while (!bPos) {
                        let rx = newHead[0] + Math.floor((Math.random() - 0.5) * 60)
                        let rz = newHead[2] + Math.floor((Math.random() - 0.5) * 60)
                        rx = Math.round(rx)
                        rz = Math.round(rz)

                        // Ép điểm mới phải nằm ở rìa ngoài (cách ít nhất 15 ô) để không đột ngột xuất hiện đè lên mặt rắn
                        if (Math.abs(rx - newHead[0]) < 15 && Math.abs(rz - newHead[2]) < 15) continue

                        let conflict = segmentsRef.current.some(s => s[0] === rx && s[2] === rz) ||
                            (rx === foodRef.current.pos[0] && rz === foodRef.current.pos[2])
                        if (!conflict) bPos = [rx, 0, rz]
                    }
                    bombsRef.current[i] = bPos
                    envUpdated = true
                }
            }

            // 2. Quét Mồi: Nếu đi xa mồi quá thì mồi cũng dịch chuyển "đón đầu"
            if (Math.abs(foodRef.current.pos[0] - newHead[0]) > 50 || Math.abs(foodRef.current.pos[2] - newHead[2]) > 50) {
                let fPos = null
                while (!fPos) {
                    let rx = newHead[0] + Math.floor((Math.random() - 0.5) * 40)
                    let rz = newHead[2] + Math.floor((Math.random() - 0.5) * 40)
                    rx = Math.round(rx)
                    rz = Math.round(rz)

                    if (Math.abs(rx - newHead[0]) < 10 && Math.abs(rz - newHead[2]) < 10) continue

                    let conflict = segmentsRef.current.some(s => s[0] === rx && s[2] === rz) ||
                        bombsRef.current.some(b => b[0] === rx && b[2] === rz)
                    if (!conflict) fPos = [rx, 0, rz]
                }
                foodRef.current = { ...foodRef.current, pos: fPos }
                setFood({ ...foodRef.current })
            }

            if (envUpdated) {
                setBombs([...bombsRef.current])
            }
        } // ĐÓNG khối lastTick.current > tickRate

        const p = lastTick.current / tickRate
        const time = state.clock.elapsedTime

        const headGrid = segmentsRef.current[0]
        const dir = dirRef.current

        // Tính Tọa độ Ảo (Vị trí con rắn đang nằm kẹp giữa 2 tick hệ thống cực chuẩn xác Toán học)
        const vX = headGrid[0] + dir[0] * p
        const vZ = headGrid[2] + dir[2] * p

        // Camera lơ lửng góc vát từ trên xuống mượt mà bám theo
        targetCamPos.lerp(new THREE.Vector3(vX, 25, vZ + 15), delta * 4)
        lookAtTarget.lerp(new THREE.Vector3(vX, 0, vZ), delta * 6)
        state.camera.position.copy(targetCamPos)
        state.camera.lookAt(lookAtTarget)

        if (gridRef.current) {
            gridRef.current.position.x = Math.floor(vX / 10) * 10
            gridRef.current.position.z = Math.floor(vZ / 10) * 10
        }

        // Cập nhật Cực Mượt tọa độ của tát cả các khúc thân rắn mà không cần dùng đến Render State
        for (let i = 0; i < snakeMeshesRef.current.length; i++) {
            const mesh = snakeMeshesRef.current[i]
            if (!mesh) continue

            const segGrid = segmentsRef.current[i]
            if (!segGrid) continue

            let px, pz
            if (i === 0) {
                px = vX
                pz = vZ
            } else {
                const prevSegGrid = segmentsRef.current[i - 1]
                px = THREE.MathUtils.lerp(segGrid[0], prevSegGrid[0], p)
                pz = THREE.MathUtils.lerp(segGrid[2], prevSegGrid[2], p)
            }

            const yOffset = Math.sin(time * 8 - i * 0.5) * 0.3
            mesh.position.set(px, 0.5 + yOffset, pz)

            mesh.rotation.y += delta * 2
            mesh.rotation.z += delta * (i % 2 === 0 ? 1 : -1)

            const scale = i === 0 ? 1.1 : Math.max(0.4, 1 - i * 0.02)
            const stretch = 1 + Math.sin(time * 10 - i) * 0.1
            mesh.scale.set(scale * stretch, scale / stretch, scale * stretch)
        }
    })

    const gridRef = useRef()

    return (
        <group>
            {/* Thân rắn Cutie với hiệu ứng uốn éo có hồn */}
            {segments.map((_, i) => (
                <AnimatedSnakeSegment
                    key={`snake-seg-${i}`}
                    isHead={i === 0}
                    index={i}
                    innerRef={(el) => snakeMeshesRef.current[i] = el}
                />
            ))}
            {/* Đồ ăn (Quả táo nhảy nhót) */}
            <AnimatedApple position={food.pos} type={food.type} />

            {/* Bẫy (Bombs đang thở) */}
            {bombs.map((bomb, index) => (
                <AnimatedBomb key={index} position={[bomb[0], 0, bomb[2]]} />
            ))}

            {/* Lưới sàn (Grid) siêu ảo với Neon */}
            <group ref={gridRef} position={[0, -0.5, 0]}>
                <gridHelper args={[200, 200, "#00f3ff", "#ff007f"]} position={[0, 0, 0]} />
            </group>

            {/* Mặt đất tối đơn giản để tối ưu hiệu năng (không dùng Reflector nữa) */}
            <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshBasicMaterial color="#020205" />
            </mesh>
        </group>
    )
}

// Sub-component Rắn thực tế
function AnimatedSnakeSegment({ isHead, index, innerRef }) {
    const isEven = index % 2 === 0
    // Màu rắn lục bóng loáng
    const backColor = isEven ? "#2e7d32" : "#1b5e20"
    const bellyColor = "#fbc02d"

    return (
        <group ref={innerRef}>
            {/* Lưng rắn (nửa trên) */}
            <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[isHead ? 0.65 : 0.55, 32, 24]} />
                <meshPhysicalMaterial
                    color={backColor}
                    roughness={0.4}
                    clearcoat={0.8}
                    clearcoatRoughness={0.2}
                />
            </mesh>
            {/* Bụng rắn (nửa dưới) */}
            <mesh position={[0, -0.2, 0]} scale={[1, 0.5, 1]}>
                <sphereGeometry args={[isHead ? 0.6 : 0.5, 32, 16]} />
                <meshStandardMaterial color={bellyColor} roughness={0.8} />
            </mesh>

            {isHead && (
                <group>
                    {/* Mắt trái */}
                    <mesh position={[-0.25, 0.35, 0.4]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial color="#eeeeee" />
                        <mesh position={[0, 0, 0.1]} scale={[0.3, 1, 0.2]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </mesh>
                    {/* Mắt phải */}
                    <mesh position={[0.25, 0.35, 0.4]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial color="#eeeeee" />
                        <mesh position={[0, 0, 0.1]} scale={[0.3, 1, 0.2]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </mesh>
                    {/* Lưỡi chẻ */}
                    <SnakeTongue />
                    {/* Đèn pin rọi đường */}
                    <pointLight position={[0, 0.5, 1]} color="#ffffff" intensity={1} distance={15} />
                </group>
            )}
        </group>
    )
}

function SnakeTongue() {
    const tongueRef = useRef()
    useFrame((state) => {
        if (!tongueRef.current) return
        const time = state.clock.elapsedTime
        tongueRef.current.position.z = 0.6 + Math.sin(time * 15) * 0.2
    })
    return (
        <group ref={tongueRef} position={[0, 0, 0.6]}>
            <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.3]} />
                <meshBasicMaterial color="#d32f2f" />
            </mesh>
            <mesh position={[-0.05, 0, 0.3]} rotation={[Math.PI / 2, 0, -0.4]}>
                <cylinderGeometry args={[0.015, 0.01, 0.15]} />
                <meshBasicMaterial color="#d32f2f" />
            </mesh>
            <mesh position={[0.05, 0, 0.3]} rotation={[Math.PI / 2, 0, 0.4]}>
                <cylinderGeometry args={[0.015, 0.01, 0.15]} />
                <meshBasicMaterial color="#d32f2f" />
            </mesh>
        </group>
    )
}

function AnimatedApple({ position, type }) {
    const ref = useRef()
    const isBig = type === 'big'

    useFrame((state, delta) => {
        if (!ref.current) return
        const time = state.clock.elapsedTime
        ref.current.position.y = 0.3 + Math.sin(time * 3) * 0.1
    })

    return (
        <group position={position}>
            <group ref={ref} scale={isBig ? 1.5 : 1}>
                {/* Cốt Quả táo tròn trĩnh thật */}
                <mesh position={[0, 0.4, 0]} scale={[1, 0.9, 1]}>
                    <sphereGeometry args={[0.45, 32, 32]} />
                    <meshPhysicalMaterial
                        color={isBig ? "#ff00d4" : "#d50000"}
                        roughness={0.15}
                        clearcoat={1.0}
                        clearcoatRoughness={0.1}
                    />
                </mesh>
                {/* Cuống táo */}
                <mesh position={[0, 0.9, 0]} rotation={[0, 0, -0.2]}>
                    <cylinderGeometry args={[0.02, 0.03, 0.3]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.9} />
                </mesh>
                {/* Chiếc lá xanh mướt */}
                <mesh position={[0.15, 0.9, 0]} rotation={[0.2, 0, -0.8]} scale={[1, 0.2, 0.5]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#2e7d32" />
                </mesh>
            </group>
            {isBig && <Sparkles count={20} scale={1.5} size={5} speed={3} color="#ff00d4" />}
            <pointLight position={[0, 1, 0]} color={isBig ? "#ff00d4" : "#ff4444"} intensity={isBig ? 4 : 2} distance={isBig ? 12 : 8} />
        </group>
    )
}

function AnimatedBomb({ position }) {
    const wickRef = useRef()

    useFrame((state) => {
        if (!wickRef.current) return
        const time = state.clock.elapsedTime
        wickRef.current.intensity = 2 + Math.sin(time * 20) * 1
    })

    return (
        <group position={position}>
            {/* Quả tạ bom bằng thép đen nhám */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshPhysicalMaterial
                    color="#1a1a1a"
                    roughness={0.6}
                    metalness={0.8}
                    clearcoat={0.3}
                />
            </mesh>
            {/* Cổ bom bằng nhôm */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.15, 32]} />
                <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Sợi dây thừng ngòi nổ cong */}
            <mesh position={[0.05, 1.3, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
                <meshStandardMaterial color="#8b4513" roughness={1} />
            </mesh>
            {/* Đốm lửa đang cháy trên ngòi */}
            <mesh position={[0.1, 1.45, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ffaa00" />
                <pointLight ref={wickRef} color="#ffaa00" distance={5} />
                <Sparkles count={15} scale={0.5} size={3} speed={4} color="#ff5500" />
            </mesh>
        </group>
    )
}

export default function Game3D({ onBack, onFinish }) {
    const [gameState, setGameState] = useState('playing')
    const [finalScore, setFinalScore] = useState(0)
    // Cài đặt game
    const [tickRate, setTickRate] = useState(0.12) // Mặc định tốc độ vừa
    const [showRules, setShowRules] = useState(false)
    // Key để Reset trọn đời linh kiện SceneWrapper nội tại
    const [gameKey, setGameKey] = useState(0)
    const scoreUiRef = useRef(null)

    const handleScoreUpdate = (scoreVal, isFinal = false) => {
        if (scoreUiRef.current) {
            scoreUiRef.current.innerText = `ĐIỂM: ${scoreVal}`
        }
        if (isFinal) setFinalScore(scoreVal)
    }

    const resetGame = () => {
        setGameState('playing')
        setFinalScore(0)
        setGameKey(k => k + 1)
        if (scoreUiRef.current) scoreUiRef.current.innerText = `ĐIỂM: 0`
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#020205', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 50, display: 'flex', gap: '10px' }}>
                <button onClick={onBack} style={{ padding: '8px 24px', background: 'transparent', color: '#00f3ff', border: '2px solid #00f3ff', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', textShadow: '0 0 8px #00f3ff', boxShadow: '0 0 10px #00f3ff inset' }}>
                    ← Thoát
                </button>
                <button onClick={() => setShowRules(true)} style={{ padding: '8px 24px', background: 'transparent', color: '#ffea00', border: '2px solid #ffea00', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', textShadow: '0 0 8px #ffea00', boxShadow: '0 0 10px #ffea00 inset' }}>
                    📖 Luật Chơi
                </button>
            </div>

            {/* Bảng điều chỉnh Tốc độ (Top Center) */}
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '20px', border: '1px solid #ff007f' }}>
                <span style={{ color: '#ff007f', fontWeight: 'bold', marginBottom: '5px', textShadow: '0 0 5px #ff007f' }}>TỐC ĐỘ RẮN</span>
                <input
                    type="range"
                    min="0.05"
                    max="0.25"
                    step="0.01"
                    value={0.3 - tickRate}
                    onChange={(e) => {
                        setTickRate(0.3 - parseFloat(e.target.value));
                        setGameState('paused');
                    }}
                    onMouseDown={() => setGameState('paused')}
                    onTouchStart={() => setGameState('paused')}
                    onMouseUp={(e) => e.target.blur()}
                    onTouchEnd={(e) => e.target.blur()}
                    style={{ cursor: 'pointer', width: '200px' }}
                />
            </div>

            {/* Bảng phổ biến Luật Chơi Modal */}
            {showRules && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,0,10,0.9)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '2px solid #ffea00', maxWidth: '600px', width: '90%', color: '#fff', boxShadow: '0 0 30px #ffea00' }}>
                        <h2 style={{ color: '#ffea00', textAlign: 'center', fontSize: '32px', marginBottom: '20px', textShadow: '0 0 10px #ffea00' }}>📖 LUẬT CHƠI RẮN 3D VÔ TẬN</h2>
                        <ul style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px', color: '#ddd' }}>
                            <li><strong style={{ color: '#00f3ff' }}>Luồn Lách:</strong> Dùng mũi tên hoặc W,A,S,D để điều khiển Rắn Bóng Loáng di chuyển trơn tru trên sa mạc Đêm.</li>
                            <li><strong style={{ color: '#ff4444' }}>Trái Táo đỏ:</strong> Cố gắng ăn Táo để mọc dài ra. Mỗi trái táo cộng 1 Điểm!</li>
                            <li><strong style={{ color: '#ffaa00' }}>Bãi mìn bom:</strong> Cứ ăn sương sương 3 quả táo, 1 quả Bom thép nóng rực sẽ rơi xuống bản đồ khóa đường bạn.</li>
                            <li><strong style={{ color: '#00ffaa' }}>Vô Tận:</strong> Không có giới hạn điểm thắng! Thử thách kỷ lục xem bạn ăn được bao nhiêu quả mà không đâm đầu Rắn vô mìn hoặc đuôi của mình.</li>
                            <li><strong style={{ color: '#ff007f' }}>Tuyệt Chiêu:</strong> Dùng thanh kéo trên cùng để tùy chỉnh độ phản xạ: Từ rùa bò cho đến siêu tốc Cyberpunk! (Space) để ngưng đọng thời gian nghỉ mệt.</li>
                        </ul>
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setShowRules(false)} style={{ padding: '12px 30px', background: '#ffea00', color: 'black', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 0 15px #ffea00' }}>ĐÃ HIỂU! VÀO CHIẾN</button>
                        </div>
                    </div>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'paused' || gameState === 'gameover' || gameState === 'won') && (
                <div style={{ position: 'absolute', top: 20, right: 30, zIndex: 10, color: '#ffea00', textShadow: '0 0 10px #ffea00', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    <span ref={scoreUiRef}>ĐIỂM: 0</span>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'paused') && (
                <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: '#fff', opacity: 0.6, fontSize: '18px', letterSpacing: '2px', textShadow: '0 0 5px black', textAlign: 'center' }}>
                    W A S D HOẶC MŨI TÊN ĐỂ ĐIỀU KHIỂN<br />
                    (ẤN PHÍM SPACE ĐỂ TẠM DỪNG MỌI LÚC)
                </div>
            )}

            {gameState === 'paused' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,0,10,0.5)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: '#00f3ff', fontSize: '64px', textShadow: '0 0 20px #00f3ff', margin: '0 0 20px 0', letterSpacing: '5px' }}>TẠM DỪNG</h1>
                    <p style={{ color: '#fff', fontSize: '20px', marginBottom: '40px' }}>Ấn phím <kbd style={{ background: '#555', padding: '5px 10px', borderRadius: '5px', fontFamily: 'monospace' }}>Space</kbd> lần nữa để tiếp tục</p>
                </div>
            )}

            {gameState === 'gameover' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,0,10,0.85)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: '#ff003c', fontSize: '64px', textShadow: '0 0 20px #ff003c', margin: '0 0 20px 0' }}>BÙM 💥</h1>
                    <p style={{ color: '#fff', fontSize: '24px', marginBottom: '40px' }}>Rắn đã tự cắn đuôi hoặc đâm trúng Bom. Điểm: <span style={{ color: '#ffea00' }}>{finalScore}</span></p>
                    <div>
                        <button onClick={resetGame} style={{ padding: '12px 30px', margin: '0 10px', background: '#ff007f', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 0 15px #ff007f' }}>🔄 Chơi lại</button>
                        <button onClick={() => onFinish(finalScore * 10)} style={{ padding: '12px 30px', margin: '0 10px', background: '#00f3ff', color: 'black', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 0 15px #00f3ff' }}>Nhận {finalScore * 10} điểm + Thoát 🏆</button>
                    </div>
                </div>
            )}

            {gameState === 'won' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,50,10,0.85)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: '#00ffaa', fontSize: '64px', textShadow: '0 0 30px #00ffaa', margin: '0 0 20px 0' }}>WINNER! 🏆</h1>
                    <p style={{ color: '#fff', fontSize: '24px', marginBottom: '40px' }}>Chúc mừng! Bạn đã chinh phục bãi bom với điểm tuyệt đối: <span style={{ color: '#ffea00' }}>{finalScore}</span></p>
                    <div>
                        <button onClick={resetGame} style={{ padding: '12px 30px', margin: '0 10px', background: '#ff007f', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 0 15px #ff007f' }}>🔄 Chơi lại</button>
                        <button onClick={() => onFinish(finalScore * 10)} style={{ padding: '12px 30px', margin: '0 10px', background: '#00ffaa', color: 'black', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 0 15px #00ffaa' }}>Nhận {finalScore * 10} điểm + Thoát 🏆</button>
                    </div>
                </div>
            )}

            <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
                <color attach="background" args={['#010103']} />
                {/* Sương mù mờ ẩn */}
                <fog attach="fog" args={['#010103', 10, 120]} />
                {/* Ánh sáng vật lý để vật liệu chân thực (Gloss/Metal) nổi bật */}
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 20, 5]} intensity={1.5} />

                <SceneWrapper key={gameKey} gameState={gameState} setGameState={setGameState} onScoreUpdate={handleScoreUpdate} tickRate={tickRate} />

                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.5}
                        luminanceSmoothing={0.9}
                        intensity={2.5}
                        mipmapBlur
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
