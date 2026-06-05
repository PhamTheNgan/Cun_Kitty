import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import kittyImg from '/kitty.png'
import KittyMiner from './KittyMiner'
import Game3D from './Game3D'
import ArmyShooter from './ArmyShooter'
import TMSScreen from './TMSScreen'
import SubwaySurfer from './SubwaySurfer'
const soiPhotos = [
    "Soi/2aoboqbnkmcfol012wlbqadrelr7qaqwymcvzyto28.jpg",
    "Soi/2aoboqbnl0pirkoccsnte1alm9uotfq3za5nb31e29.jpg",
    "Soi/2aoboqbnl9pau8jnxrwgnshyzzd2lfoyns3ouiig30.jpg",
    "Soi/2aoboqbnlez168dhgalzrbjhviq4rbywyormbk1y31.jpg",
    "Soi/2aoboqbnlievm3wzjwpxfpb6s1cuoukobbjjjzhk32.jpg",
    "Soi/2aoboqbnm9eyf8txscm4u7wva6wfktef0pytuwyq33.jpg",
    "Soi/2aoboqbnmfczp2fse3onnctamveogq99lc4602by34.jpg",
    "Soi/2aoboqbnn1sk1kbxasqrjchuq7yfv9qg507rrtag35.jpg",
    "Soi/2aoboqbnnbjhqa25holeqibqxepj3tcv1dkbwwau38.jpg",
    "Soi/2aoboqbnnj8t2xps7ypzypc4cadetzxmbtcztujg39.jpg",
    "Soi/2aoboqbnnmixwpijyheagnysy8dy4s06gt4dab3g36.jpg",
    "Soi/2aoboqbnntqay24oxisdisisgnublwqsvkflzzhs37.jpg",
    "Soi/2aoboqbnnufzk9p6a7fmy8hmqh42dx6p70sng9gw40.jpg",
    "Soi/2aoboqbno0p5ej9abytja23ijziuer6zenkcoucu41.jpg",
    "Soi/2aoboqbnobgb1wgo99cvulhpcjvylycbqtzdgfmc42.jpg",
    "Soi/2aoboqbnocjw50njla6ghggf12vovfieuzscvabw43.jpg",
    "Soi/2aoboqbnogzn1ybqsio2ufy19pqeeexkvfow26fs44.jpg",
    "Soi/2aoboqbnp1d92isiaqv6yrjsqveso2hhsefn8cpo45.jpg",
    "Soi/2aoboqbnpaszxgptqmqwnhgmxtlupozonvxyj8sw46.jpg",
    "Soi/2aoboqbnpeqvb0hb1hguhki6occxww920mhtdgvw47.jpg",
    "Soi/2aoboqbnpvpivhtrfn7rahohbb5ydqey1h5xccfk48.jpg",
    "Soi/2aoboqbnpwehddot3o87qffkhvd3jlxwwf1lkcmm49.jpg",
    "Soi/2aoboqbnpws7adq7cp3s7wvlj8lwsq3g4am3uirm50.jpg",
    "Soi/2aoboqbnq49n44a52lhr3nposyovjuzmmltvliyg51.jpg",
    "Soi/2aoboqbnq4czgpui4xc5ohe2cwlduuyizu9s7ooq52.jpg",
    "Soi/2aoboqbnqcei9vxsimgnh4yt5nbdkaigugu2kyqm53.jpg",
    "Soi/2aoboqbnqi3izpbqckovgoubdke8taxvfwqn8r0s54.jpg"
];

const soiCaptions = [
    "Mồm dính sô-cô-la chu môi hôn gió nè 😘",
    "Sồi cười tít mắt đón chào tuổi mới 🎂",
    "Hot boy nhí siêu ngầu của cả nhà 😎",
    "Biểu cảm đáng yêu vô đối luôn nha 💕",
    "Sồi đội vương miện sinh nhật lấp lánh 👑",
    "Gương mặt tròn xoe đáng yêu cực kỳ 🌸",
    "Khoảnh khắc tinh nghịch ngộ nghĩnh 🤪",
    "Sồi đang suy nghĩ chuyện đại sự thế giới 🤔",
    "Ai ngoan bằng Sồi đâu nào 👼",
    "Đôi mắt sáng long lanh thông minh chưa kìa ✨",
    "Nụ cười tỏa nắng đốn tim mọi người ☀️",
    "Sồi lúc đang say sưa ăn quà vặt 🍎",
    "Dáng đứng bảnh bao phong cách soái ca 🕺",
    "Gương mặt góc nghiêng siêu điển trai 📸",
    "Sồi lúc đang làm nũng siêu dễ thương 🥺",
    "Khoảnh khắc cười thả ga vui vẻ cực kỳ 😂",
    "Sồi diện đồ xinh đi chơi phố nè 🚀",
    "Bé ngoan của cả nhà nay lớn tướng rồi 🎈",
    "Biểu cảm bất ngờ siêu ngộ nghĩnh 😮",
    "Sồi thả dáng chụp ảnh chuyên nghiệp 🌟",
    "Món quà ngọt ngào nhất thế gian chính là Sồi 🎁",
    "Đôi má bánh bao chỉ muốn véo thôi 💋",
    "Sồi tinh nghịch trêu đùa ống kính 😜",
    "Ánh mắt ngơ ngác đáng yêu chưa nè 😍",
    "Sồi đang chăm chú khám phá đồ chơi mới 🧸",
    "Nụ hôn gió ngọt ngào Sồi gửi tặng cả nhà 💖",
    "Chúc Sồi sinh nhật ngập tràn niềm vui 🎉"
];

