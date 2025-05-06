"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import AppLayout from "@/components/layout/app-layout"
import TaskModal from "@/components/tasks/task-modal"
import { Task } from "@/components/tasks/task"
import { redirect } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { useDispatch } from "react-redux"
import { login, logout } from "@/lib/features/auth/authSlice"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user);

  const filteredTasks = selectedCategory === "All" ? tasks : tasks.filter((task) => task.category === selectedCategory)

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      if (!accessToken) {
        throw new Error("Authorization failed, please sign in")
      }
      async function fetchUser() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        dispatch(login(data))
      }
      async function fetchTasks() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        if (data.length === 0)
          return;
        setTasks(data)
      }
      if (!user) {
        fetchUser()
      }
      if (tasks.length === 0) {
        fetchTasks()
      }
    } catch (error) {
      console.error(error)
      redirect('/login')
    }
  }, [user, tasks, dispatch])

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!isAuthenticated && !accessToken) {
      redirect('/login')
    }
  }, [isAuthenticated])

  // new code
  const handleStatusChange = async (taskId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout())
    }

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const newStatus = !taskToUpdate.isCompleted;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ isCompleted: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      );

    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout())
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      setTasks(tasks.filter((task) => task.id !== taskId));

    } catch (error) {
      console.error("Error deleting task:", error);
      // NOTE: use toasts
    }
  };

  const handleSaveTask = async (task: Partial<Task>) => { // Use Partial for new tasks
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout())
    }

    if (task.id) { // Existing task (Update)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${task.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(task) // Send the updated task object
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

      } catch (error) {
        console.error("Error updating task:", error);
      }

    } else { // New task (Create)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(task) // Send the new task object
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create task");
        }

        const newTask = await response.json();
        setTasks([...tasks, newTask]);

      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
    setIsModalOpen(false);
    setCurrentTask(null); // Reset currentTask after saving
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = () => {
    setCurrentTask(null)
    setIsModalOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Welcome, {user?.username ?? "Loading username"}</h1>
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
                  <Badge variant={task.isCompleted ? "default" : "secondary"}>{task.isCompleted ? "Completed" : "Pending"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not Specified"}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.isCompleted}
                    onCheckedChange={() => handleStatusChange(task.id)}
                  />
                  <label htmlFor={`task-${task.id}`} className="text-xs font-medium">
                    {task.isCompleted ? "Completed" : "Mark as completed"}
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
        onCloseAction={() => setIsModalOpen(false)}
        onSaveAction={handleSaveTask}
        task={currentTask}
      />
    </AppLayout>
  )
}
