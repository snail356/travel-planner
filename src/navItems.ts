import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBed,
  faCameraRetro,
  faPlane,
  faRoute,
  faUtensils,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'

export interface NavItem {
  href: string
  label: string
  en: string
  icon: IconDefinition
}

// 首頁快捷列與手機底部 tab bar 共用
export const navItems: Record<'route' | 'food' | 'spots' | 'stay' | 'transport' | 'cost', NavItem> = {
  route: { href: '#itinerary', label: '行程', en: 'ROUTE', icon: faRoute },
  food: { href: '#food', label: '美食', en: 'FOOD', icon: faUtensils },
  spots: { href: '#spots', label: '景點', en: 'SPOTS', icon: faCameraRetro },
  stay: { href: '#hotel', label: '住宿', en: 'STAY', icon: faBed },
  transport: { href: '#transport', label: '交通', en: 'GO', icon: faPlane },
  cost: { href: '#cost', label: '花費', en: 'BUDGET', icon: faWallet },
}
