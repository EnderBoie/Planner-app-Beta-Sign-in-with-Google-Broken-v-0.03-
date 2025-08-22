import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the specific plan
  const { data: plan, error } = await supabase.from("plans").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !plan) {
    notFound()
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now && !plan.completed

    return {
      formatted: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isOverdue,
    }
  }

  const { formatted: formattedDate, time, isOverdue } = formatDate(plan.due_date)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard" className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className={`text-2xl ${plan.completed ? "line-through opacity-60" : ""}`}>
                    {plan.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.completed ? "secondary" : isOverdue ? "destructive" : "outline"}>
                      {plan.completed ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/plans/${plan.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {plan.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{plan.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Due Date</h3>
                  <p className={isOverdue ? "text-destructive" : ""}>{formattedDate}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Due Time</h3>
                  <p className={isOverdue ? "text-destructive" : ""}>{time}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <p>{plan.completed ? "Completed" : "Pending"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p>{new Date(plan.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
