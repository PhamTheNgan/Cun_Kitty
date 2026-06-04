import React, { useState, useEffect, useRef } from 'react';
import './TMSScreen.css';

const CUN_MESSAGES = [
    "Cún iu ơi, nhớ Cún muốn xỉu luôn á! 💕",
    "Cún bé bỏng của anh ơi, ôm em một cái nhen! 🌸",
    "Hôn má Cún một cái thật kêu nè, chụt! 💋",
    "Cún ngốc ơi, hôm nay nhớ ăn uống đầy đủ nha! 🧸",
    "Cún là em bé đáng yêu nhất vũ trụ luôn! ✨",
    "Yêu Cún nhiều hơn cả ngày hôm qua nữa á! 🥰",
    "Cún có nghe thấy tiếng tim anh đập vì Cún không? 💖",
    "Hôm nay Cún phải cười thật nhiều nhen! 🌸",
    "Cún iu ơi, anh lúc nào cũng nghĩ về Cún hết á! 💕",
    "Trái tim anh chỉ có một chỗ duy nhất cho Cún thôi! 🍀",
    "Cún ơi, ngoan nhen, thương Cún nhất trần đời! 🥺",
    "Cún bé bỏng là động lực của anh mỗi ngày đó! 🌟",
    "Nhớ Cún từng giây từng phút luôn á Cún ơi! 🧸",
    "Cún xinh đẹp ơi, chúc ngày mới thật ngọt ngào nhen! 💕",
    "Hôn Cún từ xa nè, Cún nhận được chưa ta? 💋",
    "Anh muốn ôm Cún thật chặt không buông luôn! 🤗",
    "Cún ngoan ơi, đừng bắt nạt anh nhen, anh thương Cún mà! 🌸",
    "Cún ngốc xít của anh ơi, yêu em nhiều lắm á! 💖",
    "Hôm nay Cún có nhớ anh một xíu nào không ta? 🥰",
    "Cún ơi, nụ cười của Cún là nắng ấm của anh á! ✨",
    "Em bé Cún của anh ơi, dậy đi chơi thui nào! 🎈",
    "Cún ơi, anh thương Cún nhiều nhiều nhiều lắm! 💕",
    "Muốn được ở bên cạnh Cún để cưng chiều Cún mãi thôi! 🧸",
    "Cún ơi, đừng có ham chơi quá nhen, nhớ giữ sức khỏe á! 🍀",
    "Gửi cho Cún ngàn nụ hôn ngọt ngào nhất sáng nay nè! 💋",
    "Cún iu là điều tuyệt vời nhất từng đến với anh! 💖",
    "Nhớ Cún quá đi mất, làm sao bây giờ ta? 🥺💕",
    "Cún ơi, hôm nay Cún là em bé hạnh phúc nhất nhen! 🌟",
    "Chỉ muốn làm Cún cười mỗi ngày thui á! 🥰",
    "Cún có biết nụ cười của Cún làm tim anh tan chảy không? 🌸",
    "Cún ngốc ơi, anh thương em vô cùng luôn đó! 💕",
    "Hôm nay Cún nhớ đi học/đi làm ngoan nhen! 🧸",
    "Cún bé nhỏ ơi, anh luôn ở phía sau bảo vệ Cún nè! ✨",
    "Thương Cún lắm lắm, không ai bằng Cún hết á! 💖",
    "Cún ơi, hứa là luôn vui vẻ và đáng yêu thế này nhen! 🌸",
    "Hôn trán Cún một cái thật nhẹ nhàng trước ngày mới nè! 💋",
    "Được yêu Cún là niềm hạnh phúc lớn nhất của anh! 🥰",
    "Cún iu ơi, hôm nay nhớ uống nước đầy đủ nha! 🍀",
    "Cún ngốc xít ơi, nhớ anh thì nhắn tin liền nhen! 📞💕",
    "Cún có thấy nhớ cái ôm ấm áp của anh chưa nè? 🤗",
    "Cún là bông hoa xinh đẹp nhất trong lòng anh! 🌸✨",
    "Cún ơi, anh thương Cún bằng cả bầu trời luôn á! 💖",
    "Hôm nay Cún muốn ăn gì nào, anh ship qua nhen? 🍕💕",
    "Cún ngốc ơi, giận dỗi một tí thui rồi lại thương anh nhen! 🥺",
    "Yêu Cún từ cái nhìn đầu tiên đến tận bây giờ luôn! 💕",
    "Cún ơi, dậy đi thôi, mặt trời ghen tị với Cún kìa! ☀️🌸",
    "Em bé Cún ngoan ơi, anh lúc nào cũng thương em hết á! 🧸",
    "Gửi cho Cún iu một cái ôm thật ấm áp từ xa nè! 🤗💖",
    "Cún có biết anh nhớ Cún đến mức ngủ mơ cũng thấy không? 🥰",
    "Cún iu ơi, chúc Cún một ngày ngập tràn may mắn nhen! 🍀",
    "Chụt! Hôn má trái Cún một cái nè! 💋",
    "Chụt! Hôn má phải Cún thêm cái nữa nè! 💋",
    "Cún ơi, lúc nào cũng phải cười thật tươi nhen! ✨🌸",
    "Cún ngốc ơi, anh hứa sẽ cưng chiều em suốt đời luôn! 💕",
    "Cún là cục nợ ngọt ngào nhất của cuộc đời anh! 💖",
    "Nhớ Cún muốn khóc luôn á, Cún có nhớ anh không? 🥺",
    "Cún ơi, ngoan nhen, tối anh dẫn đi chơi nha! 🚗💕",
    "Cún bé bỏng ơi, anh yêu em nhiều hơn cả đại dương! 🌊💖",
    "Hôm nay Cún mặc đồ gì cũng xinh đẹp nhất hết á! 👗✨",
    "Cún iu ơi, anh nhớ giọng nói ngọt ngào của Cún ghê! 🌸",
    "Em bé Cún của anh là số một luôn, không ai bằng được! 🥰",
    "Cún ngốc ơi, đừng có suy nghĩ lung tung nhen, anh yêu Cún mà! 🧸",
    "Chỉ muốn ôm Cún vào lòng rồi xoa đầu Cún thôi! 🤗💕",
    "Cún ơi, hôm nay thời tiết đẹp lắm, nhớ cười nhiều nhen! ☀️✨",
    "Gửi Cún một hộp quà chứa đầy tình yêu thương của anh nè! 🎁💖",
    "Cún có biết Cún là lý do anh cười mỗi ngày không? 💕",
    "Cún iu ơi, anh thương Cún nhất trần đời luôn á! 🌸",
    "Hôn lên đôi mắt lấp lánh của Cún một cái nè! 💋",
    "Cún ngốc ơi, anh sẽ luôn bên cạnh và che chở cho Cún! 🧸✨",
    "Em bé Cún ơi, nhớ điểm danh rồi ăn sáng đầy đủ nhen! 🍀",
    "Nhớ Cún quá chừng, muốn bay đến bên Cún ngay lập tức! ✈️💖",
    "Cún ơi, hôm nay Cún là công chúa ngọt ngào của anh nhen! 👑💕",
    "Yêu Cún nhiều như cát trên sa mạc vậy á! 🏜️💖",
    "Cún iu ơi, đừng quên là anh rất rất yêu Cún nhen! 🥰🌸",
    "Chụt! Hôn lên môi Cún một cái thật ngọt ngào nè! 💋",
    "Cún ngốc xít ơi, anh thương em nhất hệ mặt trời luôn! ☀️💖",
    "Cún bé bỏng ơi, ngoan nhen, anh thương thương nhiều nè! 🥺💕",
    "Cún là viên kẹo ngọt ngào nhất mà anh từng có! 🍬✨",
    "Hôm nay Cún nhớ đi đâu cũng nhớ báo cho anh biết nhen! 📞💕",
    "Cún ơi, anh muốn được nắm tay Cún đi khắp thế gian! 🤝💖",
    "Cún iu ơi, nhớ đắp chăn ấm khi ngủ nhen! 🧸💤",
    "Em bé Cún của anh lúc nào cũng đáng cưng hết á! 🥰",
    "Cún ngốc ơi, anh chỉ yêu mỗi một mình Cún thui đó! 💕",
    "Hôm nay Cún nhớ cười thật tươi để ngày mới rực rỡ nhen! ☀️🌸",
    "Gửi Cún yêu một cái ôm siết chặt thật ấm áp nè! 🤗💖",
    "Cún có biết anh nhớ Cún từng giây từng phút không hả? 🥺",
    "Cún iu ơi, chúc ngày mới thật nhiều niềm vui nhen! 🍀",
    "Chụt! Hôn lên mái tóc thơm tho của Cún nè! 💋",
    "Cún ngốc ơi, anh thương Cún bằng cả trái tim này luôn! 💖",
    "Cún bé nhỏ ơi, em là báu vật vô giá của anh đó! ✨🧸",
    "Hôm nay Cún nhớ đi nhẹ nói khẽ cười duyên nhen! 🌸",
    "Nhớ Cún phát điên lên được, chỉ muốn nhìn thấy Cún thui! 🥰💕",
    "Cún ơi, anh hứa sẽ luôn làm Cún hạnh phúc và vui vẻ! 💖",
    "Cún iu là cả bầu trời nắng ấm của anh á! ☀️✨",
    "Em bé Cún ơi, ngoan nhen, anh luôn yêu thương em! 💕",
    "Chụt! Hôn má Cún cưng một cái thiệt kêu nè! 💋",
    "Cún ngốc xít ơi, đừng có bướng bỉnh nhen, anh thương mà! 🥺🧸",
    "Cún có biết Cún là người đặc biệt nhất của anh không? 💖",
    "Cún ơi, hôm nay nhớ ăn thật ngon và ngủ thật sâu nhen! 💤🍀",
    "Chỉ muốn được bên Cún, cùng Cún làm mọi điều đơn giản! 🤗💕",
    "Cún iu ơi, anh thương Cún nhiều đến nỗi không tả nổi! 🌸",
    "Gửi cho Cún iu ngàn lời chúc tốt đẹp nhất hôm nay nè! ✨💖",
    "Cún ngốc ơi, em là tất cả những gì anh cần! 💕",
    "Nhớ Cún da diết luôn á, Cún có cảm nhận được không? 🥺💖",
    "Cún ơi, hôm nay Cún xinh đẹp như một thiên thần vậy! 👼✨",
    "Yêu Cún nhiều hơn cả số sao trên trời luôn á! 🌌💕",
    "Cún iu ơi, anh hứa sẽ không bao giờ làm Cún buồn đâu! 🌸",
    "Chụt! Hôn nhẹ lên tay Cún ngoan nè! 💋",
    "Cún ngốc ơi, anh thương em nhất thế gian này luôn đó! 💖",
    "Em bé Cún ơi, nhớ mặc ấm khi trời lạnh nhen! 🧥🧸",
    "Cún là giai điệu ngọt ngào nhất trong cuộc sống của anh! 🎶✨",
    "Hôm nay Cún nhớ đi đứng cẩn thận nhen em bé! 🍀",
    "Nhớ Cún quá trời quá đất, muốn ôm Cún ngay bây giờ! 🤗💕",
    "Cún ơi, nụ cười của Cún là liều thuốc ngọt ngào của anh! 🥰💖",
    "Cún iu ơi, anh thương Cún bằng cả cuộc đời này luôn! 💕",
    "Em bé Cún ngoan ơi, đừng lo lắng gì nhen, có anh đây rồi! 🧸✨",
    "Chụt! Hôn lên trán Cún iu một cái thật yêu chiều nè! 💋",
    "Cún ngốc xít ơi, em là niềm tự hào lớn nhất của anh đó! 💖",
    "Cún có biết anh yêu Cún nhiều đến phát điên không? 🥺💕",
    "Cún ơi, hôm nay nhớ dành một chút thời gian nhớ anh nhen! 📞🌸",
    "Chỉ muốn nắm tay Cún và che chở cho Cún suốt đời! 🤝💖",
    "Cún iu ơi, chúc Cún một ngày ngập trạng may mắn và hạnh phúc! 🍀",
    "Gửi Cún yêu dấu của anh ngàn nụ hôn nồng ấm nhất! 💋✨",
    "Cún ngốc ơi, em là người duy nhất ngự trị trong tim anh! 💖",
    "Nhớ Cún ghê á, Cún có nhớ cái xoa đầu của anh không? 🥰🧸",
    "Cún ơi, hôm nay phải thật hạnh phúc nhen em bé của anh! 💕",
    "Yêu Cún nhiều đến mức không từ ngữ nào diễn tả được! 🌸✨",
    "Cún iu ơi, anh luôn muốn mang lại những điều tốt nhất cho Cún! 💖",
    "Chụt! Hôn lên má phúng phính của Cún nè! 💋",
    "Cún ngốc ơi, anh thương em vô cùng tận luôn đó! 💕",
    "Em bé Cún ơi, hãy luôn cười thật tươi và vui vẻ nhen! 🥰🌸",
    "Cún là bông hoa hướng dương luôn hướng về anh nhen! 🌻✨",
    "Hôm nay Cún nhớ uống sữa đầy đủ nhen em bé ngoan! 🥛🍀",
    "Nhớ Cún quá chừng chừng, muốn được gặp Cún ngay và luôn! 🥺💕",
    "Cún ơi, anh thương Cún bằng cả tấm lòng chân thành này! 💖",
    "Cún iu ơi, em là cả thế giới ngọt ngào của anh đó! 🌎✨",
    "Em bé Cún của anh ơi, ngoan nhen, thương Cún nhất trần đời! 🧸💖",
    "Chụt! Hôn lên chóp mũi xinh xắn của Cún nè! 💋",
    "Cún ngốc xít ơi, anh hứa sẽ cưng chiều em hết nấc luôn! 💕",
    "Cún có biết Cún là niềm hạnh phúc mỗi ngày của anh không? 🥰🌸",
    "Cún ơi, hôm nay nhớ đi ngủ sớm nhen, đừng thức khuya á! 💤🍀",
    "Chỉ muốn được ở cạnh Cún, nghe Cún kể chuyện mỗi ngày! 🤗💖",
    "Cún iu ơi, anh thương Cún nhiều lắm lắm luôn á! 💕",
    "Gửi cho Cún iu ngàn lời thương yêu ngọt ngào nhất hôm nay! ✨🌸",
    "Cún ngốc ơi, anh yêu em nhiều hơn bất cứ thứ gì! 💖",
    "Nhớ Cún da diết, chỉ mong thời gian trôi nhanh để gặp Cún! 🥺💕",
    "Cún ơi, hôm nay Cún là em bé rực rỡ nhất nhen! ☀️✨",
    "Yêu Cún nhiều như lá trên cây vậy đó Cún ơi! 🌳💖",
    "Cún iu ơi, anh sẽ luôn là điểm tựa vững chắc cho Cún! 🤗✨",
    "Chụt! Hôn khẽ lên bờ vai nhỏ của Cún nhen! 💋",
    "Cún ngốc ơi, anh thương em nhất trên đời này luôn! 💕",
    "Em bé Cún ơi, nhớ ăn nhiều để chóng lớn nhen! 🍚🧸",
    "Cún là ngọn nến ấm áp thắp sáng tâm hồn anh! 🕯️✨",
    "Hôm nay Cún nhớ mặc đồ ấm khi ra đường nhen! 🧥🍀",
    "Nhớ Cún kinh khủng luôn, muốn gọi điện nghe giọng Cún ghê! 📞💖",
    "Cún ơi, nụ cười của Cún là cả mùa xuân của anh đó! 🌸🥰",
    "Cún iu ơi, anh thương Cún bằng tất cả những gì anh có! 💕",
    "Em bé Cún ngoan ơi, hãy luôn tin tưởng vào tình yêu của anh nhen! 🧸💖",
    "Chụt! Hôn lên đôi tai nhỏ nhắn của Cún nè! 💋",
    "Cún ngốc xít ơi, em là công chúa nhỏ đáng yêu nhất của anh! 👑✨",
    "Cún có biết anh nhớ Cún đến mức ăn không ngon ngủ không yên không? 🥺💕",
    "Cún ơi, hôm nay nhớ giữ nụ cười trên môi suốt cả ngày nhen! 😊🌸",
    "Chỉ muốn ôm Cún thật lâu để cảm nhận hơi ấm từ Cún! 🤗💖",
    "Cún iu ơi, chúc Cún một ngày mới ngập tràn tiếng cười nhen! 🍀",
    "Gửi em bé Cún ngàn đóa hồng thơm ngát cùng tình yêu của anh! 🌹💕",
    "Cún ngốc ơi, anh thương Cún hơn cả bản thân mình luôn! 💖",
    "Nhớ Cún lắm, thèm cảm giác được véo má Cún ghê á! 🥰🧸",
    "Cún ơi, hôm nay Cún hãy là em bé vui vẻ nhất thế giới nhen! ✨🎈",
    "Yêu Cún nhiều đến nỗi viết thành sách cũng không hết! 📖💖",
    "Cún iu ơi, anh sẽ luôn bên cạnh lắng nghe mọi tâm sự của Cún! 🌸🤗",
    "Chụt! Hôn lên đôi bàn tay nhỏ bé của Cún ngoan nè! 💋",
    "Cún ngốc ơi, anh thương em đến trọn đời trọn kiếp luôn! 💕",
    "Em bé Cún ơi, nhớ giữ gìn sức khỏe thật tốt nhen! 🍀🧸",
    "Cún là thiên thần hộ mệnh mang may mắn đến cho anh! 👼✨",
    "Hôm nay Cún nhớ cười thật nhiều để tỏa nắng nhen! ☀️🌸",
    "Nhớ Cún vô hạn luôn, đếm từng ngày để được gặp Cún nè! 🥺💖",
    "Cún ơi, nụ cười em là niềm hạnh phúc lớn nhất đời anh! 🥰💖",
    "Cún iu ơi, anh thương Cún bằng cả vũ trụ bao la này luôn! 💕",
    "Em bé Cún ngoan ơi, anh yêu em nhiều hơn cả ngày mai! 🧸💖",
    "Chụt! Hôn nhẹ lên trán em bé Cún một cái thật sâu nè! 💋",
    "Cún ngốc xít ơi, em là duy nhất và mãi mãi của anh! 💖✨",
    "Cún có biết anh yêu Cún nhiều đến mức không từ nào tả xiết không? 🥺💕",
    "Cún ơi, hôm nay nhớ dành cho anh một chút yêu thương nhen! 🌸",
    "Chỉ muốn được tựa vào vai Cún và bình yên bên Cún mãi thôi! 🤗💖",
    "Cún iu ơi, chúc Cún một ngày ngập tràn ngọt ngào và tiếng cười! 🍀✨",
    "Gửi Cún yêu ngàn cái ôm ấm áp và nụ hôn nồng cháy nhất! 💋💖",
    "Cún ngốc ơi, anh nguyện yêu và thương Cún suốt cả cuộc đời này! 💕",
    "Nhớ Cún lắm, chỉ mong được nhìn thấy Cún cười mỗi ngày! 🥰🌸",
    "Cún ơi, em là tất cả những gì ngọt ngào nhất trong lòng anh! 💖✨",
    "Cún iu của anh ơi, nhớ điểm danh xong rồi nhắn tin liền nhen! 💕✨"
];

