// actorData.js - ไฟล์จัดการข้อมูลนักแสดงแยกต่างหาก

// ========== ข้อมูลนักแสดงพร้อมรูปภาพ ==========
const actorsDatabase = [
  {
    vod_id: "84664 , 85239, 68250, 63247, 59132, , 89908",
    actors: ["藤井兰兰"],
    title: "藤井兰兰完全无视..."
  },
  {
    vod_id: "84663, 65896",
    actors: ["折原由佳里"],
    title: "喝下春藥感度100倍..."
  },
  {
    vod_id: "84662, 73036, 73019, 72355, 66138, 66134, 56431",
    actors: ["沙月惠奈"],
    title: "可爱美丽的沙月惠奈..."
  },
  {
    vod_id: "84661, 59738, 59737, 88222, 88034, 91141, 94347, 98313, 99207, 98408, 94645, 92490, 91141, 88226, 87180, 86741, 84661, 82403, 82127, 64526, 51924",
    actors: ["白峰美羽"],
    title: "當我查看妻子的智慧型手機..."
  },
  {
    vod_id: "84659, 74599, 60439, 57116, 42512",
    actors: ["都月泪纱"],
    title: "每深入一公分就更接近高潮..."
  },
  {
    vod_id: "93913, 88216, 84658, 75784, 67500, 78898",
    actors: ["藤浦惠"],
    title: "裸體模特NTR令人震驚的妻子..."
  },
  {
    vod_id: "78737, 78569, 78548, 78547, 77573, 58857, 58218, 57463, 38280, 38262, 38260, 38255, 38221, 38217, 38214, 32054, 82523, 78569, 78550",
    actors: ["仓多茉绪"],
    title: "母子偷偷躲在桌子底下的亂倫遊戲"
  },
  {
    vod_id: "83651, 82433, 79541, 79152, 77141, 77135, 77127, 32181, 32058, 911323, 90424, 83260, 82844, 82434, 81462, 79156",
    actors: ["水卜樱"],
    title: "無限抽插潮吹絶叫高潮 水卜櫻"
  },
  {
    vod_id: "92296, 92298, 91991, 92007, 89474, 89471, 88824, 88301, 85375,  86517, 71479, 71470, 71469, 71464, 71463, 71465, 71457, 71454, 71451, 71449, 71330, 71324, 71320, 71317, 71295, 71293, 71291, 71287, 71278,  84743, 71510, 71274, 71497,  71741, 71739, 71737, 71726, 71720, 71717, 71713, 71712, 71702, 71700, 71645,  71752, 71751, 71747, 71746, 71745, 71743, 82425, 82192, 80860, 80870, 80839, 80845, 80833, 71763, 71762, 71755,  83014, 82491, 82480,  86702,  88223, 87596, 87422,  88305, , 83245, 84124, 84117, 82406, 82147, 83214, 84125, 82135, 79177, 49401, 75831, 77133, 77131, 51921, 61024, 59475, 59364, 46258, 91698, 32129, 83001, 80695, 32141, 32095, 91330, 90704, 90705, 91139, 90207, 89886, 89705, 89481, 91321, 91159, 90706, 90443, 90420, 90416, 90209, 91142, 100321, 97072, 93476, ",
    actors: ["七泽美爱"],
    title: "「老闆，吃完晚飯，晚上十一點..."
  },
  {
    vod_id: "83244, 82505, 84764, 81478, 71463, 60197, 89894, 89672, 96975, 93159, 83035, 57569",
    actors: ["宫下玲奈"],
    title: "清纯美少女子宫下媚药..."
  },
  {
    vod_id: "83243, 52433, 97628",
    actors: ["三田真铃"],
    title: "超情人男士美容院..."
  },
  {
    vod_id: "83242, 82438, 59168, 98221, 84762, 83804, 83242, 82188, 79376, 94744, ",
    actors: ["梓光"],
    title: "萬聖節之夜 梓光繼續被..."
  },
  {
    vod_id: "83240, 81868, 84944, 64827, 57783, 89075, ",
    actors: ["凪光"],
    title: "K罩杯秘書被鼻涕蟲總裁..."
  },
  {
    vod_id: "83239, 83966, 67467, 87610, 83054, 82833, 51081, 83966",
    actors: ["响莲"],
    title: "錯過末班車到後輩家住..."
  },
  {
    vod_id: "92994, 82998, 73869, 78681, 78010, 77992, 77496, 76224, 75098, 49121, 33985, 83238, 41692, 41695, 41645, 41301, 41226, 41225, 41227, 41219, 41221, 41180, 41095, 41037, 40139",
    actors: ["桥本有菜"],
    title: "超大胸部巨乳女优的疯狂性爱体验"
  },
  {
    vod_id: "88350, 88018, 79150, 77161, 77158, 77157, 77156, 77155, 77154, 77153, 77150, 77149, 77147, 77145, 77146, 75837, 75833, 75832 ",
    actors: ["三崎娜娜"],
    title: "未知标题"
  },
  {
    vod_id: "103716, 99109, 59580, 91357, 91352, 91329, 91172, 911732, 90931, 90882, 90712, 90709, 90685, 90418, 90411, 90205, 90210, 90193, 90185, 89513, 89502",
    actors: ["枫富爱"],
    title: "未定"
  },
  {
    vod_id: "91338, 91306, 91134, 90996, 90929, 90908, 90901, 90718, 90725, 90729, 90684, 90688, 90435, 90417, 90412, 90194, 90196",
    actors: ["田中柠檬"],
    title: "大胸部新人演员处女作"
  },
  {
    vod_id: "90415, 89878, 89477, 88227, 88035, 87607, 84124, 82790, 67478, 67476, 82833",
    actors: ["宫本留衣"],
    title: "看起来朴素却性爱成瘾的专科学生 宫本留衣 巨大的爆乳很惊人"
  },
  {
    vod_id: "91357, 91352, 91329, 91172, 91153, 90931, 90882, 90712, 90709, 90685, 90418, 90411, 90205, 90210, 90193, 90185, 89513, 89502, 79474, 82417",
    actors: ["樱空桃"],
    title: "超大胸部巨乳女优的户外性爱狂欢"
  },
  {
    vod_id: "91345, 91095, 90933, 90939, 90942, 90893, 90697, 90421, 89685, 89640, 88818, 88346, 88041, 87840, 87804, 86703, 86717, 85944, 87458, 91345, 96012, 96598, 101382",
    actors: ["水川堇"],
    title: "超大胸部巨乳女优的捆绑性爱体验"
  },
  {
    vod_id: "91350, 91321, 91137, 91077, 90726, 90445, 90398, 90403",
    actors: ["神木丽"],
    title: "储存太多对身体有害。蜘蛛骑乘位乳头责备痴女护士"
  },
  {
    vod_id: "90189, 90195, 89914",
    actors: ["相泽南"],
    title: "4K超清10连发性爱挑战"
  },
  {
    vod_id: "78689, 82172, 101313, 93056, 83944, 78345, 78020, 77995, 77991, 76226, 75103, 59369, 33971",
    actors: ["星宫一花"],
    title: "超大胸部巨乳女优的特殊性爱服务"
  },
  {
    vod_id: "92487, 91159, 88229, 88013, 83015, 82165, 62653, 62647, 62647, 60913, 58193, 57104, 57105, 57003, 57010, 55152, 53550, 53555, 53432, 36567",
    actors: ["河北彩花"],
    title: "交织的体液，浓密性爱 完全无剪辑特别版"
  },
  {
    vod_id: "88238, 83636, 82867, 73737, 73574, 62129, 62126, 62125, 56532, 53525, 51075, 48886, 78349, 77994, 77970, 77363, 75102, 71306, 63809, 62016, 55398, 51220, 34001",
    actors: ["三上悠亚"],
    title: "人妻X放題 無限制訂閱"
  },
  {
    vod_id: "91316, 91156, 91133, 90696, 90687, 90446, 90409, 90413, 90206, 90182, 89887, 89706, 89684, 88836, 88844, 88213, 88032, 87844",
    actors: ["佐佐木咲希"],
    title: "偶像美少女的可爱小嘴被浓密精液11次袭击"
  },
  {
    vod_id: "90714, 88820, 88544, 87631, 87408, 78985, 78957, 78952, 78938, 78895, 78877, 78095, 78092, 78090, 78087, 78086, 78085, 78084",
    actors: ["鈴村亜里"],
    title: "意想不到的新作发行!? 鈴村亜里的魅力浓缩130分钟"
  },
  {
    vod_id: "73978, 54567, 54115, 54130, 53777, 53664, 51460, 90447, 89246, 88307, 85589, 82828, 42668, 42665, 42575, 42559, 42513, 42464, 42472, 42432, 42427",
    actors: ["高桥圣子"],
    title: "20周年 从周一开始的中出"
  },
  {
    vod_id: "90707, 77704, 77699, 77700, 91680, 91353, 78309, 76912, 76895, 76887, 62016, 60326, 60325, 60323, 60322, 60321, 60320, 60206, 60205, 60204, 60203, 60202, 60201, 60200, 60199, 60198",
    actors: ["相沢みなみ"],
    title: "护士和不知不觉中感极"
  },
  {
    vod_id: "91817, 91152, 91087, 91088, 90896, 90448, 90422, 90211, 89680, 89491, 87845, 78681, 78010, 77992, 77496, 76224, 75098, 49121, 33985",
    actors: ["橋本ありな"],
    title: "温泉旅馆外宿对抗赛"
  },
  {
    vod_id: "90731, 84111",
    actors: ["莉莉·哈特"],
    title: "与丈夫做爱后总是被继父持续中出"
  },
  {
    vod_id: "75582, 49315, 49171, 49172, 49176, 49181, 49098, 48258, 48262, 48271, 48280, 48255, 48251, 48249, 48226, 48259, 48260, 48266",
    actors: ["森菜菜子"],
    title: "比丈夫更爱公公……"
  },
  {
    vod_id: "92521, 92326, 92295, 92010, 91741, 91317, 90928, 99396, 97837, 96033, 90423, 89255, 88543, 85601, 82806, 80659, 73928, 73925, 93690, 78694, 63807, 59363, 56669",
    actors: ["青空光"],
    title: "口交大好き青空光的私密肉棒宅急便"
  },
  {
    vod_id: "97261, 97834, 97166",
    actors: ["唯井真昼"],
    title: "体液交织喷潮不止 极上5角凌辱"
  },
  {
    vod_id: "97265, 97257",
    actors: ["天音栞菜"],
    title: "与苗条美少女彻夜乱交SEX"
  },
  {
    vod_id: "96035",
    actors: ["彩月七緒"],
    title: "爆乳人妻被强行放置三天NTR"
  },
  {
    vod_id: "88040, 87426, 96038, 91140, 85568, 84947, 83405, 56771, 56788, 44395, 99211, 90922, 82443, 62739",
    actors: ["神木麗"],
    title: "圣诞奇跡！大奶打工妹超市爆走"
  },
  {
    vod_id: "90202, 76042, 75998, 76042, 75998",
    actors: ["绫濑麻衣子"],
    title: "SOD女子社員 社内中出し逆NTR"
  },
  {
    vod_id: "75991",
    actors: ["岛崎真子"],
    title: "SOD女子社員 摄影师潜入公司拍摄SEX！"
  },
  {
    vod_id: "79209, 76361, 34065",
    actors: ["春风光"],
    title: "男潮吹骑乘位逆强○ 完全女子主導龟头责め腰动活塞！"
  },
  {
    vod_id: "90689, 90405, 79100, 76853, 79099, 76844, 91162, 90689, 87809, 82485, 76944, 75052, 72881, 72802, 72343, 72344",
    actors: ["渚光希"],
    title: "性欲旺盛NTR 第一次被他人巨根干到高潮的妻子"
  },
  {
    vod_id: "76845, 79187, 78909, 78283, 78273, 77945, 77694, 77681, 77663, 77583, 77575, 77573, 77515, 77371, 77241, 77128, 76807, 76608, 76598, 76429, 75375, 75176, 31178, 31097, 30267",
    actors: ["凛音桃花"],
    title: "用乳首高潮诱惑中出 痴女大姐姐"
  },
  {
    vod_id: "100525, 100527, 98816, 98817, 97066, 97067, 96968, 92517, 93272, 93271",
    actors: ["小栗萌"],
    title: "競泳水着孕ませ輪姦NTR"
  },
  {
    vod_id: "100323, 100324, 98816, 97167, 97065, 97068, 96976, 93269, 93272, 93271, 100216, 98812, 64327, 64123, 82865, 81698, 54577",
    actors: ["北岡果林"],
    title: "Night 绝顶失神媚药派对中出性交"
  },
  {
    vod_id: "31150",
    actors: ["美園和花"],
    title: "巨乳淫语瑜伽教练 超贴身诱惑中出课程"
  },
  {
    vod_id: "97437, 83955, 31152",
    actors: ["渚光希"],
    title: "禁断介護 真心看护老人肉体"
  },
  {
    vod_id: "95731, 90010, 83946, 31036",
    actors: ["白川美波"],
    title: "母子姦 暴走母子沉溺于疯狂中出近亲相姦"
  },
  {
    vod_id: "98218, 94342, 94344, 94217, ",
    actors: ["青葉はる"],
    title: "我是最低的教师 放学后与制服的君做爱直到天亮"
  },
  {
    vod_id: "98220, 97259, 94341, 94223, 92500, 90690, 90177, 89676",
    actors: ["日向由奈"],
    title: "抜かずの連撃中出し43発で孕ませた女子校生"
  },
  {
    vod_id: "93030, 92499, 91693, 90001",
    actors: ["伊藤舞雪"],
    title: "便利店妻子与打工短时不伦 后台30分快速中出"
  },
  {
    vod_id: "103495, 96881",
    actors: ["西野絵美"],
    title: "ずぶ濡れS級美少女のねっとり乳首責め！"
  },
  {
    vod_id: "103475, 99401, 99208, 96872, 96880, 96751, 96756, 96757, 96759",
    actors: ["黑崎玲衣"],
    title: "先生的エグい口交更厉害哦？ 追击口交＆PtoM中出SEX"
  },
  {
    vod_id: "103468, 91822, 91712, 91325, 89476, 87618, 87210, 87183, 84933, 82832, 82843, 92327, 90404, 90925, 90716, 87604",
    actors: ["筱田优"],
    title: "夜店纤细虾反绝顶【人格崩坏】"
  },
  {
    vod_id: "91825, 91335, 90935, 90927, 89711, 86689",
    actors: ["明里紬"],
    title: "药物性爱人妻搜查官 被囚禁丈夫面前…媚药浸泡药物性爱废人STORY"
  },
  {
    vod_id: "90406, 90208, 90184, 90003, 89262, 88017, 88295",
    actors: ["下部加奈"],
    title: "夜勤パート妻 夜幕的掩护下巨乳人妻沉醉出轨偷插"
  },
  {
    vod_id: "88360, 88026, 87435",
    actors: ["东凛"],
    title: "明明死也不想理的继父…却因为酒精理性崩飞的我…"
  },
  {
    vod_id: "79132, 78893, 78542, 78537, 78281, 78270, 77698, 77686, 77683, 77551, 77532, 77521, 77516, 76921, 76843, 76829, 76812, 76631, 75787, 75203, 75190, 79398, 79347, 79334, 65791, 65790, 65788, 65708, 65707, 65698, 49330, 92503, 58750, 38142, 38136, 38137, 38059, 38057, 38058, 38055, 32987, 31027, 30255",
    actors: ["深田咏美"],
    title: "痴女逆推天后・深田咏美 精液榨干全纪录"
  },
  {
    vod_id: "78930, 75208, 75193, 75191, 75190",
    actors: ["素人女优"],
    title: "脑イキするまで何度でもイカせまくるドM女"
  },
  {
    vod_id: "98025, 98023, 94349, 94221, 90728, 88356, 88039, 87814, 73340, 81701, 73322, 73333, 73320, 73321, 73315, 73312, 73305, 73304, 73303, 73301, 72356, 72335, 72299, 65872",
    actors: ["相部屋馬拉"],
    title: "相部屋馬拉 好色女上司 設計同房連續內射10發"
  },
  {
    vod_id: "73296, 73302, 73295, ",
    actors: ["瀬田一花"],
    title: "義姉ズボラちんを世話する代わりに…即ズボ中出しOKの下品ムチ肉ま●こ貸してもらってます。"
  },
  {
    vod_id: "69641, 69646, 69652, 69662, 69767, ",
    actors: ["櫻茉日"],
    title: "義父に巨乳を搾られ続けた7日間 汗だくでマゾ狂いに堕ちたサマーハズ記録"
  },
  {
    vod_id: "94446, 89249, 83662, 59129, 56673",
    actors: ["夏目響"],
    title: "命名夏目響（ひびき）正式デビューお初の4本番"
  },
  {
    vod_id: "88845, 87623, 87411, 75219",
    actors: ["並木愛菜"],
    title: "我，和部下在公司里谈恋爱，有什么问题？ 在公司偷偷享受Hcup身体"
  },
  {
    vod_id: "94122, 58645, 83236, 82521, 83961, 84120, 84476, 87818, 91324, 95239, 95934, 67249, 67256, 67242, 67234",
    actors: ["橘瑪莉"],
    title: "打工處的人妻與不倫性交燃燒起來的日子"
  },
  {
    vod_id: "67148, 67130, 67121, 67095, 67091, 91085, 60444, 58540",
    actors: ["末広純"],
    title: "バイト先の人妻と不倫性交に燃え上がった日々"
  },
  {
    vod_id: "49417, 56558, 38494, 38491, 38497, 38487, 38485, 38429, 38443, 38357, 38347",
    actors: ["宮村菜菜子"],
    title: "女僕裝可愛侍奉 3P中出榨精"
  },
  {
    vod_id: "98811, 95532, 94647, 78947, 78131, 78127, 78125, ",
    actors: ["有馬瑞希"],
    title: "受虐調教孕ませ性交…恥辱的家庭訪問"
  },
  {
    vod_id: "98810, 90920, 83214, 78131, 78127, 76580, 76579, 76577, 76576, 76574, 76569",
    actors: ["虹村夢"],
    title: "令嬢調教 監禁30日懷孕中出毒的受虐女…「種付」"
  },
  {
    vod_id: "60917, 58648, 52282, 42497, 80472",
    actors: ["星乃夏月"],
    title: "美乳、特濃。「一直在高潮…一直在啊…」淫亂絶頂生徒會長 濃厚パイズリ409連發"
  },
  {
    vod_id: "76524",
    actors: ["仲村奈々美"],
    title: "尻貴族sports edition 滑雪隊長×仲村奈々美 尻愛的ハメ潮2連発！！"
  },
  {
    vod_id: "68505, 71979",
    actors: ["星名千聖"],
    title: "女王様本格調教 4 真實女王SM調教全紀錄"
  },
  {
    vod_id: "99492, 99493, 90429, 86243, 77227, 77218, 77225, 75866, 32081, ",
    actors: ["西元美沙"],
    title: "逆NTR相房＆公司裡對上司的我最喜歡的美人部下…"
  },
  {
    vod_id: "81265, 79188, 79127, 78946, 78910, 78903, 78899, 78878, 78754, 77147, 76823, 75810, 75366, 75168, 75085, 32132, 32029, 31147",
    actors: ["奏音花音"],
    title: "中出到壞掉的一天 棒球部顧問與相房被徹底NTR"
  }
];

