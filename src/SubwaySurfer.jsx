import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SubwaySurfer.css';

export default function SubwaySurfer({ onBack, onFinish }) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const kittyImg = `${baseUrl}kitty.png`;
    const kitty1Img = `${baseUrl}kitty_1.png`;

    const [lane, setLane] = useState(1); // 0 = Left, 1 = Center, 2 = Right
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle' | 'playing' | 'gameover'
    const [kittyState, setKittyState] = useState('running'); // 'running' | 'jumping' | 'sliding' | 'stumbled'
    const [obstacles, setObstacles] = useState([]);
    const [particles, setParticles] = useState([]);
    const [speed, setSpeed] = useState(0.25);
    const [screenShake, setScreenShake] = useState(false);
    const [trackOffset, setTrackOffset] = useState(0);

    const gameLoopRef = useRef(null);
    const obstacleSpawnRef = useRef(null);
    const nextObstacleId = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0 });

    const laneRef = useRef(1);
    const kittyStateRef = useRef('running');
    const scoreRef = useRef(0);
    const speedRef = useRef(0.25);

    useEffect(() => { laneRef.current = lane; }, [lane]);
    useEffect(() => { kittyStateRef.current = kittyState; }, [kittyState]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { speedRef.current = speed; }, [speed]);

    // Define unified control helpers with useCallback to prevent stale closures
    const handleMoveLeft = useCallback((e) => {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;
        setLane(prev => Math.max(0, prev - 1));
        window.focus();
    }, [status]);

    const handleMoveRight = useCallback((e) => {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;
        setLane(prev => Math.min(2, prev + 1));
        window.focus();
    }, [status]);

    const handleJump = useCallback((e) => {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;
        if (kittyStateRef.current === 'running') {
            setKittyState('jumping');
            setTimeout(() => setKittyState('running'), 650);
        }
        window.focus();
    }, [status]);

    const handleSlide = useCallback((e) => {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;
        if (kittyStateRef.current === 'running') {
            setKittyState('sliding');
            setTimeout(() => setKittyState('running'), 550);
        }
        window.focus();
    }, [status]);

    // Handle keypress controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;

            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                handleMoveLeft(e);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                handleMoveRight(e);
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
                handleJump(e);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                handleSlide(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, handleMoveLeft, handleMoveRight, handleJump, handleSlide]);

    // Game loop
    useEffect(() => {
        if (status === 'playing') {
            gameLoopRef.current = setInterval(() => {
                // Increase score
                setScore(prev => prev + 1);

                // Speed up gradually
                setSpeed(prev => Math.min(1.2, prev + 0.0001));

                // Move track sleepers
                setTrackOffset(prev => (prev + speedRef.current * 0.008) % 1.0);

                // Move obstacles and check collisions
                setObstacles(prevObstacles => {
                    const nextObstacles = [];

                    for (let obs of prevObstacles) {
                        const nextZ = obs.z + speedRef.current;
                        let currentObs = { ...obs, z: nextZ };

                        // If it's a coin, apply magnet/attraction effect when near the player
                        if (obs.type === 'coin') {
                            if (nextZ >= 45 && nextZ <= 76) {
                                // Calculate interpolation factor (0 at z=45, 1 at z=75)
                                const t = Math.min(1, Math.max(0, (nextZ - 45) / 30));
                                // Smoothly interpolate lane towards player's current lane
                                currentObs.visualLane = obs.lane + (laneRef.current - obs.lane) * t;
                            } else if (nextZ > 76) {
                                // Keep it in the player's lane once it passes/reaches the player
                                currentObs.visualLane = laneRef.current;
                            } else {
                                currentObs.visualLane = obs.lane;
                            }
                        }

                        // Collision check threshold (when obstacle is at the player's position)
                        // Player is at z around 71 to 84 (since top position is 1350px)
                        if (nextZ >= 71 && nextZ <= 84 && !obs.collected && !obs.passed) {
                            if (obs.type === 'coin') {
                                // Collect coin (automatically attracted into the player's lane)
                                currentObs.collected = true;
                                setCoins(c => c + 1);
                                setScore(s => s + 50);
                                spawnCoinParticles(laneRef.current, nextZ);
                                continue;
                            } else {
                                // Hit an obstacle (must match player's lane)
                                if (obs.lane === laneRef.current) {
                                    if (obs.type === 'barrier' && kittyStateRef.current === 'jumping') {
                                        // Jumped over successfully
                                        currentObs.passed = true;
                                        nextObstacles.push(currentObs);
                                        continue;
                                    } else if (obs.type === 'arch' && kittyStateRef.current === 'sliding') {
                                        // Slid under successfully
                                        currentObs.passed = true;
                                        nextObstacles.push(currentObs);
                                        continue;
                                    } else {
                                        // Collision!
                                        triggerGameOver();
                                        return prevObstacles;
                                    }
                                }
                            }
                        }

                        if (nextZ < 105) {
                            nextObstacles.push(currentObs);
                        }
                    }

                    return nextObstacles;
                });

                // Update particles
                setParticles(prev => 
                    prev
                        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, size: p.size * 0.95, opacity: p.opacity - 0.05 }))
                        .filter(p => p.opacity > 0)
                );

            }, 1000 / 60); // 60 FPS loop

            // Periodic obstacle and coin spawns
            obstacleSpawnRef.current = setInterval(() => {
                spawnObstacleOrCoins();
            }, 850);
        }

        return () => {
            clearInterval(gameLoopRef.current);
            clearInterval(obstacleSpawnRef.current);
        };
    }, [status]);

    const spawnObstacleOrCoins = () => {
        // Safe warm-up period: for the first 180 ticks (3 seconds), only spawn coins!
        const isWarmUp = scoreRef.current < 180;
        const rand = Math.random();
        const obsLane = Math.floor(Math.random() * 3);
        const newScenery = [];

        // Spawn left and right scenery
        if (Math.random() < 0.75) {
            newScenery.push({
                id: nextObstacleId.current++,
                lane: -0.65, // Left side
                type: 'scenery-left',
                z: 0
            });
        }
        if (Math.random() < 0.75) {
            newScenery.push({
                id: nextObstacleId.current++,
                lane: 2.65, // Right side
                type: 'scenery-right',
                z: 0
            });
        }

        if (isWarmUp || rand < 0.45) {
            // Spawn Coins
            const newCoins = Array.from({ length: 3 }).map((_, i) => ({
                id: nextObstacleId.current++,
                lane: obsLane,
                type: 'coin',
                z: -i * 6 // Stagger coins
            }));
            setObstacles(prev => [...prev, ...newCoins, ...newScenery]);
        } else {
            // Spawn Obstacle
            const types = ['barrier', 'arch', 'train'];
            const obsType = types[Math.floor(Math.random() * types.length)];
            
            // Limit trains slightly
            if (obsType === 'train' && Math.random() > 0.6) {
                if (newScenery.length > 0) {
                    setObstacles(prev => [...prev, ...newScenery]);
                }
                return;
            }

            setObstacles(prev => [...prev, {
                id: nextObstacleId.current++,
                lane: obsLane,
                type: obsType,
                z: 0
            }, ...newScenery]);
        }
    };

    const spawnCoinParticles = (coinLane, zVal) => {
        // Map lane to screen coordinates roughly
        const laneX = 15 + coinLane * 35; // % of width
        const pCount = 8;
        const newParticles = Array.from({ length: pCount }).map(() => ({
            id: Math.random() + Date.now(),
            x: laneX,
            y: 80, // Near player vertical height
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 3,
            color: '#ffd166',
            size: 6 + Math.random() * 6,
            opacity: 1
        }));
        setParticles(prev => [...prev, ...newParticles]);
    };

    const triggerGameOver = () => {
        setKittyState('stumbled');
        setScreenShake(true);
        setStatus('gameover');
        clearInterval(gameLoopRef.current);
        clearInterval(obstacleSpawnRef.current);
        setTimeout(() => setScreenShake(false), 500);
    };

    const startGame = () => {
        setLane(1);
        setScore(0);
        setCoins(0);
        setSpeed(0.25);
        setObstacles([]);
        setParticles([]);
        setKittyState('running');
        setStatus('playing');
        setTrackOffset(0);
        window.focus();
    };

    // Mobile Swipe Handler
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
        if (status !== 'playing' || kittyStateRef.current === 'stumbled') return;
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;

        const threshold = 30; // Min pixels for swipe

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > threshold) {
                handleMoveRight();
            } else if (diffX < -threshold) {
                handleMoveLeft();
            }
        } else {
            // Vertical swipe
            if (diffY < -threshold) {
                handleJump();
            } else if (diffY > threshold) {
                handleSlide();
            }
        }
    };

    // Get 3D transform style based on Y-depth along the 3D ground (z: 0 to 100)
    const getObstacle3DStyle = (obs) => {
        // Ground length is 1800px
        // Lane centers: Left = 100px, Center = 300px, Right = 500px
        const activeLane = obs.visualLane !== undefined ? obs.visualLane : obs.lane;
        const x = 100 + activeLane * 200;
        const y = (obs.z / 100) * 1800;

        return {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            transform: `translate3d(-50%, -100%, 0) rotateX(-76deg)`,
            transformOrigin: 'bottom center',
            zIndex: Math.floor(obs.z),
            display: (obs.collected || obs.z < 0) ? 'none' : 'block'
        };
    };

    const handleExit = () => {
        const earnedPoints = Math.floor(score / 10) + coins * 5;
        onFinish(earnedPoints);
    };

    return (
        <div 
            className="subway-game-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Drifting Clouds in Sky */}
            <div className="subway-sky-clouds">
                <div className="subway-cloud c1">☁️</div>
                <div className="subway-cloud c2">☁️</div>
                <div className="subway-cloud c3">☁️</div>
            </div>

            {/* Header info */}
            <div className="subway-header">
                <button className="subway-back-btn" onClick={onBack}>← Menu nhen 🏠</button>
                <div className="subway-scoreboard">
                    <div className="subway-score-row">
                        <div className="subway-multiplier-box">x30</div>
                        <span className="subway-score-val">{String(score).padStart(6, '0')}</span>
                    </div>
                    <div className="subway-coin-box">
                        <span className="subway-coin-val">🪙 {coins}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.75)', border: '2.5px solid #ffa502', padding: '5px 12px', borderRadius: '12px', marginTop: '6px', fontSize: '13px', fontWeight: '900', color: '#ffa502', textAlign: 'right', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', textShadow: '1px 1px 0 #000' }}>
                        LÀN: {lane === 0 ? "◀ TRÁI" : lane === 1 ? "● GIỮA" : "PHẢI ▶"}
                    </div>
                </div>
            </div>

            {/* 3D Viewport wrapper */}
            <div className="subway-viewport-3d">
                <div 
                    className={`subway-world-3d world-${kittyState}`}
                    style={{
                        transform: `translate3d(${(1 - lane) * 180}px, 0, 0) rotateY(${(lane - 1) * 1.2}deg)`
                    }}
                >
                    
                    {/* Vanishing Point Horizon decoration */}
                    <div className="subway-horizon">
                        <div className="subway-sun"></div>
                        <div className="subway-city-skyline">
                            <div className="skyline-building b1"></div>
                            <div className="skyline-building b2"></div>
                            <div className="skyline-building b3"></div>
                            <div className="skyline-building b4"></div>
                            <div className="skyline-building b5"></div>
                            <div className="skyline-building b1"></div>
                            <div className="skyline-building b2"></div>
                            <div className="skyline-building b3"></div>
                            <div className="skyline-building b4"></div>
                            <div className="skyline-building b5"></div>
                        </div>
                        <div className="subway-mountain left"></div>
                        <div className="subway-mountain right"></div>
                    </div>

                    {/* 3D Ground containing tracks, walls, obstacles, and player */}
                    <div className="subway-ground-3d">
                        
                        {/* 3 Rails Lanes */}
                        {/* Lane 0 rails */}
                        <div className="subway-rail-line" style={{ left: '70px' }}></div>
                        <div className="subway-rail-line" style={{ left: '130px' }}></div>
                        
                        {/* Lane 1 rails */}
                        <div className="subway-rail-line" style={{ left: '270px' }}></div>
                        <div className="subway-rail-line" style={{ left: '330px' }}></div>
                        
                        {/* Lane 2 rails */}
                        <div className="subway-rail-line" style={{ left: '470px' }}></div>
                        <div className="subway-rail-line" style={{ left: '530px' }}></div>

                        {/* Sleepers (wooden tà vẹt) */}
                        <div className="subway-sleepers-container" style={{ transform: `translateY(${trackOffset}px)` }}>
                            {Array.from({ length: 18 }).map((_, i) => {
                                const y = i * 120; // Spacing between sleepers
                                return [0, 1, 2].map(l => (
                                    <div 
                                        key={`${l}-${i}`} 
                                        className="subway-sleeper-plank" 
                                        style={{ left: `${100 + l * 200}px`, top: `${y}px` }}
                                    ></div>
                                ));
                            })}
                        </div>

                        {/* 3D Side Walls */}
                        <div className="subway-side-wall-3d left-wall">
                            <div className="wall-pipe-3d"></div>
                            <div className="graffiti-3d g1">KITTY</div>
                            <div className="graffiti-3d g2">MEOW</div>
                            <div className="graffiti-3d g3">★RUN★</div>
                        </div>
                        <div className="subway-side-wall-3d right-wall">
                            <div className="wall-pipe-3d"></div>
                            <div className="graffiti-3d g4">CÚN</div>
                            <div className="graffiti-3d g5">SURF</div>
                            <div className="graffiti-3d g6">♥MEO♥</div>
                        </div>

                        {/* 3D Obstacles and Coins Layer */}
                        {obstacles.map(obs => (
                            <div 
                                key={obs.id} 
                                className={`subway-entity-3d ${obs.type}-entity ${obs.z > 95 ? 'entity-fade-out' : ''}`}
                                style={getObstacle3DStyle(obs)}
                            >
                                {obs.type === 'coin' && <div className="coin-3d-model"></div>}
                                {obs.type === 'scenery-left' && (
                                    <div className="subway-scenery-item left-pole">
                                        <div className="scenery-pole-glow"></div>
                                        <div className="scenery-cherry-blossom">🌸</div>
                                        <div className="scenery-neon-banner">KITTY</div>
                                    </div>
                                )}
                                {obs.type === 'scenery-right' && (
                                    <div className="subway-scenery-item right-pole">
                                        <div className="scenery-pole-glow"></div>
                                        <div className="scenery-cherry-blossom">🌸</div>
                                        <div className="scenery-neon-banner">SURF</div>
                                    </div>
                                )}
                                {obs.type === 'barrier' && (
                                    <div className="subway-barrier-3d">
                                        <div className="barrier-stripes-3d"></div>
                                        <div className="barrier-leg-3d left"></div>
                                        <div className="barrier-leg-3d right"></div>
                                    </div>
                                )}
                                {obs.type === 'arch' && (
                                    <div className="subway-arch-3d">
                                        <div className="arch-pillar-3d left"></div>
                                        <div className="arch-pillar-3d right"></div>
                                        <div className="arch-beam-3d"></div>
                                    </div>
                                )}
                                {obs.type === 'train' && (
                                    <div className="subway-train-3d">
                                        <div className="train-face front">
                                            <div className="train-windshield"></div>
                                            <div className="train-lights-container">
                                                <div className="train-headlight"></div>
                                                <div className="train-headlight"></div>
                                            </div>
                                            <div className="train-grill"></div>
                                        </div>
                                        <div className="train-face back"></div>
                                        <div className="train-face left-face"></div>
                                        <div className="train-face right-face"></div>
                                        <div className="train-face top"></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Player Character (Kitty) inside 3D Scene */}
                        <div 
                            className="subway-player-container-3d"
                            style={{
                                left: '300px', // Fixed at the middle lane anchor
                                top: '1350px', // Depth z = 75
                                transform: `translate3d(${lane * 200 - 200}px, 0, 0)`
                            }}
                        >
                            <div className={`subway-player-3d player-${kittyState}`}>
                                <div className="subway-player-shadow-3d"></div>
                                <img 
                                    src={kittyImg} 
                                    alt="Player" 
                                    className="subway-player-avatar-3d" 
                                />
                                {kittyState === 'jumping' && <span className="action-effect jump-spark">✨</span>}
                                {kittyState === 'sliding' && <span className="action-effect slide-dust">💨</span>}
                                {kittyState === 'stumbled' && <span className="action-effect crash-star">💥</span>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Particles layer (floats on 2D screen overlay) */}
            {particles.map(p => (
                <div 
                    key={p.id} 
                    className="coin-spark-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        opacity: p.opacity
                    }}
                />
            ))}

            {/* Mobile guide indicators */}
            {status === 'playing' && (
                <div className="mobile-guide-text">
                    💡 Dùng phím A/D/Space hoặc bấm các nút ảo bên dưới để chơi nhen!
                </div>
            )}

            {/* Virtual Controls for Mobile/Mouse players */}
            {status === 'playing' && (
                <>
                    <div className="subway-ctrl-group-left">
                        <button 
                            className="subway-ctrl-btn ctrl-left" 
                            onTouchStart={handleMoveLeft}
                            onMouseDown={handleMoveLeft}
                            onClick={handleMoveLeft}
                        >
                            ◀
                        </button>
                        <button 
                            className="subway-ctrl-btn ctrl-right" 
                            onTouchStart={handleMoveRight}
                            onMouseDown={handleMoveRight}
                            onClick={handleMoveRight}
                        >
                            ▶
                        </button>
                    </div>
                    <div className="subway-ctrl-group-right">
                        <button 
                            className="subway-ctrl-btn ctrl-jump" 
                            onTouchStart={handleJump}
                            onMouseDown={handleJump}
                            onClick={handleJump}
                        >
                            ▲
                        </button>
                        <button 
                            className="subway-ctrl-btn ctrl-slide" 
                            onTouchStart={handleSlide}
                            onMouseDown={handleSlide}
                            onClick={handleSlide}
                        >
                            ▼
                        </button>
                    </div>
                </>
            )}

            {/* Overlays */}
            {status === 'idle' && (
                <div className="subway-overlay">
                    <div className="subway-panel">
                        <h2>🏃‍♂️ Kitty Surfers 🏃‍♀️</h2>
                        <p>Tránh tàu hỏa và rào chắn, nhặt tiền vàng trên đường chạy!</p>
                        <div className="subway-controls-guide">
                            <div>⌨️ <strong>Làn</strong>: A / D hoặc ◀ / ▶</div>
                            <div>⌨️ <strong>Nhảy</strong>: W, ▲ hoặc Space</div>
                            <div>⌨️ <strong>Trượt</strong>: S hoặc ▼</div>
                        </div>
                        <button className="subway-start-btn" onClick={startGame}>Chạy Ngay Nào 🎀</button>
                    </div>
                </div>
            )}

            {status === 'gameover' && (
                <div className="subway-overlay">
                    <div className="subway-panel gameover-panel">
                        <h2 className="gameover-title">💥 Bị Tóm Rồi! 💥</h2>
                        <p>Kitty đã chạy được quãng đường xa và thu thập rất nhiều xu!</p>
                        <div className="subway-stats">
                            <div>Độ dài: <strong>{score}</strong></div>
                            <div>Xu vàng: <strong>{coins}</strong></div>
                            <div className="subway-point-earned">Điểm thưởng: <strong>+{Math.floor(score / 10) + coins * 5} điểm</strong></div>
                        </div>
                        <div className="subway-gameover-btns">
                            <button className="subway-start-btn" onClick={startGame}>Chơi lại nhen 🔄</button>
                            <button className="subway-exit-btn" onClick={handleExit}>Về Menu 🏠</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
