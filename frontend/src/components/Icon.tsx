import { Store, Boxes, CalendarCheck, Gift, Globe, FileText, Users, Utensils, Contact, LineChart, MessageSquare, Wrench, Smartphone, Bot, Workflow, Plug, ShoppingCart, Database, PenTool, MessagesSquare, LifeBuoy, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react';
const MAP: Record<string, LucideIcon> = { store: Store, boxes: Boxes, 'calendar-check': CalendarCheck, gift: Gift, globe: Globe, 'file-text': FileText, users: Users, utensils: Utensils, contact: Contact, 'line-chart': LineChart, 'message-square': MessageSquare, wrench: Wrench, smartphone: Smartphone, bot: Bot, workflow: Workflow, plug: Plug, 'shopping-cart': ShoppingCart, database: Database, 'pen-tool': PenTool, 'messages-square': MessagesSquare, 'life-buoy': LifeBuoy, 'graduation-cap': GraduationCap };
export default function Icon({ name, size = 26 }: { name?: string | null; size?: number }) {
  const C = (name && MAP[name]) || Sparkles;
  return <C size={size} strokeWidth={1.8} aria-hidden="true" />;
}