// ========== ข้อมูลโปรไฟล์นักแสดง (รูปภาพ และรายละเอียด) ==========
// ใช้ Map เพื่อจัดเก็บข้อมูล profile แบบไม่ซ้ำ โดยใช้ primary name เป็น key
const actorProfiles = new Map([
  ["藤井兰兰", {
    primaryName: "藤井兰兰",
    alternativeNames: ["藤井兰兰", "蜜美杏"],
    profileImage: "https://jav.wine/wp-content/uploads/2024/month-08/FSDSS-867-jav.wine_.jpg",
    backgroundImage: "https://pics.dmm.co.jp/digital/video/1fns00039/1fns00039pl.jpg",
    age: "24",
    height: "170 cm",
    weight: "48 kg",
    nationality: "日本",
    other: "AV",
    bio: "藤井兰兰（原名：蜜美杏），2000年11月15日出生于日本，是一位备受关注的成人影片女演员。她于2020年4月25日在Prestige和Eightman Production旗下以蜜美杏的名义出道，凭借170厘米的出色身高、48公斤的纤细身材以及B86(F)-W58-H89的完美比例迅速走红。她以性感优雅的外貌和多样的表演风格吸引了大量粉丝。2022年7月，她更名为藤井兰兰并转投新经纪公司，短暂休息后于2023年4月强势回归，继续在成人娱乐行业中活跃。藤井兰兰の作品以高质量和高人气著称，她的职业生涯展现了出色的适应能力和持久的吸引力，对日本成人影片界产生了深远影响",
    galleryImages: [
      "https://artjav.com/wp-content/uploads/fns-004-d131.jpg",
      "https://cdn.faleno.net/top/wp-content/uploads/2025/06/FNS-039_2125.jpg?resize=470:*&output-quality=60",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-p4UydEWOxfook8JvLyRgfbjW-UsDHYbKgCI6Di9DuET-AqeFa0fxLTue&s=10",
      "https://jav.wine/wp-content/uploads/2025/month-02/FSDSS-975.jpg",
      "https://jav.wine/wp-content/uploads/2025/month-01/FSDSS-967.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-12/FSDSS-946.jpg",
      "https://jav.wine/wp-content/uploads/2025/month-05/FNS-024.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-10/FSDSS-893-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-09/FSDSS-872-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-08/FSDSS-867-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-07/FSDSS-826-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/05/FSDSS-786-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/month-06/FSDSS-807.jpg",
      "https://jav.wine/wp-content/uploads/2024/04/FSDSS-772-jav.wine_.jpg",
      "https://jav.wine/wp-content/uploads/2024/01/FSDSS-721.jpg",
      "https://jav.wine/wp-content/uploads/2024/02/FSDSS-735-jav.wine_.jpg",
      "https://image.av-event.jp/contents/images/32443/1126ff6d84bb70474584cb7c10bc0f40.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSQkHZbB3WCT6DzZODKMMA-gSQ4TGR1YO8CPTbz6aCRI8XQU6M958KZwps&s=10",
      "https://cdn.faleno.net/top/wp-content/uploads/2023/03/fujii.jpg?resize=520:*&output-quality=60",
      "https://www.news-postseven.com/uploads/2023/08/25/fujii_ranran-500x750.jpg",
    ]
  }],

  ["折原由佳里", {
    primaryName: "折原由佳里",
    alternativeNames: ["折原由佳里"],
    profileImage: "https://pics.javhd.today/videos/tmb/000/188/398/1.jpg",
    backgroundImage: "https://cdn10.javtop.fun/images5/ly2ncguabe8liis/VENX-254.jpg",
    age: "50",
    height: "160 cm",
    weight: "45 kg",
    nationality: "日本",
    other: "信息补充",
    bio: "折原由佳里（おりはら ゆかり），1975年2月16日出生于日本，是一位资深的成人影片女演员，隶属于Capsule Agency。她以成熟女性的魅力和多变的表演风格闻名于业界，活跃于众多以家庭伦理、熟女主题为主的作品中，例如2009年的《息子に揉まれ風情の母》（儿子揉捏的母性风情）、2011年的《騎乗位がやめられなくて…》（无法戒掉的骑乘位）以及《人妻アナル競売》（人妻肛门拍卖）等。这些作品展现了她在情感深度和身体表现力上的出色能力。此外，她还涉足时尚与社会领域，2022年9月24日在神田明神ホール举办的Asia Pacific Collection活动中，作为性工作者代表走上T台，象征性地挑战了行业刻板印象。身高约160厘米，体重约45公斤的她，拥有匀称的身材和迷人的曲线，深受粉丝喜爱。作为一位经验丰富的艺人，她的作品总数超过数百部，持续影响着日本成人娱乐圈的发展。",
    galleryImages: [
      "https://m.media-amazon.com/images/I/8101sUbc1oL._UF894,1000_QL80_.jpg",
      "https://cdn.base.geonet.jp/img/prod/600/392/82/3928245-01-01.jpg",
      "https://m.media-amazon.com/images/I/81IDdhQOhwL.jpg",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/B5hThHfHKl4",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-ahqt5-3.jpg&w=400&q=80",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-h4mjw-4.jpg&w=400&q=80",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-ibufi-5.jpg&w=400&q=80",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-f2nol-6.jpg&w=400&q=80",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-s2cpt-7.jpg&w=400&q=80",
      "https://picazor.com/_next/image?url=%2Fuploads%2Fd24%2Ftu24%2Fyukari-orihara%2Fonlyfans%2F19g2l%2Fyukari-orihara-onlyfans-vxh3d-8.jpg&w=400&q=80",
      "https://pics.dmm.co.jp/digital/video/h_237nacr00107/h_237nacr00107jp-17.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjmLG_NP5iRKx_ii-i4NeqYIJ9cxoLi-uYuLzBBfATi5FEBSraO4tjWFM&s=10",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/Cu0Z3DbS_lw",
      "https://cdn.base.geonet.jp/img/prod/600/398/82/3988245-01-01.jpg",
      "https://cdn.base.geonet.jp/img/prod/600/350/81/3508114-01-01.jpg",
      "https://cdn.base.geonet.jp/img/prod/600/353/55/3535599-01-01.jpg",
      "https://hbox.jp/image3/content/418913/cover.jpg",
      "https://livedoor.blogimg.jp/roadman924/imgs/3/7/37bf8249.jpg",
      "https://www.mousouzoku-av.com/contents/works/avsw/avsw024/avsw024pm.jpg?1663291644",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/h_086iwan00009/h_086iwan00009jp-10.jpg",
      "https://m.media-amazon.com/images/I/91zALrwzc2L._UF894,1000_QL80_.jpg",
    ]
  }],

  ["沙月惠奈", {
    primaryName: "沙月惠奈",
    alternativeNames: ["沙月惠奈"],
    profileImage: "https://image.av-event.jp/contents/images/30772/522b82e1c0517f950b5e07f4904dfabb.jpg",
    backgroundImage: "https://pics.dmm.co.jp/digital/video/mvg00134/mvg00134pl.jpg",
    age: "26",
    height: "158 cm",
    weight: "42 kg",
    nationality: "日本",
    other: "信息补充",
    bio: "沙月惠奈（さつき えな），1999年6月11日出生于日本，是一位崭露头角的成人影片女演员，以其清新可爱的形象和高超的表演技巧迅速在业界崭露头角。她于2020年9月正式出道，隶属于经纪公司LINX，以娇小的身材（身高158厘米，体重42公斤）和甜美的外貌吸引了大量粉丝的关注。她的作品风格多样，涵盖了从清纯到大胆的多种角色，展现了出色的表演张力。沙月惠奈以其专业态度和不断提升的表现力，成为日本AV界备受期待的新星，持续为观众带来高质量的作品。",
    galleryImages: [
      "https://analersdelight.com/wp-content/uploads/2023/12/xx93ds4.jpg",
      "https://analersdelight.com/wp-content/uploads/2023/12/ffrd2.jpg",
      "https://www.indies-av.co.jp/wp-content/uploads/2021/11/ena_satsuki_top.jpg",
      "https://pics.dmm.co.jp/digital/video/1iesm00075/1iesm00075jp-14.jpg",
      "https://avosusume.com/webroot/image/contents/dmm/ore922/ore922jp.webp?201117.01",
      "https://geinou-nude.com/wp-content/uploads/2023/10/satsuki_020-700x988.jpg",
      "https://japanesebeauties.one/japanese/keina-satsuki/8/keina-satsuki-2.jpg",
      "https://j.uuu.cam/jav/japanese/keina-satsuki/4/keina-satsuki-6.jpg",
      "https://file.spice-tv.jp/free/ppv/AB/mbr_ab034_fhd/pkg_s.jpg",
      "https://pics.dmm.co.jp/digital/video/1ienf00183/1ienf00183jp-1.jpg",
      "https://pics.dmm.co.jp/digital/video/vrkm00809/vrkm00809jp-14.jpg",
      "https://image.av-event.jp/contents/images/29835/c9a4ed0b3af54bb2d50c23c17a27d02b.jpg",
      "https://img.sokmil.com/image/product/pef_nms0549_01_T1702003550.jpg",
      "https://blog-imgs-145.fc2.com/o/p/p/oppainorakuen/20211103_02_013.jpg",
      "https://nekobox.top/wp-content/uploads/2024/02/ENATAIYO2_30.jpg",
      "https://www.indies-av.co.jp/wp-content/uploads/2021/11/ena_satsuki_top.jpg",
      "https://image.av-event.jp/contents/images/31494/56ed290759950273f1ab7e57a01f780a.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ73AFOtA2Um49am1Gy7PPJ3ZcBQq6ITYkFLMRxJzm9acekxb32y15yeuX_&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTJabK_C-biZ62i8wf70IL2wipNRQDE-79Htwg7v9_Nmy0RkR-dnmscpez&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsEXWQKc8QE_mCqDhPHzNRywprlwlQDMxWlXZ9MkfqD5xCPZHKFUixe8A&s=10"
    ]
  }],

  ["白峰美羽", {
    "primaryName": "白峰美羽",
    "alternativeNames": ["白峰美羽"],
    "profileImage": "https://cdn.up-timely.com/image/8/content/80170/ZR0UsljzAmSg6d1FGp8tZD2ApucymlaqrFwrcDI5.jpg",
    "backgroundImage": "https://pics.pornfhd.com/s/digital/video/ipx00806/ipx00806pl.jpg",
    "age": "27",
    "height": "162 cm",
    "weight": "46 kg",
    "nationality": "日本",
    "other": "信息补充",
    "bio": "白峰美羽（しらみね みう），1998年2月16日出生于日本，是一位备受欢迎的成人影片女演员，以其优雅的气质和出色的表演能力在业界崭露头角。她于2021年1月以IdeaPocket旗下演员身份正式出道，凭借162厘米的身高、46公斤的纤细体重以及B88(E)-W57-H88的迷人身材迅速吸引了大量粉丝。白峰美羽的作品以情感细腻和多样化的角色演绎著称，涵盖了从浪漫到激烈的情节，展现了她独特的魅力和专业素养。作为一名年轻而充满潜力的演员，她持续为日本AV界带来高质量的内容，深受观众喜爱。",
    galleryImages: [
      "https://cdn.suruga-ya.jp/database/pics_webp/game/332044217.jpg.webp",
      "https://cdn.up-timely.com/image/15/content/78636/kmJDirgJQnULprKibRQZApJ4KHk8hocqrUSuZ3ZN.jpg",
      "https://m.media-amazon.com/images/I/91U++R9KPVL.jpg",
      "https://m.media-amazon.com/images/I/81UZL40bv3L._UF1000,1000_QL80_.jpg",
      "https://1.bp.blogspot.com/-qsV9bWMzE0g/YLdyD4BqfEI/AAAAAAABvDQ/4DQyfIi45IMGXf3rxhiuHXLA-PcxUd75ACLcBGAsYHQ/s0/%25E7%2599%25BD%25E5%25B3%25B0%25E3%2583%259F%25E3%2582%25A6%2B%25285%2529.jpg",
      "https://cdn.suruga-ya.jp/database/pics_light/game/731381584.jpg",
      "https://eromitai.com/wordpress/wp-content/uploads/2022/01/shiromine_miu2201006.jpg",
      "https://pics.dmm.co.jp/digital/video/ipx00589/ipx00589jp-1.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/ipx00589/ipx00589jp-2.jpg",
      "https://pics.dmm.co.jp/mono/movie/adult/adn732/adn732ps.jpg",
      "https://blog-imgs-167.fc2.com/r/1/8/r18000/202401111512351df.jpg",
      "https://blog-imgs-149.fc2.com/r/1/8/r18000/20211112194626574.jpg",
      "https://blog-imgs-149.fc2.com/r/1/8/r18000/20211112194622809.jpg",
      "https://blog-imgs-167.fc2.com/r/1/8/r18000/202401111512367b2.jpg",
      "https://cdn.up-timely.com/image/8/content/78374/huXIULEZWm2xF9TPRlV0eiJ0CMxIlpNjaLekjbpL.jpg",
      "https://pics.dmm.co.jp/digital/video/yuj00008/yuj00008ps.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/waaa00576/waaa00576ps.jpg",
      "https://cdn.up-timely.com/image/8/content/77388/ot4mCi9W1NECV5RhSKSNpQOvCGtjQ3ZmRM8qmSCY.jpg",
      "https://cdn.up-timely.com/image/8/content/76923/ASH34LWoVHICFrkjc0axNE7xWrl5re2ji6RspYnV.jpg",
      "https://cdn.up-timely.com/image/15/content/75292/FNuvstUUjFTeZGJrJtGtpCCiqsG2MOGqBytV1eBu.jpg",
    ]
  }],

  ["都月泪纱", {
    "primaryName": "都月泪纱",
    "alternativeNames": ["都月泪纱"],
    "profileImage": "https://cdn.suruga-ya.jp/database/pics_light/game/gl739264.jpg",
    "backgroundImage": "https://fourhoi.com/xvsr-756-uncensored-leak/cover-n.jpg",
    "age": "26",
    "height": "165 cm",
    "weight": "47 kg",
    "nationality": "日本",
    "other": "信息补充",
    "bio": "都月泪纱（みやこづき るいさ），1998年8月25日出生于日本，是一位备受喜爱的成人影片女演员，以其充满活力的表演和迷人的外貌在业界崭露头角。她于2022年8月以Madonna旗下演员身份正式出道，凭借165厘米的身高、47公斤的纤细体重以及B89(E)-W56-H88的出色身材迅速获得关注。都月泪纱以其多才多艺的演技和自然的魅力著称，作品涵盖了从浪漫剧情到高强度的角色扮演，展现了她在不同类型中的适应能力。作为一名经验丰富的演员，她的专业态度和高人气使她成为日本AV界的重要人物，持续为观众带来令人印象深刻的表现。",
    galleryImages: [
      "https://m.media-amazon.com/images/I/712TNwM9sbL._UF894,1000_QL80_.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOtcb05G0T2bkE0HJ8i0gTMIQUxoDmP9icPPk-aPVRCX2jxNIg6ALX-tH6&s=1",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSotPzpQOmvQJnSJ9HaANFbQtTzYOcmoA3ssPU-I2ONxg4x7FYSvucVmls&s=10",
      "https://blog-imgs-175.fc2.com/s/u/m/sumomochannel/totsuki_ruisa_13860-003.jpg",
      "https://blog-imgs-167.fc2.com/s/u/m/sumomochannel/totsuki_13532-003.jpg",
      "https://static.mercdn.net/item/detail/orig/photos/m87896439477_5.jpg?1715978383",
      "https://m.media-amazon.com/images/I/818CdLSL-tL._UF1000,1000_QL80_.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/manx00016/manx00016jp-1.jpg",
      "https://image.mgstage.com/images/luxutv/259luxu/1707/pf_o1_259luxu-1707.jpg",
      "https://vod365.net/wp-content/uploads/2025/07/totsukiruisa.jpg",
      "https://cdn.base.geonet.jp/img/prod/600/355/79/3557901-01-01.jpg",
      "https://cdn.suruga-ya.jp/database/pics_light/game/gn104449.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn104446.jpg.webp",
      "https://cdn.up-timely.com/image/12/content/70779/eQ0u1PspQCQ3wFgp7jHziizOy97FLvVGqDga4CVy.jpg",
      "https://livedoor.sp.blogimg.jp/avdrifters/imgs/c/3/c3a552cc.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gl739266.jpg.webp",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/Ch1UfxHP90v",
      "https://cdn.up-timely.com/image/8/content/70131/7nnOS7NgSSOdvkMbeDrJ2kzD2dmCPBwK8xCpFDEv.jpg",
      "https://adavi.tokyo/wp-content/uploads/2023/11/ruisa-totsuki-corporate-receptionist02.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxcv3yMIjQOqRcEdcc4PY_92NAiiButi-rdfn99dXWfOO55WsD6T-IkO0&s=10",
    ]
  }],

  // เพิ่มนักแสดงที่มีชื่อหลายแบบ - ใช้ primary name เป็นตัวหลัก
  ["藤浦惠", {
    "primaryName": "藤浦惠",
    "alternativeNames": ["藤浦めぐ", "藤浦惠"],
    "profileImage": "https://jav.wine/wp-content/uploads/2024/month-10/JUQ-893-jav.wine_.jpg",
    "backgroundImage": "https://pornjapanxx.com/wp-content/uploads/2023/08/MEYD-568-400x269.webp",
    "age": "36",
    "height": "168 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "藤浦惠（藤浦めぐ，ふじうら めぐ），1989年5月4日出生于日本，是一位在成人影片行业中享有盛誉的资深女演员。她于2006年以藤浦惠的名义出道，隶属于S1 No.1 Style，凭借168厘米的身高、50公斤的体重以及B95(G)-W60-H88的惊艳身材迅速走红。藤浦惠以其甜美的外貌和多才多艺的表演风格著称，作品涵盖了从清纯到成熟女性的多种角色。她在职业生涯中曾短暂引退，但于2017年以藤浦惠之名强势回归，加入经纪公司T-Powers，继续活跃于业界。她的作品数量庞大，风格多样，深受粉丝喜爱，确立了她在日本AV界的重要地位。",
    galleryImages: [
      "https://pbs.twimg.com/media/Ffsdj4NaUAAplUv.jpg:large",
      "https://img.pali.zone/data-optim/adult-videos/JUQ-943/thumb/JUQ-943.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT11ZC9pNh7AVbNwxeqxiAI0HqysHjb-V36IUYlEBKia124ol973yBGLFn2&s=10",
      "https://img.pali.zone/data-optim/adult-videos/JUR-354/thumb/JUR-354.jpg",
      "https://j.jjj.cam/jav/japanese/meguri/69/meguri-5.jpg",
      "https://pbs.twimg.com/profile_images/1903528611552088064/Zt86_b5l_400x400.jpg",
      "https://j.jjj.cam/jav/japanese/meguri/28/meguri-4.jpg",
      "https://j.jjj.cam/jav/japanese/meguri/28/meguri-2.jpg",
      "https://www.zenra.net/imgcache/original/blog_photos/4/meguri-jav-4_66f1eee1635ca.jpeg",
      "https://pbs.twimg.com/media/FNJ8RVJVcAIXMd7.jpg",
      "https://pbs.twimg.com/media/FzE2tnZaAAA8cAZ.jpg:large",
      "https://pbs.twimg.com/media/FuGGl9DagAAhPtQ.jpg:large",
      "https://img.pali.zone/data-optim/adult-videos/JUR-448/thumb/JUR-448.jpg",
      "https://jav-master.com/wp-content/uploads/2023/07/MEYD-575-min-237x300.jpg",
      "https://pbs.twimg.com/media/FlKjTp0aAAgGoPW.jpg:large",
      "https://pbs.twimg.com/media/FjZKiDmaAAA9nq8.jpg:large",
      "https://pbs.twimg.com/media/FL5cuBWVkAAjvsh.jpg:large",
      "https://pbs.twimg.com/media/FuEKstZaEAUnmC4.jpg:large",
      "https://pbs.twimg.com/media/FDHvai-acAAfhY_.jpg:large",
      "https://javtube.com/javpic/meguri/76/meguri-5.jpg",
      "https://j.jjj.cam/jav/japanese/meguri/47/meguri-6.jpg",
      "https://mpics-cdn-acc.mgronline.com/pics/Images/560000008402505.JPEG.webp"
    ]
  }],
  ["仓多茉绪", {
    "primaryName": "仓多茉绪",
    "alternativeNames": ["仓多茉绪"],
    "profileImage": "https://cdn.up-timely.com/image/20/content/56986/PPPD974_1.jpg",
    "backgroundImage": "https://fourhoi.com/eyan-011/cover-t.jpg",
    "age": "31",
    "height": "154 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "仓多茉绪（くらた まお），1994年3月7日出生于日本秋田县，是一位备受推崇的成人影片女演员，以其活泼的个性和多才多艺的表演风格在业界广受欢迎。她于2012年以S1 No.1 Style旗下演员身份出道，凭借154厘米的身高、50公斤的体重以及B95(H)-W58-H87的迷人身材迅速吸引了大量粉丝。仓多茉绪的作品风格多样，从清新可爱到成熟性感均有涉猎，展现了她出色的表演能力和独特的魅力。她曾活跃于多个知名片商，如Moodyz和Attackers，并在职业生涯中积累了数百部作品。作为一名经验丰富的演员，她以专业态度和高人气持续为日本AV界带来高质量的内容，深受观众喜爱。",
    galleryImages: [
      "https://blog-imgs-143.fc2.com/e/r/o/erog/Kurata_Mao_20220316_002.jpg",
      "https://blog-imgs-143.fc2.com/e/r/o/erog/Kurata_Mao_20220316_018.jpg",
      "https://blog-imgs-143.fc2.com/e/r/o/erog/Kurata_Mao_20220316_004.jpg",
      "https://j.uuu.cam/jav/japanese/mao-kurata/2/mao-kurata-6.jpg",
      "https://japanesebeauties.one/japanese/mao-kurata/1/mao-kurata-4.jpg",
      "https://j.uuu.cam/jav/japanese/mao-kurata/4/mao-kurata-1.jpg",
      "https://pashalism.com/wp-content/uploads/2022/06/2423-41.jpg",
      "https://tedouraku.com/img5/891-150.jpg",
      "https://japanesebeauties.one/japanese/mao-kurata/20/mao-kurata-7.jpg",
      "https://pashalism.com/wp-content/uploads/2022/06/2423-54.jpg",
      "https://pashalism.com/wp-content/uploads/2022/06/2423-3.jpg",
      "https://japanesebeauties.one/japanese/mao-kurata/32/mao-kurata-2.jpg",
      "https://www.mousouzoku-av.com/contents/works/soav/soav021/soav021pm.jpg?1663331840",
      "https://japanesebeauties.one/thumbs/160x222/222767.jpg",
      "https://geinou-nude.com/wp-content/uploads/2023/02/m_kurata_019-666x1000.jpg",
      "https://eromitai.com/wordpress/wp-content/uploads/2016/03/kurata_mao1603015.jpg",
      "https://cdn.up-timely.com/image/20/content/52340/PPBD197_1.jpg",
      "https://cdn.up-timely.com/image/20/content/56986/PPPD974_1.jpg",
      "https://cdn.up-timely.com/image/20/content/55800/PPBD216_1.jpg",
      "https://japanesebeauties.one/media/japanese/mao-kurata/14/hd-mao-kurata-8.jpg",
    ]
  }],
  ["水卜樱", {
    "primaryName": "水卜樱",
    "alternativeNames": ["水卜樱"],
    "profileImage": "https://cdn.suruga-ya.jp/database/pics_light/game/gn437022.jpg",
    "backgroundImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOkiW6JnsChgNvZXeNq0KFPz2cOLV7uoCC4lNdXX7_q3wCKf0wjsbn0Ag&s=10",
    "age": "27",
    "height": "152 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "水卜樱（みずと さくら），1997年11月30日出生于日本，是一位备受瞩目的成人影片女演员，以其清纯的外貌和出色的身材比例在业界广受欢迎。她于2017年以S1 No.1 Style旗下演员身份出道，凭借152厘米的身高、50公斤的体重以及B79(G)-W52-H78的惊艳身材迅速走红。水卜樱以其自然的表演风格和独特的魅力著称，作品风格多变，从青春活力到温柔细腻的角色均有出色表现。她在职业生涯中持续与顶级片商合作，如Moodyz和S1，积累了大量高质量作品。作为一名专业演员，她的才华和人气使她成为日本AV界的代表性人物之一，深受粉丝喜爱。",
    galleryImages: [
      "https://j.jjj.cam/jav/japanese/sakura-miura/4/sakura-miura-10.jpg",
      "https://j.jjj.cam/jav/japanese/sakura-miura/6/sakura-miura-7.jpg",
      "https://imagex1.sx.cdn.live/images/pinporn/2022/02/17/26739442.jpg?width=620",
      "https://photos.xgroovy.com/contents/albums/sources/741000/741885/841188.jpg",
      "https://www.babepedia.com/user-uploads/Sakura%20Miura5.jpg",
      "https://j.jjj.cam/jav/japanese/sakura-miura/5/sakura-miura-10.jpg",
      "https://blog-imgs-167.fc2.com/s/u/m/sumomochannel/miura_13074-001.jpg",
      "https://blog-imgs-101.fc2.com/e/r/o/erog/miura_sakura_20181015_002s.jpg",
      "https://m.media-amazon.com/images/I/812DB+3t3ZL._UF1000,1000_QL80_.jpg",
      "https://img.pali.zone/data-optim/adult-videos/MIDV-852/thumb/MIDV-852.jpg",
      "https://img.pali.zone/data-optim/adult-videos/REBD-922/thumb/REBD-922.jpg",
      "https://m.media-amazon.com/images/I/81XABq1xs9L._UF894,1000_QL80_.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn437001.jpg.webp",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gg530999.jpg.webp",
      "https://cdn.suruga-ya.jp/database/pics_light/game/g3889331.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn318806.jpg.webp",
      "https://av-erogazou.com/wp-content/uploads/2021/06/mide00872jp-10.jpg",
      "https://img.pali.zone/data-optim/adult-videos/MIDA-325/thumb/MIDA-325.jpg",
      "https://m.media-amazon.com/images/I/91O3zA5qEmL._UF894,1000_QL80_.jpg",
      "https://blog-imgs-164.fc2.com/s/u/m/sumomochannel/miura_sakura_14986-001s.jpg",
    ]
  }],
  ["七泽美爱", {
    "primaryName": "七泽美爱",
    "alternativeNames": ["七泽美爱"],
    "profileImage": "https://pbs.twimg.com/media/E0InKZUUUAI0Vje.jpg",
    "backgroundImage": "https://fourhoi.com/midv-938/cover-t.jpg",
    "age": "26",
    "height": "153 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "七泽美爱（ななさわ みあ），1998年12月13日出生于日本东京，是一位备受喜爱的成人影片女演员，以其可爱的外貌和活泼的表演风格在业界享有盛誉。她于2017年11月25日以MOODYZ旗下演员身份正式出道，凭借153厘米的身高、50公斤的体重以及B80(C)-W55-H83的娇小身材迅速走红。七泽美爱以其多才多艺的角色诠释和独特的魅力著称，作品风格多样，从校园少女到大胆的情节均有出色表现。她曾获得FANZA成人奖多项提名，并在2020年7月荣登FANZA视频月度女演员排行榜首位。作为一名专业演员，她隶属于Capsule Agency，持续活跃于日本AV界，积累了数百部高质量作品，深受粉丝喜爱。",
    galleryImages: [
      "https://www.shichuanling.com/wp-content/uploads/2024/07/030-724x1024.jpg",
      "https://cdn-1.ggjav.com/media/preview/211668_0.jpg",
      "https://cdn-1.ggjav.com/media/preview/58899_0.jpg",
      "https://blog-imgs-145.fc2.com/s/u/m/sumomochannel/nanasawa_11166-001s.jpg",
      "https://geinou-nude.com/wp-content/uploads/2023/06/n_mia_021-1-700x990.jpg",
      "https://j.jjj.cam/fanza/mia-nanasawa/mide00658/mia-nanasawa-7.jpg",
      "https://j.jjj.cam/fanza/mia-nanasawa/mide00658/mia-nanasawa-9.jpg",
      "https://blog-imgs-101.fc2.com/s/u/m/sumomochannel/nanasawa_mia_8913-002s.jpg",
      "https://fj.qixianzi.com/uploads/2023/12/09/8fe5f00a052248ffa8800463d06dd167.jpg",
      "https://www.shichuanling.com/wp-content/uploads/2024/07/091-724x1024.jpg",
      "https://livedoor.sp.blogimg.jp/imperator5714-nationals/imgs/3/8/38ad3965.jpg",
      "https://av-erogazou.com/wp-content/uploads/2021/11/mide00970jp-7.jpg",
      "https://ertk.net/imgs/2021/09/2021-09-02-5_nanasawaMiwa011.jpg",
      "https://blog-imgs-167.fc2.com/s/u/m/sumomochannel/nanasawa_13250-001s.jpg",
      "https://m.media-amazon.com/images/I/71bVBdGVpkL._UF894,1000_QL80_.jpg",
      "https://pics.dmm.co.jp/digital/video/midv00109/midv00109jp-8.jpg",
      "https://3.bp.blogspot.com/-viD6lXdgGwQ/WeBQ5VaueMI/AAAAAAAC6qs/DwiX9qbellYLEn-8QGCw7YZik9Ne64ZjQCLcBGAs/s1600/mide488jp-02.jpg",
      "https://www.i-dol.tv/contents/works/oae144/oae144-03.jpg",
      "https://geinou-nude.com/wp-content/uploads/2023/06/n_mia_024-700x990.jpg",
      "https://pbs.twimg.com/media/E0InKZUUUAI0Vje.jpg",
      "https://pbs.twimg.com/media/Ea81_kJU0AEZA_A.jpg",
      "https://blog-imgs-145.fc2.com/s/u/m/sumomochannel/nanasawa_mia_10236-001s.jpg",
    ]
  }],
  ["宫下玲奈", {
    "primaryName": "宫下玲奈",
    "alternativeNames": ["宫下玲奈"],
    "profileImage": "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/midv00461/midv00461jp-10.jpg",
    "backgroundImage": "https://fourhoi.com/midv-461/cover-n.jpg",
    "age": "24",
    "height": "152 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "宫下玲奈（みやした れな），2001年7月15日出生于日本大分县，是一位备受瞩目的成人影片女演员，以其清纯可爱的形象和出色的表演能力在业界迅速走红。她于2022年3月以MOODYZ旗下演员身份正式出道，凭借152厘米的身高、50公斤的体重以及B83(D)-W57-H85的娇小身材吸引了大量粉丝。宫下玲奈以其自然的演技和多样的角色诠释著称，作品涵盖从青春少女到情感丰富的剧情，展现了她独特的魅力。她隶属于T-Powers经纪公司，活跃于多个知名片商，如MOODYZ和Attackers，并在短时间内积累了大量高质量作品。作为一名年轻而充满潜力的演员，她的专业态度和高人气使她成为日本AV界的新星，深受观众喜爱。",
    galleryImages: [
      "https://j.jjj.cam/jav/japanese/lena-miyashita/4/lena-miyashita-2.jpg",
      "https://j.jjj.cam/jav/japanese/lena-miyashita/10/lena-miyashita-2.jpg",
      "https://javtube.com/javpic/lena-miyashita/6/lena-miyashita-8.jpg",
      "https://j.uuu.cam/jav/japanese/lena-miyashita/5/lena-miyashita-7.jpg",
      "https://j.uuu.cam/jav/japanese/lena-miyashita/9/lena-miyashita-5.jpg",
      "https://lovekoala.com/photo/miyashita-rena/miyashita-rena-20250222113852-10022.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/mdvr00316/mdvr00316jp-1.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZTz_Ir5iIyITg-WXPTXVg3hG3hrCYOk3U8exghDqGAj5JhHsR_PwOfg-9&s=10",
      "https://img.eropasture.com/wp-content/uploads/2025/08/0821_01_040.jpg",
      "https://geinou-nude.com/wp-content/uploads/2023/12/miyashi_009-700x875.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTezIcco_L1xvyPg6n_Qi3fx1n_uR1vema8-B6lxuIJ8aiEHTseiBJqqRPP&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaD1xLprqrnq84OyrKIWZly5erB5DN7Ce0x3zEX4LIM-6yuIBghFJp8Rat&s=10",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/mdvr00248/mdvr00248jp-1.jpg",
      "https://picture.yoshiclub.xyz/20230919/ea7eed29-9cb0-4bb9-84b7-a477a2aa7541.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyznONtiAqJRVobuhat5t4sByJGj1uWy36HDcYxCUtWeYqXsCVxUsX8bFA&s=10",
      "https://blog-imgs-159.fc2.com/g/m/8/gm8j46mpp36s/20230215134906ab5.jpg",
      "https://ugj.net/tokyogirl/lena-miyashita/4/lena-miyashita-5.jpg",
      "https://img.bakufu.jp/wp-content/uploads/2024/06/240613a_0002.jpg",
      "https://blog-imgs-164.fc2.com/g/m/8/gm8j46mpp36s/20250619202710d2b.jpg",
      "https://e2.eroimg.net/images/get/468/497/_67a27248a063f.jpeg",
      "https://hotgirl.asia/wp-content/uploads/2025/09/e6c37087b47442c88d16d8baafe77a62-300x450.webp",
    ]
  }],
  ["三田真铃", {
    "primaryName": "三田真铃",
    "alternativeNames": ["三田真铃"],
    "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU7hAug_nOETK6iV6n7Klv852Kzn3qvadav1qOzw8FSsBpWme9LRPRrtY_&s=10",
    "backgroundImage": "https://pics.dmm.co.jp/digital/video/sone00531/sone00531pl.jpg",
    "age": "23",
    "height": "153 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "三田真铃（みた まりん），2002年6月28日出生于日本，是一位备受关注的成人影片女演员，以其甜美的笑容和自然的表演风格迅速在业界崭露头角。她于2023年11月14日以S1 NO.1 STYLE专属女优身份正式出道，凭借153厘米的身高、50公斤的体重以及B83(D)-W57-H85的匀称身材吸引了大量粉丝。三田真铃的作品风格多样，从清纯大学生到大胆的情节均有出色表现，展现了她独特的魅力和潜力。她隶属于LIGHT经纪公司，兴趣包括魔术，自述性格为“随和且超级天然”。作为一名年轻演员，她已参与多部S1周年纪念作品，并在FANZA排行榜上屡获佳绩，持续为日本AV界注入新鲜活力，深受观众喜爱。",
    galleryImages: [
      "https://pbs.twimg.com/media/GDomXpBbwAADquU.jpg:large",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzlbw43R57LBxY5_ZY3Uw4_DAXn9hSpI2l8Ny83aSFZAJzDk6zcF6188VY&s=10",
      "https://blog-imgs-175.fc2.com/h/a/p/happysmile0418/marin-mita4_1.jpg",
      "https://pbs.twimg.com/media/GTgdkfMaEAAar0F.jpg:large",
      "https://img.bakufu.jp/wp-content/uploads/2024/01/240111a_0006.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkdDRr9wo295tL3Nh1qiPwipt3necnjooA3eUN_cviKZEoN-TlayoJp5k&s=10",
      "https://blog-imgs-175.fc2.com/h/a/p/happysmile0418/marin-mita4_2.jpg",
      "https://pbs.twimg.com/media/GMRxStaaUAAw4IV.jpg:large",
      "https://livedoor.blogimg.jp/johoten/imgs/1/4/14557d92.jpg",
      "https://blog-imgs-175.fc2.com/s/u/m/sumomochannel/mita_marin_13901-002.jpg",
      "https://gravia.site/img/img_661040.jpg",
      "https://2chav.com/wp-content/uploads/%E4%B8%89%E7%94%B0%E7%9C%9F%E9%88%B4-1.jpg",
      "https://blog-imgs-175.fc2.com/s/u/m/sumomochannel/mita_marin_14176-001.jpg",
      "https://image.av-event.jp/contents/images/35360/cae1a57be0ca5ca0e097ab79603a18a7.jpg",
      "https://pics.dmm.co.jp/digital/video/5050mbrba00123/5050mbrba00123jp-7.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/sivr00314/sivr00314jp-6.jpg",
      "https://blog-imgs-175.fc2.com/s/u/m/sumomochannel/mita_marin_14008-001s.jpg",
      "https://livedoor.sp.blogimg.jp/sougomatomechannel/imgs/3/f/3f1e5ee2.jpg",
      "https://fuzokuavlab.com/wp-content/uploads/2024/04/sone00191jp-1.jpg",
      "https://img.bakufu.jp/wp-content/uploads/2024/01/240111a_0003.jpg",
      "https://pbs.twimg.com/media/GBi6gJeasAAbUh0.jpg:large",
    ]
  }],
  ["梓光", {
    "primaryName": "梓光",
    "alternativeNames": ["梓光"],
    "profileImage": "https://m.media-amazon.com/images/I/81mUzOL2-rL._UF894,1000_QL80_.jpg",
    "backgroundImage": "https://pics.dmm.co.jp/digital/video/ipzz00087/ipzz00087pl.jpg",
    "age": "27",
    "height": "155 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "梓光（あずさ ひかり），1998年2月7日出生于日本，是一位备受瞩目的成人影片女演员，以其甜美外貌和F杯丰满身材在业界迅速走红。她于2020年3月13日以IdeaPocket专属女优身份正式出道，凭借155厘米的身高、50公斤的体重以及B89(F)-W54-H86的完美比例吸引了大量粉丝。梓光的作品风格多样，涵盖从清纯少女到大胆痴女的多种角色，展现了她出色的表演张力和独特的魅力。她隶属于Body Corporation经纪公司，活跃于多个知名片商，并在FANZA排行榜上屡获佳绩，如2024年3月的《生ハメ！膣内射精！！ 中出し解禁 梓光》登顶第6位。作为一名年轻而充满活力的演员，她持续为日本AV界带来高质量的内容，深受观众喜爱。",
    galleryImages: [
      "https://stat.ameba.jp/user_images/20221029/12/shiruba-in-the-world/fb/3a/j/o0864108015195070533.jpg",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/CKSzVR0hzKb",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/CMT2JBqhfLF",
      "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/CVR61vPPMIr",
      "https://eromitai.com/wordpress/wp-content/uploads/2024/04/azusa_hikari2404020.jpg",
      "https://eromitai.com/wordpress/wp-content/uploads/2023/04/azusa_hikari2304020.jpg",
      "https://erotok.com/wp-content/uploads/20241226_1/image3.webp",
      "https://shiofukikantei.com/wp-content/uploads/2021/05/ipx00523jp-8.jpg",
      "https://geinou-nude.com/wp-content/uploads/2024/04/hikari_004-1-700x979.jpg",
      "https://livedoor.blogimg.jp/suntou1976-yik0nma6/imgs/6/f/6f1e7e73.jpg",
      "https://eromitai.com/wordpress/wp-content/uploads/2024/04/azusa_hikari2404018.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGAt2InSXlsr2ku4uRzph8NXScNs3VcuoBYLifzm-lGkMMIQ9dSWSE2F0&s=10",
      "https://cdn.up-timely.com/image/4/content/60735/AhTF6pJluqntMsEIhwn6FVZc166TB6tXSLKMz2B6.jpg",
      "https://pbs.twimg.com/media/Fx7KqmMaYAA6F83?format=jpg&name=large",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/ipvr00148/ipvr00148jp-4.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN6FshdZmtqvSXj5XmbWqOrE-0OVCF4gJflIbqBdHB5nkx-XoK6ku0fKw&s=10",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gg468222.jpg.webp",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIM0tmJMxamuhtFVoxTrZEeDvhTHYaCtSyxJME6idC0wXjr5GUp84hi3I&s=10",
      "https://image-optimizer.osusume.dmm.co.jp/event/1059342/33554/file_path=390568eddfcd528343a652ac40b1676c.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIM0tmJMxamuhtFVoxTrZEeDvhTHYaCtSyxJME6idC0wXjr5GUp84hi3I&s=10",
    ]
  }],
  ["凪光", {
    "primaryName": "凪光",
    "alternativeNames": ["凪光", "汐世", "有栖花あか"],
    "profileImage": "https://melonbooks.akamaized.net/user_data/packages/resize_image.php?image=216001080555.jpg",
    "backgroundImage": "https://pics.dmm.co.jp/digital/video/ofje00558/ofje00558pl.jpg",
    "age": "28",
    "height": "162 cm",
    "weight": "50 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "凪光（なぎ ひかる），1997年4月6日出生于日本，是一位备受瞩目的成人影片女演员，以其J杯（105cm）的丰满胸部和清纯美貌在业界迅速走红。她于2020年10月7日以有栖花あか之名在S1 NO.1 STYLE旗下出道，凭借162厘米的身高、50公斤的体重以及B105(J)-W59-H88的惊艳身材吸引了大量粉丝。2021年12月改名为汐世，2022年11月再次改名为凪光并转投Eightman Production，继续活跃于S1专属女优行列。凪光的作品风格多样，从清纯少女到大胆痴女角色均有出色表现，多次登上FANZA排行榜首位，如她的首部作品获得800多条好评，被誉为“安齋らら再来”。作为一名专业演员，她以自然魅力和高超演技持续为日本AV界注入活力，深受观众喜爱。",
    galleryImages: [
      "https://photos.xgroovy.com/contents/albums/sources/630000/630086/684652.jpg",
      "https://photos.xgroovy.com/contents/albums/sources/853000/853686/1019329.jpg",
      "https://melonbooks.akamaized.net/user_data/packages/resize_image.php?image=216001062101.jpg",
      "https://cdn.suruga-ya.jp/database/pics_light/game/gn488994.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn635045.jpg.webp",
      "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0106/user/8ccfaf4ba962d6812b8157e877cad1529ab624971fcd4e00daf5513c4af23778/i-img819x1200-17511859225615r3qwtw35.jpg",
      "https://blog-imgs-167.fc2.com/e/r/o/erog/Nagi_hikaru_20230712_004.jpg",
      "https://ivworld.xyz/wp-content/gallery/2022/8887-1.jpg",
      "https://livedoor.blogimg.jp/ippondemoninjin-ketpxywo/imgs/f/2/f226a7e4-s.jpg",
      "https://reprint-kh.com/wp-content/gallery/nagihikaru1/cache/nagihikaru1071.png-nggid06470276-ngg0dyn-800x600-00f0w010c010r110f110r010t010.png",
      "https://fj.qixianzi.com/uploads/2023/04/02/daebb4b3760e4829bba397cd3da9fb46.jpg",
      "https://cdn.suruga-ya.jp/database/pics_light/game/gn398842.jpg",
      "https://blog-imgs-164.fc2.com/e/r/o/erog/Nagi_Hikaru_20230223_009.jpg",
      "https://blog-imgs-164.fc2.com/e/r/o/erog/Nagi_Hikaru_20230223_002.jpg",
      "https://www.xasiat.com/get_image/2/095440e0fc59dee464cfc142cbc3a575/sources/8000/8292/600628.jpg/",
      "https://geinou-nude.com/wp-content/uploads/2024/01/shio_020-666x1000.jpg",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/ssis00668/ssis00668jp-5.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLt036s2n3_Bgq3alKJZcdpDM1oHYaYDSnzh9TrycMtzqfR3Vw-ECthDlc&s=10",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/sivr00386/sivr00386jp-12.jpg",
      "https://m.media-amazon.com/images/I/811dSXK+kIL._UF1000,1000_QL80_.jpg",
    ]
  }],
  ["响莲", {
    "primaryName": "响莲",
    "alternativeNames": ["响莲"],
    "profileImage": "https://img.pali.zone/data-optim/adult-videos/EBWH-118/thumb/EBWH-118.jpg",
    "backgroundImage": "https://fourhoi.com/ebwh-058/cover-t.jpg",
    "age": "22",
    "height": "160 cm",
    "weight": "45 kg",
    "nationality": "日本",
    "other": "专业演员",
    "bio": "响莲（ひびき れん），2002年12月4日出生于日本，是一位备受关注的成人影片女演员，以其“令和最強のえろ娘”和“超新人級 史上最年少のセックス3冠王”的惊人出道在业界迅速走红。她于2023年4月4日以kawaii*专属女优身份正式出道，凭借160厘米的身高、45公斤的纤细体重以及B85(F)-W50-H88的完美身材吸引了大量粉丝。响莲以其异常性癖、潮吹和极致痉挛的表演风格著称，作品涵盖从激烈高潮到情感丰富的剧情，展现了她出色的身体反应和魅力。她的作品多次登上FANZA排行榜，如2024年7月的《見た目で選んだ俺の愛人はエグいほどドスケベ絶倫 ～チ●ポ欲しがり美女たちの奪い合い中出し性交～ 响莲 設楽ゆうひ》位列第三。她隶属于Bstar经纪公司，兴趣包括激安居酒屋一人饮酒，自述性格亲切却拥有超高超的性欲。作为一名年轻而充满潜力的演员，她持续为日本AV界带来震撼的内容，深受观众喜爱。",
    galleryImages: [
      "https://pbs.twimg.com/media/GD9BBxHaAAAPkFS.jpg:large",
      "https://picture.yoshiclub.xyz/20231016/0823d777-69f3-49e9-b831-ffb55e30bd68.jpg",
      "https://picture.yoshiclub.xyz/20231016/44441844-254d-4de1-a162-979e556d6685.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn361203.jpg.webp",
      "https://awsimgsrc.dmm.co.jp/pics_dig/digital/video/ebvr00092/ebvr00092jp-8.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8Cyfy3uCiAlGEnneYBfl5mEnwttnmDMwytBRFDB2Jpl1bWeaSc84hNw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQHL-sYYSOjrJ8BPi_OGwAyE5hZri2Y2Ja-hMzv51nYkKCj9q1YX3Tzy0&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYCsQaJY6Ep_9ziSYim5ZqHoTiIS59R-K4uIT-O4lpEZUCqfi-D9MzbB0&s=10",
      "https://img.pali.zone/data-optim/adult-videos/OAE-243/thumb/OAE-243.jpg",
      "https://picture.yoshiclub.xyz/20231016/4aab7cc9-de04-467f-81eb-4c03a092c337.jpg",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn274916.jpg.webp",
      "https://img.pali.zone/data-optim/adult-videos/EBWH-137/thumb/EBWH-137.jpg",
      "https://www.zenra.net/imgcache/original/blog_photos/4/ren-hibiki-jav-intro-1.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShsH2rNOJjnxp6or7gaFuAZZ45W9T2Zyvc0Aw-DRIjchtSPnYF2IvU2lU&s=10",
      "https://cdn.suruga-ya.jp/database/pics_webp/game/gn520606.jpg.webp",
      "https://img.buomtv.live/data-optim/adult-videos/TPPN-254/thumb/TPPN-254.webp",
      "https://uuribao.uxscdn.com/wp-content/uploads/2023/03/8715b115dc63a0f.jpg",
      "https://www.zenra.net/imgcache/original/blog_photos/4/ren-hibiki-jav-profile-1.jpg",
      "https://preview.redd.it/ren-hibiki-%E9%9F%BF%E8%93%AE-v0-qhhynouw6hee1.jpeg?width=640&crop=smart&auto=webp&s=057e2c9e74f46309793e1f77c0de6c331c359167",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE1jQpzJWnO8g7aO838JxMvxRG2B3PnjTP_1gLLrE5wBqBeW2_UmVGLVA&s=10",
      "https://pbs.twimg.com/media/F3xAlMsaMAA46LA.jpg:large",
      "https://livedoor.blogimg.jp/johoten/imgs/d/3/d38f3e21.jpg",
    ]
  }],
  ["桥本有菜", {
    "primaryName": "桥本有菜",
    "alternativeNames": ["桥本有菜"],
    "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwgS3I_gbvOk1At5RwlsfK3wQoV1WHe5L2HCLsMpvY7Zn9vkem3_Tc-H9B&s=10",
    "backgroundImage": "https://2nine.net/preview/80/b/XLxyBjbG8q-800.jpg?v=1757658924",
    "age": "27",
    "height": "160 cm",
    "weight": "53 kg",
    "nationality": "日本籍",
    "other": "胸围96（G罩杯） 腰围59 臀围88",
    "bio": "桥本有菜（1998年7月22日出生）是日本成人影片女演员，以其丰满身材和自2019年出道以来在成人影片行业的出色表现而闻名。",
    galleryImages: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSke14lu_qinzxzymLMI2gUsVYvCvGV-lLdiec7EqPMKHgStd0M3cxg4xt1&s=10",
      "https://pics.dmm.co.jp/digital/video/1dandy00912/1dandy00912jp-13.jpg",
      "https://pics.dmm.co.jp/digital/video/1dandy00912/1dandy00912jp-6.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjTiIHH5LJkJLPbK-p-19jUHFCxwhADWtE0a-Hgk0TETRfriYqUKiUh9I&s=10",
      "https://pics.dmm.co.jp/digital/video/1dandy00912/1dandy00912jp-17.jpg",
      "https://pics.dmm.co.jp/digital/video/1dandy912/1dandy912jp-8.jpg",
      "https://cdn-1.ggjav.com/media/preview/252053_17.jpg",
      "https://pics.dmm.co.jp/digital/video/1dandy00912/1dandy00912jp-5.jpg",
      "https://pics.dmm.co.jp/digital/video/1dandy00912/1dandy00912jp-3.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZeiLhxThPvp22mQaCqM-GuWPJctjdCsM5mp9P1QcpiJ1mVHxpLShOc5g&s=10",
    ]
  }],
  ["三崎娜娜", {
    "primaryName": "三崎娜娜",
    "alternativeNames": ["三崎娜娜"],
    "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd9-6DAwqEkQkwWXwLxFlFOKCQUvNjMahftg&s",
    "backgroundImage": "",
    "age": "23",
    "height": "155 cm",
    "weight": "",
    "nationality": "日本",
    "other": "",
    "bio": "三崎なな是一位日本成人视频（AV）女演员，出生于2002年3月6日。她于2023年3月在T-Powers经纪公司旗下以MOODYZ专属女优身份出道，以其清纯外貌和出色的表演迅速受到关注。",
    galleryImages: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd9-6DAwqEkQkwWXwLxFlFOKCQUvNjMahftg&s",
    ]
  }],
  [
    "枫富爱",
    {
      "actors": ["枫富爱"],
      "title": "受欢迎的网红夫妇为了爆红而轻率进入性欲压抑的村民们过于危险的村庄黑暗中，沉迷其中无法脱身的故事",
      "primaryName": "枫富爱",
      "alternativeNames": ["枫芙爱"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZsi9Rr1UWUV3c_GweF8uVJGYejO_IrzDo0nApxGJE_kZJQWjSUuIjBPCA&s=10",
      "backgroundImage": "",
      "age": "24",
      "height": "170 cm",
      "weight": "",
      "nationality": "日本",
      "other": "胸围93（F罩杯） 腰围59 臀围88",
      "bio": "枫富爱（2001年4月20日出生）是日本成人影片女演员，以其高挑修长的身材和自2021年出道以来在成人影片行业的广泛工作而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "田中柠檬",
    {
      "actors": ["田中柠檬"],
      "title": "大胸部新人演员处女作",
      "primaryName": "田中柠檬",
      "alternativeNames": ["田中利蒙"],
      "profileImage": "https://k.sinaimg.cn/n/sinakd20116/749/w1044h1305/20230205/6b67-0064eb476904667220523568617969fe.jpg/w700d1q75cms.jpg",
      "backgroundImage": "",
      "age": "20",
      "height": "158 cm",
      "weight": "48 kg",
      "nationality": "日本",
      "other": "胸围95（G罩杯） 腰围58 臀围86",
      "bio": "田中柠檬（2005年3月15日出生）是日本成人影片新星，以其出众的身材和2025年出道以来的首次作品而受到关注。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "宫本留衣",
    {
      "actors": ["宫本留衣"],
      "primaryName": "宫本留衣",
      "alternativeNames": ["宫本琉衣"],
      "profileImage": "https://img.kkkkkkkkk.net/backdrops//f7HJrqPbqmR8ir0clwCXNapgEzS.jpg",
      "backgroundImage": "",
      "age": "26岁",
      "height": "167厘米",
      "weight": "",
      "nationality": "日本",
      "other": "胸围94（G罩杯） 腰围62 臀围90",
      "bio": "宫本留衣（1999年1月6日出生）是日本成人影片女演员，以其丰满的身材和自2024年出道以来在成人影片行业的作品而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "樱空桃",
    {
      "actors": ["樱空桃"],
      "title": "超大胸部巨乳女优的户外性爱狂欢",
      "primaryName": "樱空桃",
      "alternativeNames": ["樱空桃子"],
      "profileImage": "https://q9.itc.cn/images01/20241202/d94bcf6af5194b9795e36fe91df8b610.jpeg",
      "backgroundImage": "",
      "age": "28岁",
      "height": "163厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸围97（H罩杯） 腰围60 臀围87",
      "bio": "樱空桃（1997年9月9日出生）是日本成人影片女演员，以其丰满身材和自2018年出道以来在户外场景中的出色表现而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "水川堇",
    {
      "actors": ["水川堇"],
      "title": "储存太多对身体有害。蜘蛛骑乘位乳头责备痴女护士",
      "primaryName": "水川堇",
      "alternativeNames": ["水川堇"],
      "profileImage": "https://s.yimg.com/ny/api/res/1.2/DnBTcMGo3sgIePd86VFnWQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTY5Ng--/https://media.zenfs.com/ko/setn.com.tw/9d90f38696fdc3bb7c1da3476e7418c4",
      "backgroundImage": "",
      "age": "30",
      "height": "154 cm",
      "weight": "48 kg",
      "nationality": "日本",
      "other": "胸围100（J罩杯） 腰围62 臀围90",
      "bio": "水川堇（1995年2月3日出生）是日本成人影片女演员，以其苗条身材和自2017年出道以来在成人影片行业的广泛工作而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "神木丽",
    {
      "actors": ["神木丽"],
      "title": "前艺人挑战娱乐圈未教的4种异常玩法",
      "primaryName": "神木丽",
      "alternativeNames": ["神木蕾"],
      "profileImage": "https://p3-pc-sign.douyinpic.com/tos-cn-i-0813c000-ce/okw5eItL0EeAAAE4HEXinC5iIRBA1nAccwfPLT~tplv-dy-aweme-images:q75.webp?biz_tag=aweme_images&from=327834062&lk3s=138a59ce&s=PackSourceEnum_SEARCH&sc=image&se=false&x-expires=1763503200&x-signature=C2nsc%2B7IqA%2FIO%2BwAaC4vlWYuWds%3D",
      "backgroundImage": "",
      "age": "25岁",
      "height": "169厘米",
      "weight": "",
      "nationality": "日本",
      "other": "胸围95（G罩杯） 腰围60 臀围85",
      "bio": "神木丽（1999年12月20日出生）是日本成人影片女演员，以其高挑身材、丰满胸部和自2022年出道以来在成人影片行业的迅速走红而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "相泽南",
    {
      "actors": ["相泽南"],
      "title": "4K超清10连发性爱挑战",
      "primaryName": "相泽南",
      "alternativeNames": ["相泽南"],
      "profileImage": "https://images.steamusercontent.com/ugc/1811012432393271635/EEBC2490D682B366456DB08551158A121DC482B7/?imw=768&imh=1024&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true",
      "backgroundImage": "",
      "age": "27岁",
      "height": "150厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围88（D罩杯） 腰围56 臀围82",
      "bio": "相泽南（1998年3月10日出生）是日本成人影片女演员，以其娇小身材和自2017年出道以来在成人影片行业的出色表现而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "星宫一花",
    {
      "actors": ["星宫一花"],
      "title": "超大胸部巨乳女优的特殊性爱服务",
      "primaryName": "星宫一花",
      "alternativeNames": ["星宫一花"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRttRf3JoY9kXTc0nvAstYJ-v48YPpdlc14KDh77fZZL0UyZmCkvQ&s&ec=73053463",
      "backgroundImage": "",
      "age": "28岁",
      "height": "158厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围96（G罩杯） 腰围59 臀围86",
      "bio": "星宫一花（1997年4月14日出生）是日本成人影片女演员，以其丰满身材和自2019年出道以来在特殊服务题材中的表现而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "河北彩花",
    {
      "actors": ["河北彩花"],
      "title": "交织的体液，浓密性爱 完全无剪辑特别版",
      "primaryName": "河北彩花",
      "alternativeNames": ["河北彩伽"],
      "profileImage": "https://i.pinimg.com/736x/2f/56/bd/2f56bd5c86a659f10ab8b66617dfbad7.jpg",
      "backgroundImage": "",
      "age": "26岁",
      "height": "169厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围88（E罩杯） 腰围59 臀围89",
      "bio": "河北彩花（1999年4月24日出生）是日本成人影片女演员，以其高挑身材和自2018年出道（2019年暂退，2021年复出）以来在成人影片行业的出色表现而闻名。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "三上悠亚",
    {
      "actors": ["三上悠亚"],
      "title": "人妻X放題 無限制訂閱",
      "primaryName": "三上悠亚",
      "alternativeNames": ["Mikami Yua"],
      "profileImage": "https://pgw.udn.com.tw/gw/photo.php?u=https://uc.udn.com.tw/photo/2024/06/19/realtime/29845231.jpg&x=0&y=0&sw=0&sh=0&exp=3600",
      "backgroundImage": "",
      "age": "30岁",
      "height": "160厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围85（D罩杯） 腰围58 臀围86",
      "bio": "三上悠亚（1993年3月16日出生）是日本知名的成人影片女演员，以其甜美外貌和出色的表演自2015年出道以来广受欢迎。她在行业中拥有众多粉丝，并曾短暂转战主流娱乐圈，后于2020年复出。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "佐佐木咲希",
    {
      "actors": ["佐佐木咲希"],
      "title": "偶像美少女的可爱小嘴被浓密精液11次袭击",
      "primaryName": "佐佐木咲希",
      "alternativeNames": ["Sasaki Saki"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSga4GaeD5dMt3aBZUo84wFwT_jcqelJsk77HMDQpyZiq_Hr_oqlh_wGmg&s=10",
      "backgroundImage": "",
      "age": "25岁",
      "height": "158厘米",
      "weight": "43公斤",
      "nationality": "日本",
      "other": "胸围83（C罩杯） 腰围57 臀围85",
      "bio": "佐佐木咲希（2000年5月12日出生）是日本成人影片女演员，以其清纯外貌和自2020年出道以来的出色表演受到关注。她以可爱的形象和独特的风格在行业中崭露头角。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "鈴村亜里",
    {
      "actors": ["鈴村亜里"],
      "title": "意想不到的新作发行!? 鈴村亜里的魅力浓缩130分钟",
      "primaryName": "鈴村亜里",
      "alternativeNames": ["Suzumura Ari"],
      "profileImage": "https://pbs.twimg.com/media/G1MhY24bsAAIEmJ.jpg",
      "backgroundImage": "",
      "age": "28岁",
      "height": "162厘米",
      "weight": "47公斤",
      "nationality": "日本",
      "other": "胸围86（D罩杯） 腰围60 臀围87",
      "bio": "鈴村亜里（1997年7月9日出生）是日本成人影片女演员，以其清新的形象和自2019年出道以来的自然表演受到欢迎。她以多样的角色诠释在行业中积累了良好口碑。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "高桥圣子",
    {
      "actors": ["高桥圣子"],
      "title": "20周年 从周一开始的中出",
      "primaryName": "高桥圣子",
      "alternativeNames": ["Takahashi Seiko"],
      "profileImage": "https://image.tmdb.org/t/p/w235_and_h235_face/8AyNhSWxG83wTD1d68BfKprnZLW.jpg",
      "backgroundImage": "",
      "age": "29岁",
      "height": "165厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸围90（F罩杯） 腰围61 臀围88",
      "bio": "高桥圣子（1996年6月18日出生）是日本成人影片女演员，以其火辣的身材和自2018年出道以来的大胆表演而闻名。她在行业中因其独特的魅力和多变风格受到广泛喜爱。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "相沢みなみ",
    {
      "actors": ["相沢みなみ"],
      "title": "护士和不知不觉中感极",
      "primaryName": "相沢みなみ",
      "alternativeNames": ["Aizawa Minami", "あいざわみなみ"],
      "profileImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/AV%E5%A5%B3%E5%84%AA%E3%83%BB%E7%9B%B8%E6%B2%A2%E3%81%BF%E3%81%AA%E3%81%BF.png/960px-AV%E5%A5%B3%E5%84%AA%E3%83%BB%E7%9B%B8%E6%B2%A2%E3%81%BF%E3%81%AA%E3%81%BF.png",
      "backgroundImage": "",
      "age": "26",
      "height": "155 cm",
      "weight": "",
      "nationality": "日本",
      "other": "出生于千叶县，2017年出道，三围83-58-84",
      "bio": "相沢みなみ（あいざわみなみ）是日本AV女优，1999年3月28日出生于千叶县。2017年出道，以甜美外貌和娇小身材受到关注。尤其在护士角色中的表现备受好评。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "橋本ありな",
    {
      "actors": ["橋本ありな"],
      "title": "温泉旅馆外宿对抗赛",
      "primaryName": "橋本ありな",
      "alternativeNames": ["Hashimoto Arina"],
      "profileImage": "https://tshop.r10s.jp/book/cabinet/7544/9784198647544.jpg?downsize=600:*",
      "backgroundImage": "",
      "age": "27岁",
      "height": "168厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围87（E罩杯） 腰围59 臀围90",
      "bio": "橋本ありな（1998年3月5日出生）是日本成人影片女演员，以其优雅的气质和自2017年出道以来的出色表现而闻名。她在行业中以多样的角色和自然演技受到广泛喜爱，曾在2022年短暂休息后于2023年复出。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "莉莉·哈特",
    {
      "actors": ["莉莉·哈特"],
      "title": "与丈夫做爱后总是被继父持续中出……",
      "primaryName": "莉莉·哈特",
      "alternativeNames": ["リリー・ハート", "莉莉·哈特"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWNoKxeOkf7lZ3q1p624lHRL_78JxqL4NdTsrrWp_v9Q&s=10",
      "backgroundImage": "",
      "age": "26岁",
      "height": "170厘米",
      "weight": "55公斤",
      "nationality": "美国",
      "other": "胸围92（F罩杯） 腰围61 臀围89",
      "bio": "莉莉·哈特（1999年生）是美国成人影片女演员，金发碧眼，身材高挑火辣。2021年以Madonna专属女优身份正式进军日本AV界，首部作品《JUL-608》即以NTR继父中出题材爆红。此后陆续与S1、Attackers、MOODYZ等顶级片商合作，擅长演绎异国人妻被日式调教的禁忌剧情，深受日系观众喜爱。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "森菜菜子",
    {
      "actors": ["森菜菜子"],
      "title": "比丈夫更爱公公……",
      "primaryName": "森菜菜子",
      "alternativeNames": ["森ななこ", "森菜菜子"],
      "profileImage": "https://j.uuu.cam/jav/japanese/nanako-mori/46/nanako-mori-2.jpg",
      "backgroundImage": "",
      "age": "35岁",
      "height": "161厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸围90（G罩杯） 腰围58 臀围86",
      "bio": "森菜菜子（1988年生）是日本成人影片女演员，以丰满巨乳与成熟人妻气质闻名。2011年以Madonna专属身份出道，代表作《JUL-398》以禁忌公公NTR题材广受好评。擅长演绎熟女被调教、家庭伦理崩坏剧情，2020年后逐渐淡出业界。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "青空光",
    {
      "actors": ["青空光"],
      "title": "口交大好き青空光的私密肉棒宅急便",
      "primaryName": "青空光",
      "alternativeNames": ["青空ひかり", "青空光"],
      "profileImage": "https://i.pinimg.com/736x/4e/57/c4/4e57c432c1348d232f3bc1b13edd7a97.jpg",
      "backgroundImage": "",
      "age": "24岁",
      "height": "162厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围83（C罩杯） 腰围57 臀围85",
      "bio": "青空光（2000年生）是日本新生代AV女优，以可爱笑容与口交技巧闻名。2022年以SOD专属身份出道，代表作《STARS-829》以‘肉棒宅急便’为主题，真实记录她私下为粉丝提供上门口交服务。风格清新自然，擅长轻喜剧式演出，被誉为‘口交界的快递小妹’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "唯井真昼",
    {
      "actors": ["唯井真昼"],
      "title": "体液交织喷潮不止 极上5角凌辱",
      "primaryName": "唯井真昼",
      "alternativeNames": ["唯井まひろ", "唯井真昼"],
      "profileImage": "https://upload.wikimedia.org/wikipedia/commons/3/3e/SOD_AKIHABARA_JACK_2023_IMG_9528.jpg",
      "backgroundImage": "",
      "age": "24岁",
      "height": "153厘米",
      "weight": "41公斤",
      "nationality": "日本",
      "other": "胸围80（A罩杯） 腰围55 臀围83",
      "bio": "唯井真昼（1999年12月30日生）是日本SODSTAR王牌女优，以娇小身材与超强喷潮体质闻名。2017年出道即爆红，2024年《START-369》挑战‘5 CORNER’极限凌辱企划，全片汗水、爱液、潮吹交织，连续16次喷射创个人纪录。被誉为‘最强喷水小恶魔’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "天音栞菜",
    {
      "actors": ["天音栞菜"],
      "title": "与苗条美少女彻夜乱交SEX",
      "primaryName": "天音栞菜",
      "alternativeNames": ["天音かんな", "天音栞菜"],
      "profileImage": "https://image.av-event.jp/contents/images/35019/8e31141c19bf520cab200547aa06081d.jpg",
      "backgroundImage": "",
      "age": "19岁",
      "height": "158厘米",
      "weight": "42公斤",
      "nationality": "日本",
      "other": "胸围82（B罩杯） 腰围56 臀围84",
      "bio": "天音栞菜（2005年生）是日本SODSTAR最年轻专属女优，18岁即出道即爆红。2024年《START-361》挑战‘彻夜乱交’企划，真实记录与多名男优从黄昏到黎明的连续性爱。身材纤细敏感，擅长娇喘与泪眼演出，被誉为‘最纯欲的合法萝莉’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "彩月七緒",
    {
      "actors": ["彩月七緒"],
      "title": "爆乳人妻被强行放置三天NTR",
      "primaryName": "彩月七緒",
      "alternativeNames": ["彩月七緒", "彩月七绪"],
      "profileImage": "https://image.playno1.com/images/2024/01/15/319a53ba45d350f217a82e4402494312.jpg",
      "backgroundImage": "",
      "age": "25岁",
      "height": "165厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸围105（K罩杯） 腰围60 臀围90",
      "bio": "彩月七緒（1999年生）是日本SODSTAR超巨乳专属女优，以105cm K罩杯震撼业界。2024年《START-404》推出‘放置NTR’企划，真实记录被陌生人带走三天、彻底调教成肉便器的过程。擅长被动凌辱与泪崩演出，被誉为‘最危险的爆乳人妻’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "神木麗",
    {
      "actors": ["神木麗"],
      "title": "圣诞奇跡！大奶打工妹超市爆走",
      "primaryName": "神木麗",
      "alternativeNames": ["神木麗", "Kamiki Rei"],
      "profileImage": "https://assets.juksy.com/files/articles/126549/663a45b1ce5ab.jpg",
      "backgroundImage": "",
      "age": "24岁",
      "height": "165厘米",
      "weight": "53公斤",
      "nationality": "日本",
      "other": "胸围98（H罩杯） 腰围59 臀围88",
      "bio": "神木麗（2000年生）是日本SODSTAR超火爆巨乳女优，以98cm H罩杯与大胆企划闻名。2024年《START-362》推出‘圣诞打工妹大暴走’，真实潜入超市扮圣诞促销员，全程无码投掷29连发，引发顾客狂欢。擅长公共场合爆乳演出，被誉为‘最危险的圣诞礼物’。",
      "galleryImages": [
        ""
      ]
    }
  ],

  [
    "绫濑麻衣子",
    {
      "actors": ["绫濑麻衣子"],
      "title": "SOD女子社員 社内中出し逆NTR",
      "primaryName": "绫濑麻衣子",
      "alternativeNames": ["绫濑麻衣子", "Ayase Maiko"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQS0FutO5B42xkJl5wp3CS0r40CLVrR7hi7-cDXyb9irIqBb2j0JQ_lzD3&s=10",
      "backgroundImage": "",
      "age": "47岁",
      "height": "160厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸围88（E罩杯） 腰围62 臀围90",
      "bio": "绫濑麻衣子（1976年生）是日本SOD真实女子社員，47岁以《SDJS-055》推出‘社内中出逆NTR’企划。伪装成温柔前辈，实则主动勾引年轻男员工在办公室连续中出。风格大胆反差，擅长职场诱惑与社畜凌辱，被誉为‘最强熟女猎人’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "岛崎真子",
    {
      "actors": ["岛崎真子"],
      "title": "SOD女子社員 摄影师潜入公司拍摄SEX！",
      "primaryName": "岛崎真子",
      "alternativeNames": ["岛崎真子", "Shimazaki Mako"],
      "profileImage": "https://48pedia.org/images/4/44/2019%E5%B9%B4AKB48%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB_%E5%B0%8F%E5%B6%8B%E7%9C%9F%E5%AD%90.jpg",
      "backgroundImage": "",
      "age": "28岁",
      "height": "162厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围86（D罩杯） 腰围58 臀围87",
      "bio": "岛崎真子（1997年生）是日本SOD真实女子社員，以清纯外表与摄影师身份闻名。2020年《SDJS-019》推出‘公司潜入拍摄’企划，伪装摄影师在办公室诱导20名女员工集体SEX，全程手持摄影记录真实反应。擅长隐藏镜头与多人混战，被誉为‘最危险的偷拍女摄影师’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "春风光",
    {
      "actors": ["春风光"],
      "title": "男潮吹骑乘位逆强○ 完全女子主導龟头责め腰动活塞！",
      "primaryName": "春风光",
      "alternativeNames": ["春風ひかる", "春风光"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDUTpNylbFCOatRSK6L8RvcuWzThObNfjxu60uBQ0MpMv91X1rf6Fdivk&s=10",
      "backgroundImage": "",
      "age": "19岁",
      "height": "148厘米",
      "weight": "38公斤",
      "nationality": "日本",
      "other": "胸围78（A罩杯） 腰围54 臀围80",
      "bio": "春风光（2000年生）是日本SOD逆强○系超新星，娇小身材却拥有恐怖骑乘位。2019年《SDMU-959》推出‘男潮吹逆强○’企划，真实让男优在骑乘位中连续喷射，全程女子主导龟头责め。风格凶残可爱，擅长强制高潮，被誉为‘最危险的合法萝莉’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "渚光希",
    {
      "actors": ["渚光希"],
      "title": "性欲旺盛NTR 第一次被他人巨根干到高潮的妻子",
      "primaryName": "渚光希",
      "alternativeNames": ["渚みつき", "渚光希"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbHQQkhu-foITQDKxQr3V4vL7icdCjIWAFXOK-LG-bU42guOAc2oh1leUr&s=10",
      "backgroundImage": "",
      "age": "24岁",
      "height": "155厘米",
      "weight": "43公斤",
      "nationality": "日本",
      "other": "胸围83（C罩杯） 腰围57 臀围85",
      "bio": "渚光希（1999年生）是日本NTR系当红女优，以娇小身材与高潮痉挛闻名。2020年《HND-816》推出‘性欲旺盛NTR’，真实记录她首次被他人巨根连续中出、潮吹失禁的崩坏过程。风格真实沉沦，擅长被夺取演出，被誉为‘最容易被NTR的小恶魔’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "凛音桃花",
    {
      "actors": ["凛音桃花"],
      "title": "用乳首高潮诱惑中出 痴女大姐姐",
      "primaryName": "凛音桃花",
      "alternativeNames": ["凛音とうか", "凛音桃花"],
      "profileImage": "https://cdn.suruga-ya.jp/database/pics_webp/game/gl858007.jpg.webp",
      "backgroundImage": "",
      "age": "28岁",
      "height": "168厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸围98（H罩杯） 腰围60 臀围89",
      "bio": "凛音桃花（1996年生）是日本痴女系顶级女优，以98cm H罩杯与乳首责闻名。2019年《HNDB-178》推出‘乳首高潮痴女’企划，真实用乳首挑逗让男优连续中出，全程主动骑乘与痴女台词。风格强势诱惑，擅长乳首调教，被誉为‘最强痴女大姐姐’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "小栗萌",
    {
      "actors": ["小栗萌"],
      "title": "競泳水着孕ませ輪姦NTR",
      "primaryName": "小栗萌",
      "alternativeNames": ["小栗もえ", "小栗萌"],
      "profileImage": "https://rip.ne.jp/common/wp-content/uploads/c997b552de69f4f986b0a2938dc38f49-scaled-e1735960464689.jpg",
      "backgroundImage": "",
      "age": "22岁",
      "height": "160厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸围90（G罩杯） 腰围58 臀围86",
      "bio": "小栗萌（2001年生）是日本NTR系巨乳新星，以競泳水着与轮姦题材闻名。2023年《HNDB-231》推出‘孕ませ輪姦NTR’，真实记录她在游泳池被15名教练轮番中出、孕检阳性。风格真实沉沦，擅长水着凌辱与大量中出，被誉为‘最危险的游泳部经理’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "北岡果林",
    {
      "actors": ["北岡果林"],
      "title": "キメセクNight 绝顶失神媚药派对中出性交",
      "primaryName": "北岡果林",
      "alternativeNames": ["北岡果林", "北冈果林"],
      "profileImage": "https://www.juksy.com/api/image/webp?source=https://assets.juksy.com/files/articles/127898/66b0ae79b5606.jpg",
      "backgroundImage": "",
      "age": "21岁",
      "height": "158厘米",
      "weight": "46公斤",
      "nationality": "日本",
      "other": "胸围85（D罩杯） 腰围57 臀围86",
      "bio": "北岡果林（2002年生）是日本媚药系超新星，以敏感体质与失神高潮闻名。2019年《HND-745》推出‘キメセクNight’，真实记录她在派对中被灌媚药、连续中出600分钟、痉挛失禁的崩坏过程。风格真实重口，擅长媚药凌辱，被誉为‘最容易失神的派对女王’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "美園和花",
    {
      "actors": ["美園和花"],
      "title": "巨乳淫语瑜伽教练 超贴身诱惑中出课程",
      "primaryName": "美園和花",
      "alternativeNames": ["美園和花", "美园和花"],
      "profileImage": "https://m.media-amazon.com/images/I/61YGJUS8zRL._AC_UF350,350_QL80_.jpg",
      "backgroundImage": "",
      "age": "25岁",
      "height": "165厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸围100（J罩杯） 腰围62 臀围92",
      "bio": "美園和花（1997年生）是日本巨乳痴女系人气女优，以100cm J罩杯与淫语瑜伽闻名。2020年《GVH-087》推出‘巨乳淫語瑜伽’，真实记录她用超贴身姿势、淫语挑逗学员连续中出。风格强势诱惑，擅长瑜伽体位与乳夹，被誉为‘最危险的瑜伽教练’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "渚光希",
    {
      "actors": ["渚光希"],
      "title": "禁断介護 真心看护老人肉体",
      "primaryName": "渚光希",
      "alternativeNames": ["渚みつき", "渚光希"],
      "profileImage": "https://cdn.livepocket.jp/image/ffny4810WKiph6rlki7Vmb73lSY3lJBHskqjEpBFXrhcsUtVe8b1M0kCqbsWFC1X",
      "backgroundImage": "",
      "age": "24岁",
      "height": "155厘米",
      "weight": "43公斤",
      "nationality": "日本",
      "other": "胸围83（C罩杯） 腰围57 臀围85",
      "bio": "渚光希（1999年生）是日本禁忌系人气女优，以娇小身材与伦理崩坏闻名。2020年《GVH-087》推出‘禁断介護’，真实记录她扮护士为老人提供‘肉体看护’，包含口交、骑乘、连续中出。风格真实沉沦，擅长辈分凌辱，被誉为‘最危险的看护少女’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "白川美波",
    {
      "actors": ["白川美波"],
      "title": "母子姦 暴走母子沉溺于疯狂中出近亲相姦",
      "primaryName": "白川美波",
      "alternativeNames": ["白川みなみ", "白川美波"],
      "profileImage": "https://cdn.up-timely.com/image/6/actress_main/822916/1z6RTUtF8u1JD57NSmHnWkVWOpwwgKHJEqJHUMMz.jpg",
      "backgroundImage": "",
      "age": "38岁",
      "height": "162厘米",
      "weight": "56公斤",
      "nationality": "日本",
      "other": "胸围98（H罩杯） 腰围63 臀围91",
      "bio": "白川美波（1986年2月14日生）是日本禁断伦理系顶级熟女，以98cm H罩杯与母子姦真实感闻名。2024年1月《GVH-622》推出‘暴走母子姦’企划，真实记录她与亲生儿子从性觉醒到连续中出、母乳喷射、瑜伽体位凌辱的全过程。风格沉沦崩坏，擅长母性支配与近亲高潮，被誉为‘最危险的暴走母亲’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "青葉はる",
    {
      "actors": ["青葉はる"],
      "title": "我是最低的教师 放学后与制服的君做爱直到天亮",
      "primaryName": "青葉はる",
      "alternativeNames": ["青葉はる", "青叶春"],
      "profileImage": "https://static.wixstatic.com/media/e7de54_532256f8d4ed4b0f915dbe6c56a2842f~mv2.jpg/v1/fill/w_638,h_892,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/e7de54_532256f8d4ed4b0f915dbe6c56a2842f~mv2.jpg",
      "backgroundImage": "",
      "age": "26岁",
      "height": "158厘米",
      "weight": "46公斤",
      "nationality": "日本",
      "other": "胸围84（C罩杯） 腰围58 臀围85",
      "bio": "青葉はる（1997年生）是日本禁断师生系清纯女优，以学生制服与教师反差闻名。2024年《ARS-075》推出‘最低教师’企划，真实记录她扮补习班老师、放学后与学生在教室连续中出到天亮的全过程。风格纯欲沉沦，擅长制服凌辱与师生高潮，被誉为‘最危险的补习老师’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "日向由奈",
    {
      "actors": ["日向由奈"],
      "title": "抜かずの連撃中出し43発で孕ませた女子校生",
      "primaryName": "日向由奈",
      "alternativeNames": ["日向由奈", "日向由奈"],
      "profileName": "日向由奈",
      "profileImage": "https://image.xb1.com/profile/A2rGYjHZ8qMngAGAQtfXwlYWJzvCoeAOfrqC4hoo.jpg",
      "backgroundImage": "",
      "age": "18岁",
      "height": "148厘米",
      "weight": "38公斤",
      "nationality": "日本",
      "other": "胸围78（A罩杯） 腰围54 臀围80",
      "bio": "日向由奈（2005年生）是日本合法萝莉系超新星，以娇小身材与连续中出闻名。2024年《MIAA-123》推出‘43発孕ませ’企划，真实记录她在教室被拔かずの連撃43发中出、孕检阳性的全过程。风格真实凌辱，擅长学生制服与大量中出，被誉为‘最危险的合法孕ませJK’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "伊藤舞雪",
    {
      "actors": ["伊藤舞雪"],
      "title": "便利店妻子与打工短时不伦 后台30分快速中出",
      "primaryName": "伊藤舞雪",
      "alternativeNames": ["伊藤舞雪", "伊藤舞雪"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEQGs9S1TutfIqEj1mmRfATRzYv3f69q1uFRb5dQf2r06Dwfn8vBvDACHh&s=10",
      "backgroundImage": "",
      "age": "26岁",
      "height": "160厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸围98（J罩杯） 腰围60 臀围88",
      "bio": "伊藤舞雪（1997年8月30日生）是日本kawaii*巨乳人妻系王牌，以98cm J罩杯与真实感不伦闻名。2024年《CAWD-689》推出‘便利店短时不伦’，真实记录她扮人妻店长与打工学生在后台30分钟内快速中出、连续高潮的全过程。风格真实偷情，擅长制服诱惑与快速凌辱，被誉为‘最危险的便利店人妻’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "西野絵美",
    {
      "actors": ["西野絵美"],
      "title": "ずぶ濡れS級美少女のねっとり乳首責め！",
      "primaryName": "西野絵美",
      "alternativeNames": ["西野絵美", "西野绘美"],
      "profileImage": "https://image.tmdb.org/t/p/original/1xsKxBvjMGgorBcRUrBW1bgmwoj.jpg",
      "backgroundImage": "",
      "age": "22岁",
      "height": "158厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围88（F罩杯） 腰围57 臀围85",
      "bio": "西野絵美（1997年生）是日本MOODYZ S级痴女新星，以湿身透衣与乳首责め闻名。2019年《MIDE-684》推出‘ずぶ濡れ乳首責め’，真实记录她全身淋湿后用ねっとり乳首挑逗、连续榨精的全过程。风格诱惑凌辱，擅长湿身play与乳首调教，被誉为‘最危险的湿身美少女’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "黑崎玲衣",
    {
      "actors": ["黑崎玲衣"],
      "title": "先生的エグい口交更厉害哦？ 追击口交＆PtoM中出SEX",
      "primaryName": "黑崎玲衣",
      "alternativeNames": ["黒崎玲衣", "黑崎玲衣"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV2cUZoYcyWyRgh740-lJDIxYgXLTUA2R9h1dBs9OJDvIBGXdzxMYOelc&s=10",
      "backgroundImage": "",
      "age": "27岁",
      "height": "160厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围88（F罩杯） 腰围58 臀围86",
      "bio": "黑崎玲衣（1996年生）是日本痴女系口交女王，以真空深喉与追击口交闻名。2023年《PRED-500》推出‘先生エグい口交’企划，真实记录她在教室用エグい口交让学生连续射精、PtoM中出循环。风格强势凌辱，擅长口技调教与师生高潮，被誉为‘最危险的口交老师’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "筱田优",
    {
      "actors": ["筱田优"],
      "title": "夜店纤细虾反绝顶【人格崩坏】",
      "primaryName": "筱田优",
      "alternativeNames": ["篠田ゆう", "筱田优"],
      "profileImage": "https://cdn.suruga-ya.jp/database/pics_webp/game/gg483783.jpg.webp",
      "backgroundImage": "",
      "age": "31岁",
      "height": "155厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围88（F罩杯） 腰围58 臀围86",
      "bio": "筱田优（1991年7月21日生）是日本DAS!顶级痴女系女王，以极瘦腰肢与纤细虾反闻名。2022年《DASD-958》推出‘夜店人格崩坏’，真实记录她在夜店被媚药玩弄、夸张虾反高潮、连续中出失禁、精神崩溃的全过程。风格极致凌辱，擅长媚药调教与纤细痉挛，被誉为‘最危险的夜店女王’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "明里紬",
    {
      "actors": ["明里紬"],
      "title": "药物性爱人妻搜查官 被囚禁丈夫面前…媚药浸泡药物性爱废人STORY",
      "primaryName": "明里紬",
      "alternativeNames": ["明里つむぎ", "明里紬"],
      "profileImage": "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0502/users/2478dc66c8b73c2d28fca8e3fd08977d2a45933c/i-img818x1200-1707502151llkpws7.jpg",
      "backgroundImage": "",
      "age": "26岁",
      "height": "154厘米",
      "weight": "42公斤",
      "nationality": "日本",
      "other": "胸围80（B罩杯） 腰围55 臀围82",
      "bio": "明里紬（1998年3月31日生）是日本溜池ゴロー顶级人妻搜查官，以清纯外表与媚药崩坏闻名。2023年《MEYD-812》推出‘药物性爱人妻搜查官’，真实记录她潜入敌营被俘、在被绑架丈夫面前遭媚药注射、连续药物性爱高潮至人格废人化的全过程。风格极致凌辱，擅长搜查官堕落与媚药痉挛，被誉为‘最危险的媚药人妻搜查官’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "下部加奈",
    {
      "actors": ["下部加奈"],
      "title": "夜勤パート妻 夜幕的掩护下巨乳人妻沉醉出轨偷插",
      "primaryName": "下部加奈",
      "alternativeNames": ["下部加奈", "下部加奈"],
      "profileImage": "https://image.tmdb.org/t/p/original/2TaM3TT7ch2JlLOTdwJJ7YqejvH.jpg",
      "backgroundImage": "",
      "age": "32岁",
      "height": "165厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸围98（H罩杯） 腰围60 臀围90",
      "bio": "下部加奈（1991年生）是日本溜池ゴロー顶级巨乳人妻，以98cm H罩杯与夜勤NTR闻名。2023年《MEYD-813》推出‘夜勤パート妻’，真实记录她在便利店夜班被店长盯上、夜幕掩护下连续出轨偷插、背德高潮失禁的全过程。风格真实偷情，擅长巨乳凌辱与人妻崩坏，被誉为‘最危险的夜班巨乳人妻’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "东凛",
    {
      "actors": ["东凛"],
      "title": "明明死也不想理的继父…却因为酒精理性崩飞的我…",
      "primaryName": "东凛",
      "alternativeNames": ["東凛", "东凛"],
      "profileImage": "https://stat.dokusho-ojikan.jp/beedf044-7a4d-42a9-a028-6fe1d27a9e5a.jpg",
      "backgroundImage": "",
      "age": "29岁",
      "height": "168厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸围88（F罩杯） 腰围58 臀围86",
      "bio": "东凛（1994年生）是日本溜池ゴロー顶级厌恶系人妻，以高挑美腿与酒后崩坏闻名。2023年《MEYD-821》推出‘酒で理性が吹っ飛ぶ’，真实记录她对讨厌继父的憎恨、在酒精作用下理性崩溃、被连续中出至沉沦的全过程。风格背德凌辱，擅长酒后失控与继父NTR，被誉为‘最危险的酒后继女’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "深田咏美",
    {
      "actors": ["深田咏美"],
      "primaryName": "深田咏美",
      "alternativeNames": ["深田えいみ", "深田咏美"],
      "profileImage": "https://image.tmdb.org/t/p/original/h7akYxCZDIysR1EuXSt44myHRvQ.jpg",
      "backgroundImage": "",
      "age": "25岁",
      "height": "158厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸围88（G罩杯） 腰围55 臀围85",
      "bio": "深田咏美（1998年3月18日生）是日本PRESTIGE顶级痴女天后，以88cm G罩杯与逆推演技闻名。2019年《MIST-392》出道后迅速爆红，擅长痴女凌辱、连续榨精、逆3P等企划，被誉为‘最危险的G杯痴女女王’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "素人女优",
    {
      "actors": ["素人女优"],
      "title": "脑イキするまで何度でもイカせまくるドM女",
      "primaryName": "素人女优",
      "alternativeNames": ["素人女优", "素人女优"],
      "profileImage": "https://cs-a.ecimg.tw/items/DJBQ49D900FGSNL/000001_1662480731.jpg",
      "backgroundImage": "",
      "age": "23岁",
      "height": "160厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸围88（E罩杯） 腰围58 臀围86",
      "bio": "素人女优是日本DOC极致M女系列女主角，以脑内高潮与连续イカせ闻名。2023年《DOC-XXX》推出‘脑イキドM女’，真实记录她被绑缚玩弄、从普通素人调教至脑イキ崩溃、连续4回高潮失禁的全过程。风格极致凌辱，擅长M女开发与脑内高潮，被誉为‘最危险的脑イキ素人’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "相部屋馬拉",
    {
      "actors": ["相部屋馬拉"],
      "title": "相部屋馬拉 好色女上司 設計同房連續內射10發",
      "primaryName": "相部屋馬拉",
      "alternativeNames": ["相部屋マラ", "相部屋馬拉"],
      "profileImage": "https://m.media-amazon.com/images/I/81yCVhtClFL._AC_UF894,1000_QL80_.jpg",
      "backgroundImage": "",
      "age": "28岁",
      "height": "165厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸圍93（G罩杯） 腰圍59 臀圍88",
      "bio": "相部屋馬拉是日本WANZ痴女上司系列女主角，以93cm G罩杯與出差同房NTR聞名。2023年《WAAA-XXX》推出‘相部屋馬拉10發’，真實記錄她設計與部下同房、從深夜挑逗到清晨、連續內射10發榨乾的全過程。風格強勢背德，擅長女上司凌辱與同房榨精，被譽為‘最危險的出差上司’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "瀬田一花",
    {
      "actors": ["瀬田一花"],
      "title": "義姉ズボラちんを世話する代わりに…即ズボ中出しOKの下品ムチ肉ま●こ貸してもらってます。",
      "primaryName": "瀬田一花",
      "alternativeNames": ["瀬田一花", "濑田一花"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgCn4dpEPVB50nog5ByuMeAJycv84VXnWG0dg3DlNpCQRSLjVL8NZ8Fh8&s=10",
      "backgroundImage": "",
      "age": "24岁",
      "height": "158厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸围98（J罩杯） 腰围62 臀围92",
      "bio": "瀬田一花（1999年生）是日本WANZ超肉感义姐，以98cm J罩杯与下品ムチ肉ま●こ闻名。2024年《WAAA-410》推出‘義姉ズボラちん’，真实记录她代替邋遢弟弟打理生活、作为回报随时即ズボ中出しOK、150分钟连续榨精的全过程。风格肉感背德，擅长义姐凌辱与下品肉穴，被誉为‘最危险的J杯邋遢义姐’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "櫻茉日",
    {
      "actors": ["櫻茉日"],
      "title": "義父に巨乳を搾られ続けた7日間 汗だくでマゾ狂いに堕ちたサマーハズ記録",
      "primaryName": "櫻茉日",
      "alternativeNames": ["櫻茉日", "樱茉日"],
      "profileImage": "https://hk.on.cc/cnt/entertainment/20221222/photo/bkn-20221222210023473-1222_00862_001_03p.jpg?20221222210023",
      "backgroundImage": "",
      "age": "24岁",
      "height": "158厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸围100（K罩杯） 腰围60 臀围90",
      "bio": "櫻茉日（1999年生）是日本Fitch超爆乳义女，以100cm K罩杯與7日連續調教聞名。2023年《JUFE-470》推出‘義父7日間搾乳’，真實記錄她暑假被繼父盯上、從清純少女到汗だくマゾ狂い、連續搾乳中出崩壞的全過程。風格極致凌辱，擅長義父調教與爆乳痙攣，被譽為‘最危險的K杯義女’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "夏目響",
    {
      "actors": ["夏目響"],
      "title": "命名夏目響（ひびき）正式デビューお初の4本番",
      "primaryName": "夏目響",
      "alternativeNames": ["夏目響", "Natsume Hibiki"],
      "profileImage": "https://image.tmdb.org/t/p/w500/s7CH5vkW1OKIi0REVflnBz2qtcx.jpg",
      "backgroundImage": "",
      "age": "28岁",
      "height": "163厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围88（F罩杯） 腰围58 臀围88",
      "bio": "夏目響（1997年6月22日生）是日本SODSTAR神秘新人，以清纯笑容与F罩杯自然身材闻名。2020年3月以无名氏身份紧急AV出道，5月正式公布艺名并推出《STARS-236》，真实记录首次4本番挑战，包括羞耻初脱ぎ、连续高潮、喷潮演出。风格纯真大胆，擅长新人开发与自然高潮，被誉为‘最危险的神秘新人’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "並木愛菜",
    {
      "actors": ["並木愛菜"],
      "title": "我，和部下在公司里谈恋爱，有什么问题？ 在公司偷偷享受Hcup身体",
      "primaryName": "並木愛菜",
      "alternativeNames": ["並木あいな", "並木愛菜"],
      "profileImage": "https://cdn.up-timely.com/image/6/actress_main/823840/hr3UEsUiHCzp85JnUJU1a0BPSpUsdWhE0K7NHa2U.jpg",
      "backgroundImage": "",
      "age": "26岁",
      "height": "160厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸围88（G罩杯） 腰围55 臀围87",
      "bio": "並木愛菜（1999年6月30日生）是日本E-BODY巨乳社内恋爱系女优，以88cm G罩杯与清纯OL形象闻名。2022年10月出道，代表作《EBOD-947》以社内秘密Hcup身体主题广受好评。风格真实职场，擅长办公室偷情、连续中出演出，被誉为‘最危险的社内恋爱OL’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "橘瑪莉",
    {
      "actors": ["橘瑪莉"],
      "title": "打工處的人妻與不倫性交燃燒起來的日子",
      "primaryName": "橘瑪莉",
      "alternativeNames": ["橘メアリー", "橘瑪莉"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi5SPxmQjcK-8LRXQ797S1ajyoDKr__RvHLJqumh12OylIcsgo2aQR8u8&s=10g",
      "backgroundImage": "",
      "age": "32歲",
      "height": "160厘米",
      "weight": "52公斤",
      "nationality": "日本",
      "other": "胸圍93（G罩杯） 腰圍59 臀圍88",
      "bio": "橘瑪莉（1993年生）是日本DAJAPAN巨乳人妻系列女主角，以93cm G罩杯與職場不倫聞名。2023年《DVAJ-598》推出‘打工處人妻不倫’，真實記錄她在便利店打工與已婚女同事從日常互動到深夜倉庫、連續中出沉淪的全過程。風格真實背德，擅長職場偷情與人妻調教，被譽為‘最危險的便利店不倫人妻’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "末広純",
    {
      "actors": ["末広純"],
      "title": "バイト先の人妻と不倫性交に燃え上がった日々",
      "primaryName": "末広純",
      "alternativeNames": ["末広純", "末廣純"],
      "profileImage": "https://image.tmdb.org/t/p/original/59SFdoKzlO1uuJrtgk86f9zlwtJ.jpg",
      "backgroundImage": "",
      "age": "29歲",
      "height": "155厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸圍88（F罩杯） 腰圍58 臀圍86",
      "bio": "末廣純（1994年生）是日本DAJAPAN清純人妻系列女主角，以88cm F罩杯與便利店不倫聞名。2023年《DVAJ-616》推出‘バイト先人妻不倫’，真實記錄她在打工店與已婚女同事從日常互動到倉庫偷情、連續中出沉淪的全過程。風格真實背德，擅長職場偷情與人妻調教，被譽為‘最危險的便利店不倫人妻’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "宮村菜菜子",
    {
      "actors": ["宮村菜菜子"],
      "title": "女僕裝可愛侍奉 3P中出榨精",
      "primaryName": "宮村菜菜子",
      "alternativeNames": ["宮村ななこ", "宮村菜菜子"],
      "profileImage": "https://ignewsimg.s3.ap-northeast-1.wasabisys.com/CFEuC2CHxH4",
      "backgroundImage": "",
      "age": "24歲",
      "height": "153厘米",
      "weight": "45公斤",
      "nationality": "日本",
      "other": "胸圍88（F罩杯） 腰圍56 臀圍86",
      "bio": "宮村菜菜子（1999年生）是日本MOODYZ可愛女僕系女優，以88cm F罩杯與粉嫩女僕裝聞名。2020年《MIDE-XXX》推出‘女僕3P中出’，真實記錄她穿女僕裝服侍主人、從口交到騎乘、連續中出榨乾的全過程。風格極致侍奉，擅長女僕凌辱與中出連發，被譽為‘最危險的可愛女僕’。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "有馬瑞希",
    {
      "actors": ["有馬瑞希"],
      "title": "受虐調教孕ませ性交…恥辱的家庭訪問",
      "primaryName": "有馬瑞希",
      "alternativeNames": ["有馬みずき", "有馬瑞希"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFzwm-dCanCEQsj7D5fZafr6Mn6bioMHTDR69tJKj74t2JTr63wEDDh60w&s=10",
      "backgroundImage": "",
      "age": "25歲",
      "height": "158厘米",
      "weight": "48公斤",
      "nationality": "日本",
      "other": "胸圍88（F罩杯） 腰圍58 臀圍86",
      "bio": "有馬瑞希（1998年生）是日本歐若拉計劃超清純美人教師，以88cm F罩杯與墮落家庭訪問聞名。2023年《APNS-331》推出「孕ませ性交恥辱家庭訪問」，真實記錄她穿OL套裝上門輔導問題學生，卻被父子聯手調教、從抗拒到沉淪、連續中出懷孕的全過程。風格極致凌辱，擅長教師墮落與孕ませ調教，被譽為「最危險的F杯美人教師」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "虹村夢",
    {
      "actors": ["虹村夢"],
      "title": "令嬢調教 監禁30日懷孕中出毒的受虐女…「種付」",
      "primaryName": "虹村夢",
      "alternativeNames": ["虹村ゆめ", "虹村夢"],
      "profileImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3m4XYOM8TyWe9y4Ti_BFsT_ro8XCbcP2sAeIVxDV8X7kkLgFvo7dsIas&s=10",
      "backgroundImage": "",
      "age": "22歲",
      "height": "152厘米",
      "weight": "42公斤",
      "nationality": "日本",
      "other": "胸圍83（C罩杯） 腰圍56 臀圍84",
      "bio": "虹村夢（2003年生）是日本歐若拉計劃超嬌小千金，以152cm蘿莉身材與30日懷孕調教聞名。2024年《APNS-340》推出「令嬢調教 監禁30日間」，真實記錄她從名門千金被綁架、每天肉棒中毒開花、絕頂狂亂到徹底懷孕的全過程。風格極致監禁，擅長嬌小墮落與種付連擊，被譽為「最危險的30日受孕千金」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "星乃夏月",
    {
      "actors": ["星乃夏月"],
      "title": "美乳、特濃。「一直在高潮…一直在啊…」淫亂絶頂生徒會長 濃厚パイズリ409連發",
      "primaryName": "星乃夏月",
      "alternativeNames": ["星乃夏月", "Hoshino Natsuki"],
      "profileImage": "https://m.media-amazon.com/images/I/71jZ+aH1jIL._AC_UF1000,1000_QL80_.jpg",
      "backgroundImage": "",
      "age": "19歲",
      "height": "148厘米",
      "weight": "40公斤",
      "nationality": "日本",
      "other": "胸圍92（G罩杯） 腰圍55 臀圍84",
      "bio": "星乃夏月（2005年生）是日本歐若拉計劃超嬌小G杯生徒會長，以148cm蘿莉身材與409連發濃厚乳交聞名。2024年《APAK-264》推出「淫亂絶頂生徒會長」，真實記錄她穿水手服在教室被連續抽插、從「濃厚パイズリ」到「淫語連發失神」、全程50次以上高潮噴奶的全過程。風格極致抖M，擅長巨乳榨精與無限高潮，被譽為「最危險的148cm乳交怪物」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "仲村奈々美",
    {
      "actors": ["仲村奈々美"],
      "title": "尻貴族sports edition 滑雪隊長×仲村奈々美 尻愛的ハメ潮2連発！！",
      "primaryName": "仲村奈々美",
      "alternativeNames": ["仲村奈々美", "仲村奈奈美"],
      "profileImage": "https://pbs.twimg.com/profile_images/1456592426970521600/twix33vJ_400x400.jpg",
      "backgroundImage": "",
      "age": "24歲",
      "height": "160厘米",
      "weight": "50公斤",
      "nationality": "日本",
      "other": "胸圍88（F罩杯） 腰圍58 臀圍98",
      "bio": "仲村奈奈美（2000年生）是日本HMJM超肉感滑雪隊長，以98cm巨尻與「尻貴族」聞名。2019年《VGD-206》推出「尻愛ハメ潮2連発」，真實記錄她穿緊身瑜伽褲被狂插、從「デカ尻×ジョグタイツ」到「素人尻×車中後背位」、連續噴潮榨乾的全過程。風格極致肉彈，擅長巨尻騎乘與潮吹連發，被譽為「最危險的98cm滑雪尻貴族」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "星名千聖",
    {
      "actors": ["星名千聖"],
      "title": "女王様本格調教 4 真實女王SM調教全紀錄",
      "primaryName": "星名千聖",
      "alternativeNames": ["星名千聖", "星名千聖"],
      "profileImage": "https://pbs.twimg.com/profile_images/1855839551132184577/B7VwcDVc.jpg",
      "backgroundImage": "",
      "age": "32歲",
      "height": "168厘米",
      "weight": "55公斤",
      "nationality": "日本",
      "other": "胸圍92（F罩杯） 腰圍60 臀圍90",
      "bio": "星名千聖（1993年生）是日本AVS collector女王系最強女帝，以168cm高挑身材與真實SM調教聞名。2024年《GMEM-109》推出「REAL MISTRESS 4」，完整記錄她穿紅色漆皮女王裝、從鞭打到蠟燭、5位M男連續榨精、4小時極限調教的全過程。風格真實重口，擅長女王凌辱與肉體支配，被譽為「最危險的真實女王」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "西元美沙",
    {
      "actors": ["西元美沙"],
      "title": "逆NTR相房＆公司裡對上司的我最喜歡的美人部下…",
      "primaryName": "西元美沙",
      "alternativeNames": ["西元めいさ", "西元美沙"],
      "profileImage": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Kindai_Mahjong_Swimsuit_Festival_%28September%2C_2023%29IMG_1982.jpg",
      "backgroundImage": "",
      "age": "24歲",
      "height": "158厘米",
      "weight": "46公斤",
      "nationality": "日本",
      "other": "胸圍85（D罩杯） 腰圍56 臀圍84",
      "bio": "西元美沙（2001年生）是日本Planet Plus超反轉NTR系女優，以「主動誘惑上司」聞名。2024年《NACR-896》推出「逆NTR相房」，真實記錄她出差與上司同房→浴巾誘惑→騎乘位主導→連續中出到天亮的全過程。風格極致主動，擅長下屬逆推與公司不倫，被譽為「最危險的D杯肉食部下」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  [
    "奏音花音",
    {
      "actors": ["奏音花音"],
      "title": "中出到壞掉的一天 棒球部顧問與相房被徹底NTR",
      "primaryName": "奏音花音",
      "alternativeNames": ["奏音かのん", "奏音花音"],
      "profileImage": "https://pbs.twimg.com/profile_images/1918661762418892800/KVjeSUqx_400x400.jpg",
      "backgroundImage": "",
      "age": "19歲",
      "height": "148厘米",
      "weight": "39公斤",
      "nationality": "日本",
      "other": "胸圍83（C罩杯） 腰圍54 臀圍82",
      "bio": "奏音花音（2005年生）是日本無垢超嬌小棒球部經理，以148cm蘿莉身材與「顧問NTR」聞名。2024年《MUDR-257》推出「中出到壞掉的一天」，真實記錄她出征前與顧問同房→從「老師的大肉棒好燙…」到連續12發中出→子宮痙攣失神→最後穿水手服哭著求饒的全過程。風格極致純愛墮落，擅長蘿莉調教與完墮中出，被譽為「最危險的148cm肉便器經理」。",
      "galleryImages": [
        ""
      ]
    }
  ],
  ["", {
    "primaryName": "",
    "alternativeNames": [""],
    "profileImage": "",
    "backgroundImage": "",
    "age": "",
    "height": "",
    "weight": "",
    "nationality": "",
    "other": "",
    "bio": "",
    galleryImages: [
      "",
    ]
  }]
]);

// ========== สร้าง Name Mapping สำหรับการค้นหา ==========
// สร้างแผนที่ที่เชื่อมต่อชื่อทั้งหมด (primary + alternative) เข้ากับ primary name
const createNameMapping = () => {
  const nameMapping = new Map();

  actorProfiles.forEach((profile, primaryName) => {
    // เพิ่ม primary name
    nameMapping.set(primaryName, primaryName);

    // เพิ่ม alternative names
    profile.alternativeNames?.forEach(altName => {
      nameMapping.set(altName, primaryName);
    });
  });

  return nameMapping;
};

// สร้าง name mapping ครั้งเดียวตอนโหลด
const nameMapping = createNameMapping();

// ========== ฟังก์ชันจัดการข้อมูล ==========

// ฟังก์ชันแปลงชื่อใดๆ ให้เป็น primary name
const getPrimaryName = (actorName) => {
  return nameMapping.get(actorName) || actorName;
};

// ฟังก์ชันตรวจสอบว่าชื่อนี้มี profile หรือไม่
const hasActorProfile = (actorName) => {
  const primaryName = getPrimaryName(actorName);
  return actorProfiles.has(primaryName);
};

// ฟังก์ชันนับจำนวน vod_id ที่แยกด้วย comma (ปรับปรุงใหม่)
const countVideoIds = (vodIdString) => {
  if (!vodIdString || typeof vodIdString !== 'string') return 0;

  // แยก vod_id ด้วย comma และนับจำนวนที่ไม่ใช่ค่าว่าง
  return vodIdString
    .split(',')
    .map(id => id.trim())
    .filter(id => id && id.length > 0)
    .length;
};

// สร้างดัชนีสำหรับการค้นหานักแสดงไวขึ้น (ปรับปรุงใหม่)
const createActorIndex = () => {
  const actorIndex = new Map();

  actorsDatabase.forEach(item => {
    const videoCount = countVideoIds(item.vod_id);

    item.actors.forEach(actor => {
      // ใช้ primary name เป็น key
      const primaryName = getPrimaryName(actor);

      if (!actorIndex.has(primaryName)) {
        actorIndex.set(primaryName, []);
      }

      // เก็บข้อมูลรวมทั้งจำนวนวิดีโอ
      actorIndex.get(primaryName).push({
        vod_id: item.vod_id,
        title: item.title,
        videoCount: videoCount
      });
    });
  });

  return actorIndex;
};

// ดึงข้อมูลนักแสดงทั้งหมด (ปรับปรุงให้ไม่ซ้ำ และนับจำนวนวิดีโอที่ถูกต้อง)
export const getActorsData = (limit = 100) => {
  const actorIndex = createActorIndex();
  const actorStats = new Map();

  // นับจำนวนวิดีโอของแต่ละนักแสดง โดยใช้ primary name
  actorsDatabase.forEach(item => {
    const totalVideosInItem = countVideoIds(item.vod_id);

    item.actors.forEach(actor => {
      const primaryName = getPrimaryName(actor);

      if (!actorStats.has(primaryName)) {
        const profile = actorProfiles.get(primaryName);
        actorStats.set(primaryName, {
          id: primaryName,
          name: primaryName,
          alternativeNames: profile?.alternativeNames || [],
          videoCount: 0,
          videos: [],
          image: profile?.profileImage || `https://picsum.photos/400/400?random=${primaryName.charCodeAt(0)}`,
          hasProfile: !!profile
        });
      }

      const actorData = actorStats.get(primaryName);
      // ตรวจสอบไม่ให้นับซ้ำ
      const isDuplicate = actorData.videos.some(v => v.vod_id === item.vod_id);
      if (!isDuplicate) {
        actorData.videoCount += totalVideosInItem; // นับจำนวนวิดีโอจริงจาก vod_id
        actorData.videos.push({
          vod_id: item.vod_id,
          title: item.title,
          videoCount: totalVideosInItem
        });
      }
    });
  });

  // แปลงเป็น array และเรียงลำดับ
  const actors = Array.from(actorStats.values())
    .sort((a, b) => b.videoCount - a.videoCount)
    .slice(0, limit);

  return actors;
};

// ดึงข้อมูลโปรไฟล์นักแสดง (ปรับปรุงให้ดึงแค่ 1 profile และนับวิดีโอที่ถูกต้อง)
export const getActorProfile = (actorName) => {
  const primaryName = getPrimaryName(actorName);
  const actorIndex = createActorIndex();
  const actorVideos = actorIndex.get(primaryName) || [];
  const profile = actorProfiles.get(primaryName);

  if (profile) {
    // นับจำนวนวิดีโอรวมจากทุก vod_id
    const totalVideoCount = actorVideos.reduce((sum, item) => sum + item.videoCount, 0);

    return {
      ...profile,
      name: profile.primaryName, // ใช้ primary name เป็นชื่อหลัก
      videoCount: totalVideoCount, // จำนวนวิดีโอที่ถูกต้อง
      allNames: [profile.primaryName, ...profile.alternativeNames] // รายการชื่อทั้งหมด
    };
  }

  return;
};

// ดึงรูปแกลเลอรี่ของนักแสดง
export const getActorGalleryImages = (actorName) => {
  const primaryName = getPrimaryName(actorName);
  const profile = actorProfiles.get(primaryName);

  if (profile && profile.galleryImages) {
    return profile.galleryImages;
  }
  return [];
};

// ดึงวิดีโอของนักแสดง
export const getActorVideos = (actorName) => {
  const primaryName = getPrimaryName(actorName);
  const actorIndex = createActorIndex();
  const actorVideos = actorIndex.get(primaryName) || [];
  return actorVideos;
};

// ดึงนักแสดงที่เกี่ยวข้อง
export const getRelatedActorsData = (actorName, limit = 5) => {
  const primaryName = getPrimaryName(actorName);
  const actorIndex = createActorIndex();
  const currentActorVideos = actorIndex.get(primaryName) || [];

  if (currentActorVideos.length === 0) return [];

  // หานักแสดงอื่นๆ ที่อยู่ในวิดีโอเดียวกัน
  const relatedActors = new Set();

  currentActorVideos.forEach(video => {
    const videoInfo = actorsDatabase.find(item => item.vod_id === video.vod_id);
    if (videoInfo) {
      videoInfo.actors.forEach(actor => {
        const relatedPrimaryName = getPrimaryName(actor);
        if (relatedPrimaryName !== primaryName && relatedPrimaryName.trim()) {
          relatedActors.add(relatedPrimaryName);
        }
      });
    }
  });

  // แปลงเป็น array และดึงข้อมูลรายละเอียด
  const relatedActorNames = Array.from(relatedActors).slice(0, limit);
  const relatedActorDetails = [];

  for (const name of relatedActorNames) {
    const actorVideos = actorIndex.get(name) || [];
    const totalVideoCount = actorVideos.reduce((sum, item) => sum + item.videoCount, 0);
    const profile = actorProfiles.get(name);
    relatedActorDetails.push({
      id: name,
      name: name,
      alternativeNames: profile?.alternativeNames || [],
      image: profile?.profileImage || `https://picsum.photos/400/400?random=${name.charCodeAt(0)}`,
      videoCount: totalVideoCount
    });
  }

  return relatedActorDetails.sort((a, b) => b.videoCount - a.videoCount);
};

// ส่งออกข้อมูลสำหรับใช้งาน
export { actorsDatabase, actorProfiles, getPrimaryName, hasActorProfile };

// ฟังก์ชันคำนวณอันดับนักแสดงตามยอดวิว
export const getActorsWithRanking = (limit = 100) => {
  const actors = getActorsData(limit);

  // สมมติว่ายอดวิวมาจาก videoCount หรือข้อมูลอื่นๆ
  // คุณอาจต้องปรับปรุงส่วนนี้ให้ดึงยอดวิวจริงจาก API
  const actorsWithViews = actors.map(actor => ({
    ...actor,
    totalViews: actor.videoCount * 1000 // สมมติยอดวิว
  }));

  // จัดเรียงตามยอดวิวจากมากไปน้อย
  const sortedActors = [...actorsWithViews].sort((a, b) => b.totalViews - a.totalViews);

  // กำหนดอันดับให้กับ 3 อันดับแรก
  return sortedActors.map((actor, index) => ({
    ...actor,
    rank: index < 3 ? index + 1 : 0 // 0 = ไม่ติดอันดับ
  }));
};

// ฟังก์ชันดึงข้อมูลนักแสดงพร้อมอันดับสำหรับ ProfilePage
export const getTopActors = () => {
  return getActorsWithRanking(3).filter(actor => actor.rank > 0);
};