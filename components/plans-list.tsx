"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface Plan {
  id: string
  title: string
  description: string | null
  due_date: string
  completed: boolean
  created_at: string
}

interface PlansListProps {
  plans: Plan[]
}

export function PlansList({ plans: initialPlans }: PlansListProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [loading, setLoading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const toggleComplete = async (planId: string, completed: boolean) => {
    setLoading(planId)
    try {
      const { error } = await supabase.from("plans").update({ completed: !completed }).eq("id", planId)

      if (error) throw error

      setPlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, completed: !completed } : plan)))
      router.refresh()
    } catch (error) {
      console.error("Error updating plan:", error)
    } finally {
      setLoading(null)
    }
  }

  const deletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }

    setDeleting(planId)
    try {
      const { error } = await supabase.from("plans").delete().eq("id", planId)

      if (error) throw error

      setPlans((prev) => prev.filter((plan) => plan.id !== planId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting plan:", error)
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now

    return {
      formatted: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }),
      isOverdue,
    }
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first plan to stay organized and productive.
          </p>
          <Button asChild>
            <Link href="/dashboard/new-plan">Create Your First Plan</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Plans</h2>
        <Button asChild size="sm">
          <Link href="/dashboard/new-plan">New Plan</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => {
          const { formatted: formattedDate, isOverdue } = formatDate(plan.due_date)

          return (
            <Card key={plan.id} className={plan.completed ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleComplete(plan.id, plan.completed)}
                      disabled={loading === plan.id}
                      className="mt-1 flex-shrink-0"
                    >
                      <div
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          plan.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground hover:border-primary"
                        }`}
                      >
                        {plan.completed && (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    <div className="flex-1">
                      <Link href={`/dashboard/plans/${plan.id}`} className="block hover:text-primary">
                        <h3 className={`font-medium ${plan.completed ? "line-through" : ""}`}>{plan.title}</h3>
                      </Link>
                      {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={plan.completed ? "secondary" : isOverdue ? "destructive" : "outline"}>
                      {plan.completed ? "Completed" : isOverdue ? "Overdue" : formattedDate}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/plans/${plan.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/plans/${plan.id}/edit`}>Edit Plan</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePlan(plan.id)}
                          disabled={deleting === plan.id}
                          className="text-destructive focus:text-destructive"
                        >
                          {deleting === plan.id ? "Deleting..." : "Delete Plan"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
