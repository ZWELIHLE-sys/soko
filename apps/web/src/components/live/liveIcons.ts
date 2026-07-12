import {
  Megaphone, PartyPopper, Store, AlarmClock, Gavel,
  type LucideIcon,
} from 'lucide-react'

// One icon per announcement kind — shared by the banner strip and the in-page MC feed
export const KIND_ICONS: Record<string, LucideIcon> = {
  GENERAL:     Megaphone,
  WELCOME:     PartyPopper,
  SPOTLIGHT:   Store,
  LAST_CHANCE: AlarmClock,
  HAMMER:      Gavel,
}

export function kindIcon(kind: string): LucideIcon {
  return KIND_ICONS[kind] ?? Megaphone
}
