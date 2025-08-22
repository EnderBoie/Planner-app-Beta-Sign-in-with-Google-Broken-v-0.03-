"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Plan {
  id: string
  title: string
  description: string | null
  due_date: string
  completed: boolean
}

interface EditPlanFormProps {
  plan: Plan
}

export function EditPlanForm({ plan }: EditPlanFormProps) {
  const [title, setTitle] = useState(plan.title)
  const [description, setDescription] = useState(plan.description || "")
  const [dueDate, setDueDate] = useState(plan.due_date.split("T")[0])
  const [dueTime, setDueTime] = useState(plan.due_date.includes("T") ? plan.due_date.split("T")[1].substring(0, 5) : "")
  const [completed, setCompleted] = useState(plan.completed)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const dueDateTimeString = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:59`
      const dueDateTimeISO = new Date(dueDateTimeString).toISOString()

      const { error } = await supabase
        .from("plans")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDateTimeISO,
          completed,
        })
        .eq("id", plan.id)

      if (error) throw error

      router.push(`/dashboard/plans/${plan.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("plans").delete().eq("id", plan.id)

      if (error) throw error

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Plan Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="What do you need to do?"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your plan (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={today}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Completion Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="Select time"
              />
              <p className="text-xs text-muted-foreground">
                {dueTime ? `Due at ${dueTime}` : "Defaults to 11:59 PM if not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="completed"
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="completed">Mark as completed</Label>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/plans/${plan.id}`)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete Plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
