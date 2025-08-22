import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { EditPlanForm } from "@/components/edit-plan-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/plans/${plan.id}`} className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Plan
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
            <p className="text-muted-foreground">Update your plan details</p>
          </div>

          <EditPlanForm plan={plan} />
        </div>
      </main>
    </div>
  )
}
