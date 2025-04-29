"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import AppLayout from "@/components/layout/app-layout"
import TaskModal from "@/components/tasks/task-modal"

// Mock data for tasks
const initialTasks = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Finish the draft and send it to the client for review",
    dueDate: "2023-05-20",
    category: "Work",
    status: "Pending",
  },
  {
    id: "2",
    title: "Buy groceries",
    description: "Milk, eggs, bread, and vegetables",
    dueDate: "2023-05-18",
    category: "Shopping",
    status: "Completed",
  },
  {
    id: "3",
    title: "Schedule dentist appointment",
    description: "Call Dr. Smith's office to schedule a checkup",
    dueDate: "2023-05-25",
    category: "Personal",
    status: "Pending",
  },
]

export default function DashboardPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)

  // In a real app, you would get the user from Redux state
  const user = { name: "John" }

  const filteredTasks = selectedCategory === "All" ? tasks : tasks.filter((task) => task.category === selectedCategory)

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleStatusChange = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: task.status === "Completed" ? "Pending" : "Completed" } : task,
      ),
    )
  }

  const handleEditTask = (task: any) => {
    setCurrentTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const handleAddTask = () => {
    setCurrentTask(null)
    setIsModalOpen(true)
  }

  const handleSaveTask = (task: any) => {
    if (task.id) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    } else {
      // Add new task
      const newTask = {
        ...task,
        id: Date.now().toString(),
        status: "Pending",
      }
      setTasks([...tasks, newTask])
    }
    setIsModalOpen(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <Button onClick={handleAddTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Category:</span>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge variant={task.status === "Completed" ? "secondary" : "default"}>{task.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status === "Completed"}
                    onCheckedChange={() => handleStatusChange(task.id)}
                  />
                  <label htmlFor={`task-${task.id}`} className="text-xs font-medium">
                    {task.status === "Completed" ? "Completed" : "Mark as completed"}
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategory === "All"
                  ? "You don't have any tasks yet. Create one to get started!"
                  : `You don't have any ${selectedCategory} tasks.`}
              </p>
              <Button variant="outline" className="mt-4" onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={currentTask}
      />
    </AppLayout>
  )
}
