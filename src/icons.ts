import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBed,
  faBus,
  faFerry,
  faPersonWalking,
  faPlane,
  faPlaneDeparture,
  faTaxi,
  faTicket,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons'
import type { PlaceKind, TransportIcon } from '../shared/types'

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

export const placeIcons: Record<PlaceKind, IconDefinition> = {
  hotel: faBed,
  airport: faPlaneDeparture,
}
