import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { PlansList } from "@/components/plans-list"
import { QuickStats } from "@/components/quick-stats"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's plans
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground">Here&apos;s what you have planned</p>
          </div>

          <QuickStats plans={plans || []} />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PlansList plans={plans || []} />
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <a
                    href="/dashboard/new-plan"
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Plan
                  </a>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {plans
                    ?.filter((plan) => !plan.completed && new Date(plan.due_date) > new Date())
                    .slice(0, 3)
                    .map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{plan.title}</span>
                        <span className="text-muted-foreground">{new Date(plan.due_date).toLocaleDateString()}</span>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No upcoming deadlines</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
