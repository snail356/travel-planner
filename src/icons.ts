import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBus,
  faFerry,
  faPersonWalking,
  faPlane,
  faTaxi,
  faTicket,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons'
import type { TransportIcon } from '../shared/types'

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