const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const getLoginUrl = () => isLocal ? '/fis0/api/login' : 'https://ddc.fis.vn/fis0/api/login';
const getCheckInUrl = (userId, typeCode, dateTimeStr) => {
    const base = isLocal ? '/apietms' : 'https://ddc.fis.vn/apietms';
    return `${base}/api/ChechInData/MobileAddCheckInOut?userId=${encodeURIComponent(userId)}&typeCheckInOut=${typeCode}&dateCheckInOut=${encodeURIComponent(dateTimeStr)}`;
};

export default function TMSScreen({ onBack }) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const kittyImg = `${baseUrl}kitty.png`;
    const kitty1Img = `${baseUrl}kitty_1.png`;
    const kitty2Img = `${baseUrl}kitty_2.png`;

    const [saveInfo, setSaveInfo] = useState(() => localStorage.getItem('tms_save_info') === 'true');
    const [username, setUsername] = useState(() => {
        const isSaved = localStorage.getItem('tms_save_info') === 'true';
        return isSaved ? (localStorage.getItem('tms_username') || '') : '';
    });
    const [password, setPassword] = useState(() => {
        const isSaved = localStorage.getItem('tms_save_info') === 'true';
        return isSaved ? (localStorage.getItem('tms_password') || '') : '';
    });
    
    const [activeUsername, setActiveUsername] = useState(() => {
        const hasToken = !!localStorage.getItem('tms_token');
        const hasEtmsId = !!localStorage.getItem('tms_etms_id');
        const hasActiveUser = !!localStorage.getItem('tms_active_username');
        return (hasToken && hasEtmsId && hasActiveUser) ? (localStorage.getItem('tms_active_username') || '') : '';
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const hasToken = !!localStorage.getItem('tms_token');
        const hasEtmsId = !!localStorage.getItem('tms_etms_id');
        const hasActiveUser = !!localStorage.getItem('tms_active_username');
        return hasToken && hasEtmsId && hasActiveUser;
    });
    const [token, setToken] = useState(() => {
        const hasToken = !!localStorage.getItem('tms_token');
        const hasEtmsId = !!localStorage.getItem('tms_etms_id');
        const hasActiveUser = !!localStorage.getItem('tms_active_username');
        return (hasToken && hasEtmsId && hasActiveUser) ? (localStorage.getItem('tms_token') || '') : '';
    });
    const [etmsID, setEtmsID] = useState(() => {
        const hasToken = !!localStorage.getItem('tms_token');
        const hasEtmsId = !!localStorage.getItem('tms_etms_id');
        const hasActiveUser = !!localStorage.getItem('tms_active_username');
        return (hasToken && hasEtmsId && hasActiveUser) ? (localStorage.getItem('tms_etms_id') || '') : '';
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [isKittySpinning, setIsKittySpinning] = useState(false);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    
    const [currentTime, setCurrentTime] = useState(new Date());
    const [compensatoryDate, setCompensatoryDate] = useState(() => {
        const today = new Date();
        const d = String(today.getDate()).padStart(2, '0');
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const y = today.getFullYear();
        return `${d}-${m}-${y}`;
    });

    const [toastMessage, setToastMessage] = useState('');
    const [randomGreet, setRandomGreet] = useState(() => {
        const randomIndex = Math.floor(Math.random() * CUN_MESSAGES.length);
        return CUN_MESSAGES[randomIndex];
    });
    const dateInputRef = useRef(null);

    const changeGreeting = () => {
        const randomIndex = Math.floor(Math.random() * CUN_MESSAGES.length);
        setRandomGreet(CUN_MESSAGES[randomIndex]);
    };

    const handleIslandClick = () => {
        if (isKittySpinning) return;
        setIsKittySpinning(true);
        setTimeout(() => setIsKittySpinning(false), 800);

        // Generate 5 cute floating emojis
        const newHearts = Array.from({ length: 5 }).map((_, i) => ({
            id: Date.now() + i,
            left: 20 + Math.random() * 60,
            delay: i * 0.1,
            scale: 0.6 + Math.random() * 0.6,
            emoji: ['💖', '💕', '✨', '🌸', '🐱', '🐾'][Math.floor(Math.random() * 6)]
        }));

        setHearts(prev => [...prev, ...newHearts]);

        // Clean up emojis
        setTimeout(() => {
            setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
        }, 1500);

        const cuteIslandToasts = [
            "Ngoaooo~ Cún iu chạm vào em nè! 🐱💕",
            "Chụt! Cún vừa chạm vào Island đúng hông? 💋✨",
            "Ui da! Cún gõ nhẹ đầu em bé kìa! 🐾🎀",
            "Yêu Cún Kitty nhất quả đất luôn á! 🌸💖",
            "Đảo mèo cưng của Cún xin chào! 🌟🧸"
        ];
        triggerToast(cuteIslandToasts[Math.floor(Math.random() * cuteIslandToasts.length)]);
    };


    useEffect(() => {
        const hasToken = !!localStorage.getItem('tms_token');
        const hasEtmsId = !!localStorage.getItem('tms_etms_id');
        const hasActiveUser = !!localStorage.getItem('tms_active_username');
        if (!hasToken || !hasEtmsId || !hasActiveUser) {
            localStorage.removeItem('tms_token');
            localStorage.removeItem('tms_etms_id');
            localStorage.removeItem('tms_active_username');
        }

        // Clear any old legacy credentials from browser localStorage if remember-me is off
        if (localStorage.getItem('tms_save_info') !== 'true') {
            localStorage.removeItem('tms_username');
            localStorage.removeItem('tms_password');
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const days = ['Chủ Nhật ☀️', 'Thứ Hai 🌸', 'Thứ Ba 🍀', 'Thứ Tư 🎀', 'Thứ Năm ✨', 'Thứ Sáu 🎉', 'Thứ Bảy 🎈'];
        const dayName = days[date.getDay()];
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${hours}:${minutes} ${dayName}, ${day}/${month}/${year}`;
    };

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            triggerToast('⚠️ Nhập tài khoản và mật khẩu nhen Cún! 🥺💕');
            return;
        }

        if (isLoggedIn) {
            setIsLoggedIn(false);
            setToken('');
            setEtmsID('');
            setActiveUsername('');
            localStorage.removeItem('tms_token');
            localStorage.removeItem('tms_etms_id');
            localStorage.removeItem('tms_active_username');
            triggerToast('👋 Hẹn gặp lại Cún iu nhen! 💖');
            if (!saveInfo) {
                setUsername('');
                setPassword('');
            }
        } else {
            setIsLoading(true);
            try {
                const response = await fetch(getLoginUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password: password.trim(),
                        buildNumber: "10953",
                        version: "1.132",
                        deviceIP: "10.15.177.77",
                        deviceModel: "iPhone 17",
                        osVersion: "26.5"
                    }),
                    referrerPolicy: "no-referrer"
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.resultCode === 1) {
                    const resToken = data.token || data.data?.token || '';
                    const resEtmsID = data.data?.etmsId || data.data?.etmsID || data.etmsId || data.etmsID || data.data?.userId || data.userId || '';
                    
                    setToken(resToken);
                    setEtmsID(resEtmsID);
                    localStorage.setItem('tms_token', resToken);
                    localStorage.setItem('tms_etms_id', resEtmsID);

                    const decoded = decodeJwt(resToken);
                    const resUsername = decoded?.username || data.data?.username || data.username || username.trim().split('@')[0];
                    setActiveUsername(resUsername);
                    localStorage.setItem('tms_active_username', resUsername);

                    setIsLoggedIn(true);
                    triggerToast('🔓 Đăng nhập thành công gùi nè! 🌸✨');

                    if (saveInfo) {
                        localStorage.setItem('tms_username', username);
                        localStorage.setItem('tms_password', password);
                        localStorage.setItem('tms_save_info', 'true');
                    } else {
                        localStorage.removeItem('tms_username');
                        localStorage.removeItem('tms_password');
                        localStorage.setItem('tms_save_info', 'false');
                    }
                } else {
                    const errorMsg = data?.message || 'Đăng nhập thất bại rồi Cún ơi! 🥺';
                    triggerToast(`❌ ${errorMsg}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                triggerToast('⚠️ Lỗi kết nối mạng hoặc CORS rồi Cún ơi! 🥺💕');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setSaveInfo(checked);
        localStorage.setItem('tms_save_info', String(checked));
        if (!checked) {
            localStorage.removeItem('tms_username');
            localStorage.removeItem('tms_password');
        } else {
            localStorage.setItem('tms_username', username);
            localStorage.setItem('tms_password', password);
        }
    };

    const generateRandomCheckInTime = (dateObj) => {
        const minute = Math.floor(Math.random() * 21); // 0 to 20
        const second = Math.floor(Math.random() * 60); // 0 to 59
        
        const hh = "08";
        const mm = String(minute).padStart(2, '0');
        const ss = String(second).padStart(2, '0');
        
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        
        return `${dd}-${MM}-${yyyy} ${hh}:${mm}:${ss}`;
    };

    const generateRandomCheckOutTime = (dateObj) => {
        const minute = Math.floor(Math.random() * 31); // 0 to 30
        const second = Math.floor(Math.random() * 60); // 0 to 59
        
        const hh = "18";
        const mm = String(minute).padStart(2, '0');
        const ss = String(second).padStart(2, '0');
        
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        
        return `${dd}-${MM}-${yyyy} ${hh}:${mm}:${ss}`;
    };

    const handleCheckIn = async (checkType) => {
        if (!isLoggedIn) {
            triggerToast('⚠️ Cún nhớ đăng nhập trước nhen! 🥺💕');
            return;
        }

        const typeCode = checkType === 'Check-in' ? 1 : 2;
        const dateObj = new Date();
        const dateTimeStr = typeCode === 1 
            ? generateRandomCheckInTime(dateObj) 
            : generateRandomCheckOutTime(dateObj);

        setIsLoading(true);
        try {
            const url = getCheckInUrl(etmsID, typeCode, dateTimeStr);
            
            const activeUser = activeUsername || username.trim().split('@')[0];

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic c3NkX2FwaTpzc2RAMjAxNw==',
                    'username': activeUser,
                    'token': token
                },
                referrerPolicy: "no-referrer"
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data && (data.resultCode == 1 || data.success === true || data.status == 1)) {
                const txId = data.data ? ` (Mã: ${data.data})` : '';
                triggerToast(`🐱 ${checkType} thành công${txId} lúc ${dateTimeStr.split(' ')[1]} gùi! 🥰🎀`);
            } else {
                const errorMsg = data?.message || `${checkType} thất bại rồi Cún ơi! 🥺`;
                triggerToast(`❌ ${errorMsg}`);
            }
        } catch (error) {
            console.error('Check-in/out error:', error);
            triggerToast('⚠️ Lỗi kết nối check-in/out rồi Cún ơi! 🥺💕');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompensatoryCheckIn = async (type) => {
        if (!isLoggedIn) {
            triggerToast('⚠️ Cún nhớ đăng nhập trước nhen! 🥺💕');
            return;
        }

        const typeCode = type === 'Check-in bù' ? 1 : 2;
        
        // Parse the compensatoryDate (format: DD-MM-YYYY)
        const dateParts = compensatoryDate.split('-');
        if (dateParts.length !== 3) {
            triggerToast('⚠️ Ngày bù không hợp lệ! 🥺');
            return;
        }
        
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        const dateObj = new Date(year, month, day);

        const dateTimeStr = typeCode === 1 
            ? generateRandomCheckInTime(dateObj) 
            : generateRandomCheckOutTime(dateObj);

        setIsLoading(true);
        try {
            const url = getCheckInUrl(etmsID, typeCode, dateTimeStr);
            
            const activeUser = activeUsername || username.trim().split('@')[0];

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic c3NkX2FwaTpzc2RAMjAxNw==',
                    'username': activeUser,
                    'token': token
                },
                referrerPolicy: "no-referrer"
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data && (data.resultCode == 1 || data.success === true || data.status == 1)) {
                const txId = data.data ? ` (Mã: ${data.data})` : '';
                triggerToast(`🐱 ${type} thành công${txId} lúc ${dateTimeStr} gùi! 🥰🎀`);
            } else {
                const errorMsg = data?.message || `${type} thất bại rồi Cún ơi! 🥺`;
                triggerToast(`❌ ${errorMsg}`);
            }
        } catch (error) {
            console.error('Compensatory Check-in/out error:', error);
            triggerToast(`⚠️ Lỗi kết nối ${type.toLowerCase()} rồi Cún ơi! 🥺💕`);
        } finally {
            setIsLoading(false);
        }
    };

    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        let startDayOfWeek = firstDayOfMonth.getDay(); 
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
        
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevMonthTotalDays = new Date(year, month, 0).getDate();
        
        const days = [];
        
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthTotalDays - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthTotalDays - i)
            });
        }
        
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }
        
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }
        
        return days;
    };

    const handleDaySelect = (dayObj) => {
        const d = String(dayObj.date.getDate()).padStart(2, '0');
        const m = String(dayObj.date.getMonth() + 1).padStart(2, '0');
        const y = dayObj.date.getFullYear();
        setCompensatoryDate(`${d}-${m}-${y}`);
        setShowCalendarPopup(false);
        triggerToast(`📅 Đã chọn ngày bù: ${d}/${m}/${y} nhen! 💕`);
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    return (
        <div className="tms-screen-wrapper">
            {toastMessage && <div className="tms-toast">{toastMessage}</div>}
            
            {/* Back Button Outside the phone simulator */}
            <button className="tms-back-btn" onClick={onBack}>
                <img src={kittyImg} alt="kitty-mini" className="back-kitty-btn-icon" /> Quay lại Menu nhen 🏠💕
            </button>

            {/* Smartphone Simulator Container */}
            <div className="phone-container">
                {/* Ears sticking out from the top of the pink phone case */}
                <div className="kitty-ear left"></div>
                <div className="kitty-ear right"></div>
                <div className="kitty-bow">
                    <svg viewBox="0 0 100 60" width="34" height="20" fill="#ff4d6d">
                        {/* Left Loop */}
                        <path d="M 50 30 C 20 0, 10 20, 20 30 C 30 40, 20 60, 50 30 Z" />
                        {/* Right Loop */}
                        <path d="M 50 30 C 80 0, 90 20, 80 30 C 70 40, 80 60, 50 30 Z" />
                        {/* Left Ribbon Tail */}
                        <path d="M 45 32 C 35 45, 30 55, 35 58 C 40 60, 48 45, 45 32 Z" />
                        {/* Right Ribbon Tail */}
                        <path d="M 55 32 C 65 45, 70 55, 65 58 C 60 60, 52 45, 55 32 Z" />
                        {/* Center Knot */}
                        <circle cx="50" cy="30" r="8" fill="#ff758f" stroke="#ff4d6d" strokeWidth="2" />
                    </svg>
                </div>

                {/* Smartphone Simulator Body */}
                <div className="phone-simulator">
                    <div className="phone-inner-screen">
                        {/* iPhone 17 Pro Max Dynamic Island (Floating) */}
                    <div className="dynamic-island" onClick={handleIslandClick}>
                        <div className="dynamic-island-content">
                            <div className="island-dot"></div>
                            <div className="island-kitty-wrapper">
                                <img 
                                    src={kitty1Img} 
                                    alt="island-kitty" 
                                    className={`island-kitty-img ${isKittySpinning ? 'spin-active' : ''}`} 
                                />
                            </div>
                            <span className="island-text">Cún Kitty 🎀</span>
                        </div>
                        {/* Floating elements */}
                        {hearts.map(heart => (
                            <span 
                                key={heart.id} 
                                className="island-floating-heart" 
                                style={{ 
                                    left: `${heart.left}%`, 
                                    animationDelay: `${heart.delay}s`,
                                    transform: `scale(${heart.scale})`
                                }}
                            >
                                {heart.emoji}
                            </span>
                        ))}
                    </div>

                    {/* Phone Status Bar */}
                    <div className="phone-status-bar">
                        <span className="phone-status-time">
                            {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}
                        </span>
                        <div className="phone-status-icons">
                            <img src={kittyImg} alt="status-kitty" className="status-kitty-icon" />
                            <span className="icon-signal">📶</span>
                            <span className="icon-battery">🔋</span>
                        </div>
                    </div>

                    {/* Phone Screen Content */}
                    <div className="phone-screen-content">
                        {/* Header with Peeking Kitty */}
                        <div className="tms-header">
                            <div className="tms-header-top">
                                <h2 className="tms-greet" onClick={changeGreeting} style={{ cursor: 'pointer' }}>{randomGreet}</h2>
                            </div>
                            <div className="tms-datetime">{formatDateTime(currentTime)}</div>
                        </div>

                        {/* Form Fields */}
                        <div className="tms-form">
                            {/* Account Field */}
                            <div className="tms-input-container">
                                <input
                                    type="text"
                                    className="tms-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tài khoản của Cún iu 🎀"
                                    disabled={isLoggedIn || isLoading}
                                />
                            </div>

                            {/* Password Field */}
                            <div className="tms-input-container password-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="tms-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mật khẩu của Cún nhen 🔑"
                                    disabled={isLoggedIn || isLoading}
                                />
                                <button 
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                    disabled={isLoading}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>

                            {/* Save Credentials Checkbox */}
                            <label className="tms-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={saveInfo}
                                    onChange={handleCheckboxChange}
                                    className="tms-checkbox"
                                    disabled={isLoading}
                                />
                                <span className="custom-checkbox"></span>
                                Nhớ Cún nhen 💕
                            </label>

                            {/* Info Note */}
                            <div className="tms-note">
                                {isLoading ? (
                                    '⏳ Đang đăng nhập nhen Cún...'
                                ) : isLoggedIn ? (
                                    <div className="logged-in-info">
                                        <div>🎉 Đã đăng nhập nhen Cún! 🥰💖</div>
                                        <div className="user-details-badge">
                                            <span>👤 {activeUsername}</span>
                                            <span>🆔 {etmsID}</span>
                                        </div>
                                    </div>
                                ) : (
                                    'Đăng nhập trước khi check-in nhen! 💕'
                                )}
                            </div>

                            {/* Login/Logout Button */}
                            <button 
                                className={`tms-btn btn-login ${isLoggedIn ? 'logged-in' : ''} ${isLoading ? 'loading' : ''}`} 
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>⏳ Đang đăng nhập...</>
                                ) : (
                                    isLoggedIn ? 'Đăng xuất 👋' : 'Đăng nhập 💕'
                                )}
                            </button>

                            {/* Standard Check-in/out */}
                            <button 
                                className={`tms-btn btn-action ${isLoggedIn && !isLoading ? 'active' : 'disabled'}`}
                                onClick={() => handleCheckIn('Check-in')}
                                disabled={!isLoggedIn || isLoading}
                            >
                                Check in 🌸
                            </button>

                            <button 
                                className={`tms-btn btn-action ${isLoggedIn && !isLoading ? 'active' : 'disabled'}`}
                                onClick={() => handleCheckIn('Check-out')}
                                disabled={!isLoggedIn || isLoading}
                            >
                                Check out 🎀
                            </button>

                            <div className="tms-divider"></div>

                            {/* Beautiful Date Selector Card */}
                            <div 
                                className={`tms-date-picker-card ${isLoggedIn && !isLoading ? 'active' : 'disabled'}`}
                                onClick={() => {
                                    if (isLoggedIn && !isLoading) {
                                        const [d, m, y] = compensatoryDate.split('-');
                                        setViewDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                                        setShowCalendarPopup(true);
                                    }
                                }}
                            >
                                <div className="date-card-icon">📅</div>
                                <div className="date-card-details">
                                    <span className="date-card-title">Ngày Bù Check-in</span>
                                    <span className="date-card-value">{compensatoryDate}</span>
                                </div>
                                <div className="date-card-arrow">✨</div>
                            </div>

                            <button 
                                className={`tms-btn btn-action ${isLoggedIn && !isLoading ? 'active' : 'disabled'}`}
                                onClick={() => handleCompensatoryCheckIn('Check-in bù')}
                                disabled={!isLoggedIn || isLoading}
                            >
                                Check in bù 🌸
                            </button>

                            <button 
                                className={`tms-btn btn-action ${isLoggedIn && !isLoading ? 'active' : 'disabled'}`}
                                onClick={() => handleCompensatoryCheckIn('Check-out bù')}
                                disabled={!isLoggedIn || isLoading}
                            >
                                Check out bù 🎀
                            </button>
                        </div>
                    </div>

                    {/* Custom Calendar Modal Dialog */}
                    {showCalendarPopup && (
                        <div className="tms-calendar-modal-overlay">
                            <div className="tms-calendar-modal">
                                <div className="calendar-modal-header">
                                    <button onClick={handlePrevMonth} className="calendar-nav-btn">◀</button>
                                    <span className="calendar-month-year">
                                        Tháng {viewDate.getMonth() + 1} - {viewDate.getFullYear()}
                                    </span>
                                    <button onClick={handleNextMonth} className="calendar-nav-btn">▶</button>
                                </div>
                                
                                <div className="calendar-weekdays">
                                    <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                                </div>
                                
                                <div className="calendar-days-grid">
                                    {generateCalendarDays().map((dayObj, index) => {
                                        const isSelected = 
                                            dayObj.date.getDate() === parseInt(compensatoryDate.split('-')[0]) &&
                                            dayObj.date.getMonth() === parseInt(compensatoryDate.split('-')[1]) - 1 &&
                                            dayObj.date.getFullYear() === parseInt(compensatoryDate.split('-')[2]);
                                            
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleDaySelect(dayObj)}
                                                className={`calendar-day-btn ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${isSelected ? 'selected' : ''}`}
                                            >
                                                {dayObj.day}
                                                {isSelected && <span className="day-selected-heart">💕</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button className="calendar-close-modal-btn" onClick={() => setShowCalendarPopup(false)}>
                                    Đóng lại nhen 🌸
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Phone Home Button/Indicator */}
                    <div className="phone-home-indicator"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
