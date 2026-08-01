import type { EmployeeCard } from '@/entities/dashboard'

import { EmployeeCoaching } from './employee-coaching'
import { EmployeeConversations } from './employee-conversations'
import { EmployeeKpis } from './employee-kpis'
import { EmployeeRubric } from './employee-rubric'
import { EmployeeTrend } from './employee-trend'

/**
 * The whole employee card.
 *
 * `/dashboard/employees/{id}` and `/dashboard/me` return the identical payload,
 * so the manager view and the employee cabinet render exactly this component —
 * only the query above it differs (docs/05).
 */
export function EmployeeCardBody({ card }: { card: EmployeeCard }) {
  return (
    <div className="space-y-5">
      <EmployeeKpis card={card} />

      <div className="grid gap-5 xl:grid-cols-2">
        <EmployeeTrend daily={card.daily} />
        <EmployeeConversations
          best={card.best_conversations}
          worst={card.worst_conversations}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <EmployeeRubric card={card} />
      </div>

      <EmployeeCoaching coaching={card.coaching} />
    </div>
  )
}
