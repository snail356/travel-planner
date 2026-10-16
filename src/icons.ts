import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBed,
  faBus,
  faFerry,
  faMoneyBillTransfer,
  faPassport,
  faPersonWalking,
  faPlane,
  faPlaneDeparture,
  faTaxi,
  faTicket,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons'
import type { GuideIcon, PlaceKind, TransportIcon } from '../shared/types'

export const transportIcons: Record<TransportIcon, IconDefinition> = {
  plane: faPlane,
  ticket: faTicket,
  tram: faTrainTram,
  subway: faTrainSubway,
  bus: faBus,
  ferry: faFerry,
  taxi: faTaxi,
  walk: faPersonWalking,
}

export const guideIcons: Record<GuideIcon, IconDefinition> = {
  passport: faPassport,
  ticket: faTicket,
  transit: faTrainSubway,
  currency: faMoneyBillTransfer,
}

export const placeIcons: Record<PlaceKind, IconDefinition> = {
  hotel: faBed,
  airport: faPlaneDeparture,
}