const soiDetails = [
    "Bức ảnh Sồi mồm dính chocolate chu môi gửi nụ hôn gió ngọt ngào tới tất cả mọi người! Chúc ai xem ảnh này cũng có một ngày ngập tràn niềm vui nha! 💕",
    "Sồi cười tươi rói khi nhìn thấy bánh sinh nhật khổng lồ. Tuổi mới chúc Sồi luôn cười thật nhiều như này nhé! 🎂",
    "Với chiếc kính ngầu và dáng đứng bảnh bao, Sồi trông giống hệt một siêu sao nhí chuyên nghiệp! 😎",
    "Không ai có thể cưỡng lại biểu cảm cute lạc lối này của Sồi đâu nha! Đáng yêu xỉu lên xỉu xuống! 😍",
    "Chiếc vương miện Happy Birthday lấp lánh tôn lên vẻ đáng yêu như một hoàng tử nhỏ của Sồi! 👑",
    "Gương mặt phúng phính má bánh bao thương hiệu của Sồi, chỉ nhìn thôi là đã muốn cưng nựng rồi! 🌸",
    "Một khoảnh khắc nghịch ngợm đáng yêu được chộp lại. Sồi luôn mang lại tiếng cười cho cả nhà! 🤪",
    "Sồi đang đăm chiêu suy nghĩ: 'Không biết tối nay mẹ cho ăn món gì ngon đây ta?' 🤔",
    "Gương mặt ngây thơ ngoan ngoãn như một thiên thần nhỏ của Sồi làm tan chảy mọi trái tim! 👼",
    "Đôi mắt to tròn đen láy, lấp lánh sự thông minh và tò mò về thế giới xung quanh của bé Sồi! ✨",
    "Một nụ cười bằng mười thang thuốc bổ, và nụ cười của Sồi chính là liều thuốc hạnh phúc của cả nhà! ☀️",
    "Khoảnh khắc ăn uống say sưa không màng thế giới của Sồi. Hay ăn chóng lớn nha bé yêu! 🍎",
    "Học lỏm dáng đứng soái ca ở đâu mà bảnh thế này hả Sồi ơi! Lớn lên chắc chắn là hot boy rồi! 🕺",
    "Chụp góc nghiêng cũng không dìm được vẻ điển trai đáng yêu của bé Sồi đâu nha! 📸",
    "Mỗi khi Sồi làm nũng là cả nhà lại cưng chiều hết nấc, không ai nỡ từ chối bé cả! 🥺",
    "Khoảnh khắc Sồi cười thả ga hạnh phúc nhất. Chúc cuộc đời Sồi luôn tràn ngập tiếng cười như thế! 😂",
    "Sồi mặc đồ bảnh bao chuẩn bị đi quẩy phố cùng ba mẹ đây. Trông chững chạc lắm rồi nhé! 🚀",
    "Càng lớn Sồi càng ngoan ngoãn và biết vâng lời. Bé cưng ngoan nhất hệ mặt trời là đây! 🎈",
    "Biểu cảm ngạc nhiên vô cùng ngộ nghĩnh khi Sồi phát hiện ra món đồ chơi yêu thích được giấu kín! 😮",
    "Thả dáng chuyên nghiệp trước ống kính như một người mẫu ảnh thực thụ. Sồi tạo dáng siêu đỉnh! 🌟",
    "Sồi là món quà vô giá mà ông trời đã ban tặng, mang lại niềm hạnh phúc vô bờ bến cho cả gia đình! 🎁",
    "Hai chiếc má bánh bao phúng phính đáng yêu chỉ muốn thơm một cái thật kêu vào đó thôi! 💋",
    "Sồi đang nháy mắt tinh nghịch trêu đùa camera. Siêu quậy đáng yêu của cả nhà là đây! 😜",
    "Ánh mắt ngơ ngác đáng thương khi lỡ tay làm rơi đồ chơi. Đừng lo, cả nhà thương Sồi nhất! 😍",
    "Sồi đang vô cùng tập trung lắp ráp robot mới. Sự tập trung đáng quý của nhà khoa học tương lai! 🧸",
    "Nụ hôn gió ngọt ngào nhất hệ mặt trời dành riêng cho người xem bức ảnh này! Nhận lấy tình cảm của Sồi nha! 💖",
    "Bức ảnh kỷ niệm tuyệt vời đón chào tuổi mới. Chúc Sồi luôn khỏe mạnh, ngoan ngoãn và hạnh phúc trọn đời! 🎉"
];


