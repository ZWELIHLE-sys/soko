import {
  Megaphone, PartyPopper, Store, AlarmClock, Gavel, Sunset,
  TrendingUp, Sprout,
  type LucideIcon,
} from 'lucide-react'

// One icon per announcement kind — shared by the banner strip and the in-page MC feed.
// BID and HARVEST are auto-moment kinds (the crowd noise), never sent by the admin.
export const KIND_ICONS: Record<string, LucideIcon> = {
  GENERAL:     Megaphone,
  WELCOME:     PartyPopper,
  SPOTLIGHT:   Store,
  LAST_CHANCE: AlarmClock,
  HAMMER:      Gavel,
  CLOSING:     Sunset,
  BID:         TrendingUp,
  HARVEST:     Sprout,
}

export function kindIcon(kind: string): LucideIcon {
  return KIND_ICONS[kind] ?? Megaphone
}
