import type { Guide } from '../../shared/types.js'

// 行前須知。規定與票價可能變動，出發前請以官方公告為準
// 2026-10 查核：預辦入境登記每次可逗留 30 天（入境處）；叮叮車成人單程 2026 年 4 月起為 HK$3.3
export const hongkongGuides: Guide[] = [
  {
    id: 'entry',
    icon: 'passport',
    title: '出入境與簽證',
    highlights: [
      '網簽（預辦入境登記）免費，效期 2 個月、可入境 2 次',
      '持有效台胞證可直接免簽入境，最長 30 天',
    ],
    items: [
      {
        label: '台灣居民預辦入境登記（網簽）',
        text: '免費，須於出發前在「香港入境事務處」網站申請，填妥資料後列印出來。效期 2 個月，可入境 2 次，每次最長停留 30 天。',
      },
      {
        label: '台胞證',
        text: '若持有有效期限內的台胞證，可直接免簽入境香港（最長停留 30 天），無需另辦網簽。',
      },
      {
        label: '注意',
        text: '入境時須持有效期 6 個月以上的回台旅行證件；取得網簽通知書不代表一定可以入境，仍須通過入境檢查。',
      },
    ],
    sourceUrl: 'https://www.immd.gov.hk/hkt/services/visas/pre-arrival_registration_for_taiwan_residents.html',
  },
  {
    id: 'funpass',
    icon: 'ticket',
    title: '香港 FunPASS（豪華 3 合 1）',
    highlights: [
      '山頂纜車須在出遊前一日 23:50 前於 App 預約',
      '張保仔號名額熱門，領到序號就盡早預約船班',
      '效期：自第一個預約或核銷日起 14 天',
    ],
    items: [
      {
        label: '票券機制',
        text: '豪華 3 合 1 包含 1 個「經典高價景點」（如：張保仔號夜遊維港）＋ 2 個「熱門門票／交通」（如：太平山頂纜車＋摩天台 428、電車全景遊＋2 日叮叮車券）。',
      },
      {
        label: 'App 操作',
        text: '購買後下載 HONG KONG FunPASS App，輸入序號綁定。',
      },
      {
        label: '強制預約規定',
        text: '以下景點須事先在 App 預約：',
        points: [
          '山頂纜車：須最晚於出遊前一日 23:50 前完成預約。',
          '張保仔號夜遊維港：名額極度熱門，建議領取序號後盡早預約確定船班時間。',
        ],
      },
      {
        label: '效期與開通',
        text: '景點憑證自第一個預約或開票核銷日起計算 14 天內有效。',
      },
    ],
  },
  {
    id: 'transit',
    icon: 'transit',
    title: '當地交通',
    highlights: [
      '必備八達通（實體卡或 Apple Wallet 旅客版）',
      '叮叮車單程 HK$3.3，本行程附 2 日無限搭乘',
      '港鐵可用八達通或 Visa／Mastercard 感應過閘',
    ],
    items: [
      {
        label: '八達通卡（Octopus Card）',
        text: '香港旅遊必備，實體卡或 iPhone 內建「Apple Wallet 旅客版八達通」皆可，適用於港鐵（MTR）、巴士、叮叮車及便利商店。',
      },
      {
        label: '叮叮車（Tram）',
        text: '僅行駛於香港島（堅尼地城 ↔ 筲箕灣），後門上車、前門下車刷卡或付現，成人單程 HK$3.3（約 NT$13）。本行程第 12 站「電車全景遊」免費贈送 2 日叮叮車無限搭乘通行證，適合穿梭港島美食景點。',
      },
      {
        label: '港鐵與巴士',
        text: '港鐵可用八達通或 Visa／Mastercard 感應過閘；巴士上車刷卡，下車免刷卡。',
      },
    ],
  },
  {
    // 匯率換算：前端以計算機卡片呈現，這裡是抽屜中的完整說明
    id: 'exchange',
    icon: 'currency',
    title: '匯率換算',
    highlights: [
      '1 港幣約 4.1 新台幣（計算機使用每日更新的參考匯率）',
      '心算：港幣 × 4，再多加一點',
    ],
    items: [
      {
        label: '幣別',
        text: '香港使用港幣（HKD，符號 HK$）。本網站列出的花費皆已換算為新台幣（NT$）。',
      },
      {
        label: '參考匯率',
        text: '計算機預設使用 ExchangeRate-API 每日更新的參考匯率（國際中間價），約 1 HKD ≈ 4.1 TWD。銀行換匯或刷卡的實際匯率會略差一些，可在計算機中改成自己銀行的匯率。',
      },
      {
        label: '心算技巧',
        text: '港幣金額 × 4 再多加一點就是台幣，例如 HK$50 ≈ NT$206。',
      },
      {
        label: '換匯與刷卡',
        text: '可在出發前於台灣的銀行先換港幣現金，機場換匯的匯率通常較差。',
        points: [
          '海外刷卡多數信用卡會收約 1.5% 的國外交易手續費，依卡片而定。',
          '刷卡時若被詢問以哪種幣別結帳，選擇「港幣」通常較划算，避免動態貨幣轉換的額外費用。',
        ],
      },
    ],
    sourceUrl: 'https://www.exchangerate-api.com',
  },
]