function App() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    // App screen: 'login' | 'menu' | 'game' | 'miner'
    const [screen, setScreen] = useState(false ? 'menu' : 'login')
    const [showProfile, setShowProfile] = useState(false)
    const [totalPoints, setTotalPoints] = useState(() => parseInt(localStorage.getItem('kitty_points') || '0'))

    // Soi Birthday states
    const [showBirthdayModal, setShowBirthdayModal] = useState(false)
    const [activePhotoIndex, setActivePhotoIndex] = useState(0)
    const [confettiList, setConfettiList] = useState([])
    const [balloonList, setBalloonList] = useState([])
    const [floatingHearts, setFloatingHearts] = useState([])
    const [birthdayWishes, setBirthdayWishes] = useState(() => {
        return JSON.parse(localStorage.getItem('soi_birthday_wishes') || '[]')
    })
    const [newWish, setNewWish] = useState('')
    const [wishAuthor, setWishAuthor] = useState('')
    const [heartLikes, setHeartLikes] = useState(() => {
        return parseInt(localStorage.getItem('soi_heart_likes') || '0')
    })
    const [playMusic, setPlayMusic] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)
    const [photoLikes, setPhotoLikes] = useState(() => {
        return JSON.parse(localStorage.getItem('soi_photo_likes') || '{}')
    })

    // Reset lật ảnh khi đổi slide ảnh
    useEffect(() => {
        setIsFlipped(false);
    }, [activePhotoIndex]);

    const handleLikePhoto = (index, e) => {
        e.stopPropagation(); // Ngăn lật thẻ khi bấm thả tim
        const currentLikes = { ...photoLikes };
        const newLikes = (currentLikes[index] || 0) + 1;
        currentLikes[index] = newLikes;
        setPhotoLikes(currentLikes);
        localStorage.setItem('soi_photo_likes', JSON.stringify(currentLikes));

        // Tăng cả đếm tim tổng
        setHeartLikes(prev => {
            const nextTotal = prev + 1;
            localStorage.setItem('soi_heart_likes', String(nextTotal));
            return nextTotal;
        });

        // Tạo hiệu ứng nổ tim bay lung tung
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;

        const newHearts = Array.from({ length: 15 }).map((_, i) => {
            const angle = (Math.random() * Math.PI * 2); // Tỏa tròn 360 độ
            const speed = Math.random() * 8 + 5; // Lực bay ngẫu nhiên
            return {
                id: `h-photo-${Date.now()}-${i}-${Math.random()}`,
                x: startX,
                y: startY - 20,
                size: Math.random() * 12 + 16, // 16px - 28px
                color: ['#ff0055', '#ff3366', '#ff66b2', '#ff007f', '#ff758d', '#ff1a75', '#ff003c'][Math.floor(Math.random() * 7)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2 // Đẩy nhẹ hướng lên
            };
        });

        setFloatingHearts(prev => [...prev, ...newHearts]);

        setTimeout(() => {
            const heartIds = newHearts.map(h => h.id);
            setFloatingHearts(prev => prev.filter(h => !heartIds.includes(h.id)));
        }, 1800);
    };

    const [checkinToast, setCheckinToast] = useState('')
    const [showCheckinPopup, setShowCheckinPopup] = useState(false)
    const [checkinOptions, setCheckinOptions] = useState([])
    const [avatar, setAvatar] = useState(() => localStorage.getItem('kitty_avatar') || '')
    const avatarInputRef = useRef(null)

    // Tự động sinh confetti và bong bóng khi mở modal sinh nhật
    useEffect(() => {
        if (!showBirthdayModal) {
            setConfettiList([]);
            setBalloonList([]);
            setCandles([true, true, true, true, true, true, true]);
            setCurrentCard(null);
            return;
        }

        // Tạo confetti ban đầu
        const initialConfetti = Array.from({ length: 80 }).map((_, i) => ({
            id: `c-${i}-${Math.random()}`,
            x: Math.random() * 100, // % width
            y: Math.random() * -100, // xuất phát phía trên màn hình
            size: Math.random() * 10 + 6, // 6px - 16px
            color: ['#ff4d6d', '#ff758d', '#ffb3c1', '#ffea00', '#00ffff', '#00ff6c', '#b5179e'][Math.floor(Math.random() * 7)],
            delay: Math.random() * 5,
            duration: Math.random() * 4 + 4,
            rotation: Math.random() * 360,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        }));
        setConfettiList(initialConfetti);

        // Tạo bong bóng ban đầu
        const initialBalloons = Array.from({ length: 15 }).map((_, i) => ({
            id: `b-${i}-${Math.random()}`,
            x: Math.random() * 90 + 5, // 5% - 95%
            size: Math.random() * 30 + 40, // 40px - 70px
            color: ['rgba(255, 77, 109, 0.75)', 'rgba(255, 117, 141, 0.75)', 'rgba(255, 234, 0, 0.75)', 'rgba(0, 255, 255, 0.75)', 'rgba(181, 23, 158, 0.75)'][Math.floor(Math.random() * 5)],
            delay: Math.random() * 6,
            duration: Math.random() * 6 + 7
        }));
        setBalloonList(initialBalloons);

        // Phát nhạc sinh nhật tự động
        setPlayMusic(true);

        // Tự động chạy slideshow ảnh
        const slideInterval = setInterval(() => {
            setActivePhotoIndex(prev => (prev + 1) % soiPhotos.length);
        }, 4000);

        return () => {
            clearInterval(slideInterval);
        };
    }, [showBirthdayModal]);

    // Trình phát nhạc chiptune retro Happy Birthday bằng Web Audio API
    useEffect(() => {
        if (!showBirthdayModal || !playMusic) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        let activeNodes = [];
        let isPlaying = true;

        const noteFreqs = {
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
            'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
        };

        const melody = [
            { note: 'G4', dur: 0.35 }, { note: 'G4', dur: 0.15 },
            { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
            { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 1.0 },

            { note: 'G4', dur: 0.35 }, { note: 'G4', dur: 0.15 },
            { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
            { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 1.0 },

            { note: 'G4', dur: 0.35 }, { note: 'G4', dur: 0.15 },
            { note: 'G5', dur: 0.5 }, { note: 'E5', dur: 0.5 },
            { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.5 },
            { note: 'A4', dur: 1.0 },

            { note: 'F5', dur: 0.35 }, { note: 'F5', dur: 0.15 },
            { note: 'E5', dur: 0.5 }, { note: 'C5', dur: 0.5 },
            { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 1.2 }
        ];

        const playSong = async () => {
            let index = 0;
            const tempo = 600; // ms per beat

            while (isPlaying && showBirthdayModal && playMusic) {
                const step = melody[index];
                const freq = noteFreqs[step.note];
                const duration = step.dur * tempo;

                if (audioCtx.state === 'suspended') {
                    try {
                        await audioCtx.resume();
                    } catch (e) { }
                }

                if (freq) {
                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration / 1000) - 0.02);

                    osc.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    osc.start();
                    osc.stop(audioCtx.currentTime + duration / 1000);

                    activeNodes.push(osc);
                }

                await new Promise(resolve => setTimeout(resolve, duration + 40));
                index = (index + 1) % melody.length;
            }
        };

        playSong();

        return () => {
            isPlaying = false;
            activeNodes.forEach(node => {
                try { node.stop(); } catch (e) { }
            });
            try { audioCtx.close(); } catch (e) { }
        };
    }, [showBirthdayModal, playMusic]);

    const [candles, setCandles] = useState([true, true, true, true, true, true, true]);

    const soiCards = [
        { title: "Vua Chăm Ngoan 🏅", emoji: "🏆", desc: "Sồi tự giác học bài, dọn dẹp đồ chơi và giúp đỡ bố mẹ!", color: "linear-gradient(135deg, #e0f2fe, #bae6fd)", border: "#38bdf8" },
        { title: "Siêu Nhân Ăn Ngoan ⚡", emoji: "🍚", desc: "Giúp Sồi ăn siêu nhanh, đánh bay mọi món ăn ngon lành trong vòng 5 nốt nhạc!", color: "linear-gradient(135deg, #fef9c3, #fef08a)", border: "#eab308" },
        { title: "Thần Đồng Thông Minh 🧠", emoji: "📖", desc: "Nhận ngay siêu buff tập trung học tập, giải toán nhanh và học tiếng Anh siêu đỉnh!", color: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", border: "#a855f7" },
        { title: "Họa Sĩ Sáng Tạo 🎨", emoji: "🖌️", desc: "Khơi nguồn cảm hứng sáng tác nghệ thuật, vẽ tranh và tô màu siêu ngầu!", color: "linear-gradient(135deg, #dcfce7, #bbf7d0)", border: "#22c55e" },
        { title: "Chiến Binh Khỏe Mạnh 💪", emoji: "🏃", desc: "Sồi luôn tràn đầy năng lượng, đề kháng cực cao, vui chơi chạy nhảy siêu khỏe!", color: "linear-gradient(135deg, #fee2e2, #fecaca)", border: "#ef4444" },
        { title: "Ngôi Sao Ca Nhạc 🎤", emoji: "🎶", desc: "Giọng ca vàng oanh tạc mọi sân khấu, mang tiếng cười và niềm vui đến mọi nơi!", color: "linear-gradient(135deg, #ffe4e6, #fecdd3)", border: "#f43f5e" },
        { title: "Vua Tình Cảm 💕", emoji: "💖", desc: "Nhận buff nhân đôi tình yêu thương, luôn ngoan ngoãn và ấm áp bên gia đình!", color: "linear-gradient(135deg, #fff1f2, #ffe4e6)", border: "#fda4af" }
    ];

    const [collectedCards, setCollectedCards] = useState(() => {
        return JSON.parse(localStorage.getItem('soi_collected_cards') || '[]')
    });
    const [currentCard, setCurrentCard] = useState(null);
    const [isOpeningGift, setIsOpeningGift] = useState(false);

    const playDrawSound = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenGift = () => {
        if (isOpeningGift) return;
        setIsOpeningGift(true);
        playDrawSound();

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * soiCards.length);
            const drawn = soiCards[randomIndex];
            setCurrentCard(drawn);
            setIsOpeningGift(false);

            setCollectedCards(prev => {
                if (prev.includes(randomIndex)) return prev;
                const next = [...prev, randomIndex];
                localStorage.setItem('soi_collected_cards', JSON.stringify(next));
                
                if (next.length === 7) {
                    triggerCandleCelebration();
                }
                return next;
            });
        }, 800);
    };

    const playPuffSound = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (err) {
            console.log(err);
        }
    };

    const playFanfareSound = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            
            const notes = [
                { note: 523.25, time: 0 },    // C5
                { note: 659.25, time: 0.15 }, // E5
                { note: 783.99, time: 0.3 },  // G5
                { note: 1046.50, time: 0.45 },// C6
                { note: 1318.51, time: 0.6 }  // E6
            ];
            
            notes.forEach(n => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(n.note, ctx.currentTime + n.time);
                
                gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
                gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + n.time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.time + 0.4);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + n.time);
                osc.stop(ctx.currentTime + n.time + 0.45);
            });
        } catch (err) {
            console.log(err);
        }
    };

    const triggerCandleCelebration = () => {
        playFanfareSound();

        const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
            id: `c-celebrate-${Date.now()}-${i}-${Math.random()}`,
            x: Math.random() * 100,
            y: Math.random() * -50,
            size: Math.random() * 12 + 8,
            color: ['#ff4d6d', '#ff758d', '#ffea00', '#00ffff', '#00ff6c', '#ff9f43', '#1dd1a1'][Math.floor(Math.random() * 7)],
            delay: Math.random() * 2,
            duration: Math.random() * 3 + 3,
            rotation: Math.random() * 360,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        }));
        setConfettiList(prev => [...prev, ...newConfetti]);

        const newBalloons = Array.from({ length: 10 }).map((_, i) => ({
            id: `b-celebrate-${Date.now()}-${i}-${Math.random()}`,
            x: Math.random() * 80 + 10,
            size: Math.random() * 25 + 45,
            color: ['rgba(255, 77, 109, 0.85)', 'rgba(255, 234, 0, 0.85)', 'rgba(0, 255, 255, 0.85)', 'rgba(29, 209, 161, 0.85)', 'rgba(255, 159, 67, 0.85)'][Math.floor(Math.random() * 5)],
            delay: Math.random() * 1.5,
            duration: Math.random() * 5 + 6
        }));
        setBalloonList(prev => [...prev, ...newBalloons]);
    };

    const handleBlowCandle = (index) => {
        if (!candles[index]) return;
        const newCandles = [...candles];
        newCandles[index] = false;
        setCandles(newCandles);
        playPuffSound();

        const allBlown = newCandles.every(c => !c);
        if (allBlown) {
            triggerCandleCelebration();
        }
    };

    const handleAddHeart = (e) => {
        const newLikes = heartLikes + 1;
        setHeartLikes(newLikes);
        localStorage.setItem('soi_heart_likes', String(newLikes));

        // Tạo hiệu ứng nổ tim bay lung tung
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;

        const newHearts = Array.from({ length: 15 }).map((_, i) => {
            const angle = (Math.random() * Math.PI * 2); // Tỏa tròn 360 độ
            const speed = Math.random() * 8 + 5; // Lực bay ngẫu nhiên
            return {
                id: `h-${Date.now()}-${i}-${Math.random()}`,
                x: startX,
                y: startY - 20,
                size: Math.random() * 12 + 16, // 16px - 28px
                color: ['#ff4d6d', '#ff758d', '#ff007f', '#ff3366', '#ff66b2', '#ff003c', '#ff1a75'][Math.floor(Math.random() * 7)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2 // Đẩy nhẹ hướng lên
            };
        });

        setFloatingHearts(prev => [...prev, ...newHearts]);

        setTimeout(() => {
            const heartIds = newHearts.map(h => h.id);
            setFloatingHearts(prev => prev.filter(h => !heartIds.includes(h.id)));
        }, 1800);
    };

    const handleAddWish = (e) => {
        e.preventDefault();
        if (!newWish.trim()) return;

        const author = wishAuthor.trim() || 'Người giấu tên 🤫';
        const wishItem = {
            id: `w-${Date.now()}`,
            author: author,
            content: newWish.trim(),
            date: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            color: ['#fff0f3', '#fff9db', '#e6fcf5', '#f3f0ff', '#e8f7ff'][Math.floor(Math.random() * 5)],
            emoji: ['🌸', '🎂', '✨', '🎈', '🎉', '🎁', '💖'][Math.floor(Math.random() * 7)]
        };

        const updatedWishes = [wishItem, ...birthdayWishes];
        setBirthdayWishes(updatedWishes);
        localStorage.setItem('soi_birthday_wishes', JSON.stringify(updatedWishes));
        setNewWish('');
        setWishAuthor('');
    };

    const handleDeleteWish = (id) => {
        const updated = birthdayWishes.filter(w => w.id !== id);
        setBirthdayWishes(updated);
        localStorage.setItem('soi_birthday_wishes', JSON.stringify(updated));
    };

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

    // ========== TMS SCREEN ==========
    if (screen === 'tms') {
        return <TMSScreen onBack={() => setScreen('login')} />
    }

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
                    <button onClick={() => setScreen('tms')} className="login-tms-btn">Vào TMS 🕒</button>
                    <button onClick={() => setShowBirthdayModal(true)} className="login-soi-birthday-btn">Happy Birth Day Sồi 🎂🎈</button>
                    {loginError && <p className="login-error">{loginError}</p>}
                </div>

                {showBirthdayModal && (
                    <div className="birthday-modal-overlay">
                        {/* Confetti Container */}
                        <div className="confetti-container">
                            {confettiList.map(c => (
                                <div key={c.id} className={`confetti ${c.shape}`} style={{
                                    left: `${c.x}%`,
                                    top: `${c.y}%`,
                                    width: `${c.size}px`,
                                    height: `${c.shape === 'circle' ? c.size : c.size * 0.4}px`,
                                    backgroundColor: c.color,
                                    animationDelay: `${c.delay}s`,
                                    animationDuration: `${c.duration}s`,
                                    transform: `rotate(${c.rotation}deg)`
                                }} />
                            ))}
                        </div>

                        {/* Balloons Container */}
                        <div className="balloons-container">
                            {balloonList.map(b => (
                                <div key={b.id} className="balloon" style={{
                                    left: `${b.x}%`,
                                    width: `${b.size}px`,
                                    height: `${b.size * 1.3}px`,
                                    backgroundColor: b.color,
                                    boxShadow: `inset -6px -6px 12px rgba(0,0,0,0.15), 0 10px 20px ${b.color}`,
                                    animationDelay: `${b.delay}s`,
                                    animationDuration: `${b.duration}s`
                                }}>
                                    <div className="balloon-string" style={{ height: `${b.size * 1.5}px` }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Floating Hearts Container */}
                        <div className="floating-hearts-container">
                            {floatingHearts.map(h => (
                                <div key={h.id} className="floating-heart" style={{
                                    left: `${h.x}px`,
                                    top: `${h.y}px`,
                                    fontSize: `${h.size}px`,
                                    color: h.color,
                                    transform: `translate(-50%, -50%)`,
                                    '--vx': h.vx,
                                    '--vy': h.vy
                                }}>💖</div>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="birthday-modal-content">
                            <button className="close-birthday-btn" onClick={() => setShowBirthdayModal(false)}>✕</button>
                            
                            <div className="birthday-header">
                                <span className="bday-icon-top">👑</span>
                                <h2>Happy Birthday Sồi! 🎂✨</h2>
                                <p className="bday-subtext">Chúc bé Sồi hay ăn chóng lớn, luôn ngoan ngoãn và ngập tràn niềm vui! 💕</p>
                            </div>

                            <div className="birthday-modal-body">
                                {/* Row 1: Cake & Slide side-by-side */}
                                <div className="birthday-modal-row-top">
                                    <div className="birthday-left-column-group">
                                        {/* Interactive 7th Birthday Cake */}
                                        <div className="cake-section">
                                            <div className="cake-title">
                                                🎂 Thổi Nến Mừng Sồi 7 Tuổi 🕯️
                                            </div>
                                            <div className="cake-instructions">
                                                {candles.some(c => c) 
                                                    ? "Bấm vào từng ngọn nến để thổi tắt nến nhé! 💨"
                                                    : "🎉 Oa! Bạn đã thổi tắt hết nến rồi! Lời chúc đặc biệt đã xuất hiện! 👇"}
                                            </div>

                                            <div className="cake-container">
                                                {/* Candles placement */}
                                                <div className="candles-row">
                                                    {candles.map((isBurning, index) => (
                                                        <div 
                                                            key={index} 
                                                            className={`candle-wrapper ${!isBurning ? 'extinguished' : ''}`}
                                                            onClick={() => handleBlowCandle(index)}
                                                        >
                                                            <div className="flame"></div>
                                                            <div className="wick"></div>
                                                            <div className="candle-stick"></div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 3D-like Layered Cake */}
                                                <div className="cake-layer top">
                                                    <div className="drip drip-1"></div>
                                                    <div className="drip drip-2"></div>
                                                    <div className="drip drip-3"></div>
                                                    <div className="drip drip-4"></div>
                                                </div>
                                                <div className="cake-layer middle"></div>
                                                <div className="cake-layer"></div>
                                            </div>

                                            {/* Special Wish Reveal Card */}
                                            {!candles.some(c => c) && (
                                                <div className="wish-reveal-card">
                                                    <div className="wish-reveal-title">🌟 LỜI CHÚC SỒI 7 TUỔI 🌟</div>
                                                    <div className="wish-reveal-text">
                                                        "Chúc mừng bé Sồi tròn 7 tuổi! Hay ăn chóng lớn, luôn thông minh, ngoan ngoãn, ngập tràn niềm vui và hạnh phúc bên gia đình thân yêu! Mọi điều tốt lành nhất sẽ luôn đồng hành cùng con! 🎈🎁💖"
                                                    </div>
                                                    <button className="relight-btn" onClick={() => setCandles([true, true, true, true, true, true, true])}>
                                                        🕯️ Đốt nến ước lại nào!
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Secret Gift Box Section */}
                                        <div className="secret-gift-section">
                                            <div className="gift-title">🎁 Hộp Quà Sinh Nhật Tuổi Mới ✨</div>
                                            <div className="gift-subtitle">Sưu tập đủ 7 Thẻ bài Ma thuật cho Sồi!</div>
                                            
                                            {!currentCard ? (
                                                <div className="gift-box-container" onClick={handleOpenGift}>
                                                    <div className={`gift-emoji ${isOpeningGift ? 'shake' : ''}`}>
                                                        🎁
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="gacha-card" 
                                                    style={{ 
                                                        background: currentCard.color, 
                                                        borderColor: currentCard.border 
                                                    }}
                                                >
                                                    <div className="card-emoji-large">{currentCard.emoji}</div>
                                                    <div className="card-title" style={{ color: currentCard.border }}>{currentCard.title}</div>
                                                    <div className="card-desc">{currentCard.desc}</div>
                                                    <button className="draw-again-btn" onClick={() => setCurrentCard(null)}>
                                                        Mở quà tiếp! 🎁
                                                    </button>
                                                </div>
                                            )}

                                            <div className="collection-progress">
                                                Đã thu thập: {collectedCards.length}/7 Thẻ bài 🏆
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slide Column (Carousel + Interaction Bar) */}
                                    <div className="slide-column-wrapper">
                                        {/* Carousel */}
                                        {/* Slide Trình Chiếu Ảnh */}
                                        <div className="photo-slide-wrapper">
                                            <div className="photo-slide-container">
                                                <button className="carousel-btn prev" onClick={() => setActivePhotoIndex(prev => (prev - 1 + soiPhotos.length) % soiPhotos.length)}>‹</button>
                                                
                                                <div className="slide-frame">
                                                    <img 
                                                        src={`${import.meta.env.BASE_URL || '/'}${soiPhotos[activePhotoIndex]}`} 
                                                        alt={`Sồi ${activePhotoIndex}`} 
                                                        className="slide-image" 
                                                        key={activePhotoIndex}
                                                    />
                                                    <div className="slide-caption-bar">
                                                        <p className="slide-caption">{soiCaptions[activePhotoIndex] || "Bé Sồi dễ thương 💕"}</p>
                                                    </div>
                                                    <span className="photo-counter">{activePhotoIndex + 1} / {soiPhotos.length}</span>
                                                </div>

                                                <button className="carousel-btn next" onClick={() => setActivePhotoIndex(prev => (prev + 1) % soiPhotos.length)}>›</button>
                                            </div>
                                            
                                            {/* Chi tiết bức ảnh & Thả tim riêng */}
                                            <div className="slide-details-panel">
                                                <p className="slide-desc">{soiDetails[activePhotoIndex] || "Khoảnh khắc đáng yêu của bé Sồi!"}</p>
                                                <div className="slide-like-section">
                                                    <span className="slide-like-count">💖 {photoLikes[activePhotoIndex] || 0} lượt thả tim</span>
                                                    <button 
                                                        className="slide-like-btn"
                                                        onClick={(e) => handleLikePhoto(activePhotoIndex, e)}
                                                    >
                                                        Thả Tim Ảnh Này 💕
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="carousel-dots">
                                                {soiPhotos.map((_, i) => (
                                                    <span key={i} className={`carousel-dot ${i === activePhotoIndex ? 'active' : ''}`} onClick={() => setActivePhotoIndex(i)} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Interaction Bar */}
                                        <div className="birthday-interaction">
                                            <button className="heart-like-btn" onClick={handleAddHeart}>
                                                Thả tim cho Sồi 💖 <span className="heart-counter">{heartLikes}</span>
                                            </button>
                                            <button className="music-toggle-btn" onClick={() => setPlayMusic(!playMusic)}>
                                                {playMusic ? '🔊 Tắt Nhạc' : '🔇 Mở Nhạc 🎵'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Wishes Wall (Spans full width at bottom) */}
                                <div className="wishes-section">
                                    <h3>Bức Tường Lời Chúc 🌸</h3>
                                    
                                    <form onSubmit={handleAddWish} className="wish-form-inline">
                                        <input 
                                            type="text" 
                                            placeholder="Tên của bạn..." 
                                            value={wishAuthor} 
                                            onChange={e => setWishAuthor(e.target.value)}
                                            maxLength={25}
                                            className="author-input"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Nhập lời chúc ngọt ngào dành cho bé Sồi..." 
                                            value={newWish} 
                                            onChange={e => setNewWish(e.target.value)}
                                            maxLength={150}
                                            required
                                            className="content-input"
                                        />
                                        <button type="submit">Gửi Lời Chúc ✍️</button>
                                    </form>

                                    <div className="wishes-wall">
                                        {birthdayWishes.length === 0 ? (
                                            <p className="no-wishes">Hãy là người đầu tiên gửi lời chúc dễ thương đến Sồi! ✨</p>
                                        ) : (
                                            <div className="wishes-grid">
                                                {birthdayWishes.map(wish => (
                                                    <div key={wish.id} className="wish-card" style={{ backgroundColor: wish.color }}>
                                                        <button className="delete-wish-btn" onClick={() => handleDeleteWish(wish.id)}>×</button>
                                                        <div className="wish-header">
                                                            <span className="wish-emoji">{wish.emoji}</span>
                                                            <span className="wish-author">{wish.author}</span>
                                                        </div>
                                                        <p className="wish-content">{wish.content}</p>
                                                        <span className="wish-date">{wish.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                        <div className="game-card" onClick={() => setScreen('subway')}>
                            <div className="game-card-icon">🏃‍♂️</div>
                            <div className="game-card-info">
                                <h3>Kitty Surfers</h3>
                                <p>Né tàu hỏa, rào chắn, nhặt tiền xu trên đường chạy!</p>
                                <span className="game-card-badge">🏃 Chạy ngay</span>
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

    // ========== SUBWAY SURFER SCREEN ==========
    if (screen === 'subway') {
        return (
            <SubwaySurfer
                onBack={() => setScreen('menu')}
                onFinish={(pts) => { addPoints(pts); setScreen('menu'); }}
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
