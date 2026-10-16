import type { DayNo, DayPlan, Stop, Trip } from '../../shared/types.js'
import { hongkongPhotos } from './hongkong-photos.js'

// 動線（依地理區域與最佳順序排列）：站點的天數與造訪順序以這裡為準，站號維持原始編號
const dayPlans: DayPlan[] = [
  {
    day: 1,
    title: '港島精華、山頂夜景與維港夜遊',
    slots: [
      { label: '上午／午餐', stopIds: [1, 4] },
      { label: '下午・中環散步與烘焙', stopIds: [6, 3] },
      { label: '傍晚・太平山夜景', stopIds: [5, 7] },
      { label: '夜晚・維港遊船與港式大排檔', stopIds: [8, 9, 10] },
    ],
  },
  {
    day: 2,
    title: '港島懷舊巡禮、叮叮車美食與購物',
    slots: [
      { label: '早餐／上午', stopIds: [11, 12] },
      { label: '午餐／下午茶', stopIds: [13, 2] },
      { label: '晚餐／伴手禮', stopIds: [18, 14, 15] },
    ],
  },
  {
    day: 3,
    title: '九龍熱門打卡、美味麵包與返台',
    slots: [
      { label: '上午', stopIds: [17, 16] },
      { label: '午餐／點心', stopIds: [19] },
    ],
    endNote: '下午・取行李前往機場返台',
  },
]

/**
 * 依動線補上每站的天數，並合併照片（照片另外放在 hongkong-photos.ts，避免長網址讓站點表難讀）。
 * 每一站都必須且只能出現在動線中一次，否則啟動時就報錯。
 */
function buildStops(stops: Omit<Stop, 'day'>[]): Stop[] {
  const dayOf = new Map<number, DayNo>()
  for (const plan of dayPlans) {
    for (const id of plan.slots.flatMap(slot => slot.stopIds)) {
      if (dayOf.has(id)) throw new Error(`第 ${id} 站在動線中重複出現`)
      dayOf.set(id, plan.day)
    }
  }
  return stops.map(s => {
    const day = dayOf.get(s.id)
    if (!day) throw new Error(`第 ${s.id} 站（${s.name}）沒有排進動線`)
    return { ...s, day, ...hongkongPhotos[s.id] }
  })
}

