import handler from '@/lib/server/handlers/backup'
import { route } from '@/lib/server/adapter'

export const dynamic = 'force-dynamic'

const h = route(handler)
export { h as GET, h as POST }