// 種子資料：部分地址與座標為暫定，待確認
export const hongkongTrip: Trip = {
  id: 'hongkong-3d2n',
  title: '快閃香港三天兩夜',
  subtitle: '行程 + 美食全攻略・19 個停留點',
  days: 3,
  nights: 2,
  avgCostPerPerson: 15108,
  hotel: {
    name: 'OTTO HOTEL',
    nights: 2,
    price: 9812,
  },
  transports: [
    {
      icon: 'plane',
      title: '機票：香港快運',
      summary: '來回 NT$4,768／人',
      items: ['去程航班：待補', '回程航班：待補'],
    },
    {
      icon: 'ticket',
      title: '香港 FunPASS（豪華 3 合 1）',
      summary: 'NT$2,480／人・可選港澳 30+ 熱門景點',
      items: [
        '張保仔號、太平山山頂纜車、昂坪 360、機場快線往返票…',
        '四種套票：2 合 1／3 合 1／豪華 3 合 1／澳門版',
        '可先預約，省去排隊買票時間',
        '本次省下約 6% 門票（最高可省 56%）',
      ],
    },
    {
      icon: 'tram',
      title: '叮叮車',
      summary: '電車全景遊附贈 2 日叮叮車無限搭乘票',
      items: [],
    },
    {
      icon: 'subway',
      title: '市區交通',
      summary: '地鐵 / 八達通使用說明：待補',
      items: [],
    },
  ],
  costs: [
    { label: '香港 FunPASS（豪華 3 合 1）', amount: 2480, unit: '人' },
    { label: '機票：香港快運來回', amount: 4768, unit: '人' },
    { label: '住宿：OTTO HOTEL 兩晚', amount: 9812 },
  ],
  dayPlans,
  places: [
    {
      id: 'hotel-otto',
      kind: 'hotel',
      name: 'OTTO HOTEL',
      area: '尖沙咀（待確認）',
      lat: 22.2995,
      lng: 114.1733,
      desc: '住宿兩晚，NT$9,812。位置待確認。',
    },
    {
      id: 'airport-hkg',
      kind: 'airport',
      name: '香港國際機場',
      area: '赤鱲角',
      lat: 22.308,
      lng: 113.9185,
      desc: '搭香港快運往返。可用 FunPASS 的機場快線往返票進市區。',
    },
  ],
  stops: buildStops([
    { id: 1,  name: '一點心',           type: 'food', price: 880,  area: '太子',   lat: 22.3247, lng: 114.1686, desc: '米其林推薦平價點心。' },
    { id: 2,  name: '蘭苑饎館',         type: 'food', price: 177,  area: '待確認', lat: 22.2840, lng: 114.1545, desc: '說明待補。' },
    { id: 3,  name: 'HashtagB',         type: 'food', price: 72,   area: '銅鑼灣', lat: 22.2803, lng: 114.1845, desc: '人氣烘焙店，招牌拿破崙焦糖千層塔。' },
    { id: 4,  name: '霸王茶姬',         type: 'food', price: 128,  area: '待確認', lat: 22.2812, lng: 114.1820, desc: '人氣茶飲。' },
    { id: 5,  name: '太平山山頂纜車',   type: 'spot', pass: true,  area: '中環',   lat: 22.2777, lng: 114.1595, desc: 'FunPASS 可用，搭纜車上太平山頂。' },
    { id: 6,  name: 'Bake House',       type: 'food', price: 56,   area: '灣仔',   lat: 22.2744, lng: 114.1720, desc: '超人氣酸種蛋塔。' },
    { id: 7,  name: '凌霄閣摩天台 428', type: 'spot', pass: true,  area: '山頂',   lat: 22.2711, lng: 114.1497, desc: 'FunPASS 可用，360° 俯瞰維港夜景。' },
    { id: 8,  name: '張保仔號',         type: 'spot', pass: true,  area: '維港',   lat: 22.2935, lng: 114.1690, desc: 'FunPASS 可用，古帆船遊維港。', note: '搭船從中環跨海至尖沙咀' },
    { id: 9,  name: '妹記大排檔',       type: 'food', price: 1994, area: '待確認', lat: 22.3300, lng: 114.1620, desc: '港式大排檔熱炒。' },
    { id: 10, name: 'ChaTraMue',        type: 'food', price: 128,  area: '待確認', lat: 22.2990, lng: 114.1720, desc: '泰式手標茶飲。' },
    { id: 11, name: '瑞記咖啡',         type: 'food', price: 313,  area: '待確認', lat: 22.2850, lng: 114.1520, desc: '港式茶餐廳。' },
    { id: 12, name: '電車全景遊',       type: 'spot', pass: true,  area: '港島',   lat: 22.2870, lng: 114.1500, desc: 'FunPASS 可用，開通後贈送 2 日叮叮車無限搭乘票。' },
    { id: 13, name: '丹麥餅店',         type: 'food', price: 84,   area: '待確認', lat: 22.2790, lng: 114.1870, desc: '老字號麵包店。' },
    { id: 14, name: '珍妮曲奇',         type: 'food', price: 320,  area: '尖沙咀', lat: 22.2975, lng: 114.1722, desc: '必買伴手禮小熊曲奇。', note: '買完先回飯店放置' },
    { id: 15, name: '海底撈',           type: 'food',               area: '待確認', lat: 22.2985, lng: 114.1735, desc: '火鍋。' },
    { id: 16, name: '彩虹邨',           type: 'spot',               area: '彩虹',   lat: 22.3325, lng: 114.2075, desc: '彩色公屋打卡點，免費。' },
    { id: 17, name: '嘉多娜麵包店',     type: 'food', price: 60,   area: '待確認', lat: 22.3305, lng: 114.2040, desc: '說明待補。' },
    { id: 18, name: '旗子燒鵝',         type: 'food', price: 464,  area: '待確認', lat: 22.3280, lng: 114.1910, desc: '燒鵝燒味。' },
    { id: 19, name: '紅茶冰室',         type: 'food', price: 172,  area: '待確認', lat: 22.3290, lng: 114.1895, desc: '港式冰室。' },
  ]),
}
