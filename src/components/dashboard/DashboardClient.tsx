"use client";

import { useEffect, useState, useCallback } from "react";
import { redirect } from "next/navigation";
import { useDispatch } from "react-redux";
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TaskModal from "@/components/tasks/task-modal";
import { Task } from "@/components/tasks/task"; // Assuming this type definition exists
import { useAppSelector } from "@/lib/hooks";
import { login, logout } from "@/lib/features/auth/authSlice";
import { toast } from "@/components/ui/use-toast"; // Import useToast

export default function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const filteredTasks = selectedCategory === "All" ? tasks : tasks.filter((task) => task.category === selectedCategory);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const fetchUserDataAndTasks = useCallback(async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      dispatch(logout()); // Ensure state is cleared
      redirect('/login');
    }

    try {
      // Fetch user profile if not already in state
      if (!user) {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            dispatch(logout());
            throw new Error("Unauthorized. Please log in again.");
          }
          throw new Error(`Failed to fetch user profile: ${userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        dispatch(login(userData)); // Dispatch login with fetched user data
      }

      // Fetch tasks
      const tasksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!tasksResponse.ok) {
        if (tasksResponse.status === 401) {
          dispatch(logout());
          throw new Error("Unauthorized fetching tasks. Please log in again.");
        }
        throw new Error(`Failed to fetch tasks: ${tasksResponse.statusText}`);
      }
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.message.includes("Unauthorized")) {
        // Use toast for better UX than just console logging
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        redirect('/login'); // Redirect on auth error
      } else {
        toast({
          title: "Error",
          description: err.message || "Could not load data.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  // Effect to fetch data on mount or when dependencies change (like user logging out)
  useEffect(() => {
    fetchUserDataAndTasks();
  }, [fetchUserDataAndTasks]);

  // Effect to redirect if not authenticated after checks
  useEffect(() => {
    // This check runs after the initial fetch attempt
    if (!isLoading && !isAuthenticated && !localStorage.getItem('accessToken')) {
      console.log("Redirecting due to no authentication after load.");
      redirect('/login');
    }
  }, [isAuthenticated, isLoading]);

  // --- CRUD Operations ---

  const handleStatusChange = async (taskId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout());
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
      redirect('/login');
    }

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const originalStatus = taskToUpdate.isCompleted;
    const newStatus = !originalStatus;

    // Optimistic UI Update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: newStatus } : task
      )
    );

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ isCompleted: newStatus }) // Only send the changed field
      });

      if (!response.ok) {
        // Revert UI on failure
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, isCompleted: originalStatus } : task
          )
        );
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task status");
      }

      // No need to update state again if optimistic update worked and server confirmed
      toast({ title: "Success", description: "Task status updated." });


    } catch (error: any) {
      console.error("Error updating task status:", error);
      toast({ title: "Error", description: error.message || "Could not update task status.", variant: "destructive" });
      // UI already reverted above
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout());
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
      redirect('/login');
    }

    const tasksBeforeDelete = [...tasks];
    // Optimistic UI update
    setTasks(prevTasks => prevTasks.filter((task) => task.id !== taskId));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        // Revert UI
        setTasks(tasksBeforeDelete);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      toast({ title: "Success", description: "Task deleted." });

    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: error.message || "Could not delete task.", variant: "destructive" });
      // UI already reverted above
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logout());
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
      redirect('/login');
    }

    const isUpdating = !!taskData.id;
    const url = isUpdating
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskData.id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`;
    const method = isUpdating ? "PUT" : "POST";

    // Prepare the payload - only include necessary fields
    const payload: Partial<Task> = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      category: taskData.category,
    };
    if (isUpdating) {
      // Include isCompleted only if updating, as it's not part of creation typically
      payload.isCompleted = taskData.isCompleted;
    }


    // --- Optimistic UI ---
    const previousTasks = [...tasks];
    if (isUpdating) {
      setTasks(prevTasks => prevTasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
    } else {
      // For adding, create a temporary ID for the optimistic update
      const tempId = `temp-${Date.now()}`;
      setTasks(prevTasks => [...prevTasks, { ...taskData, id: tempId, isCompleted: false } as Task]); // Add the temp task
    }
    // --- End Optimistic UI ---

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload) // Use the cleaned payload
      });

      if (!response.ok) {
        // Revert Optimistic UI
        setTasks(previousTasks);
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isUpdating ? 'update' : 'create'} task`);
      }

      const savedTask = await response.json();

      if (isUpdating) {
        setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t)); // Update with final server data
      } else {
        // Replace the temporary task with the real one from the server
        setTasks(prevTasks => prevTasks.map(t => t.id.startsWith('temp-') ? savedTask : t));
      }
      toast({ title: "Success", description: `Task ${isUpdating ? 'updated' : 'created'}.` });


    } catch (error: any) {
      console.error(`Error ${isUpdating ? 'updating' : 'creating'} task:`, error);
      toast({ title: "Error", description: error.message || `Could not ${isUpdating ? 'update' : 'create'} task.`, variant: "destructive" });
      // UI already reverted if optimistic update was used
      if (!isUpdating) { // If adding failed, remove the temp item if it wasn't reverted
        setTasks(previousTasks);
      }
    } finally {
      setIsModalOpen(false);
      setCurrentTask(null);
    }
  };
  // --- End CRUD ---


  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    setCurrentTask(null); // Ensure we're adding a new task
    setIsModalOpen(true);
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Use optional chaining for user */}
        <h1 className="text-3xl font-bold">Welcome, {user?.username ?? ''}</h1>
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
            {/* TODO: Dynamically generate categories based on tasks? */}
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List Rendering */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant={task.isCompleted ? "secondary" : "default"}>{task.isCompleted ? "Completed" : "Pending"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground min-h-[20px]">{task.description || ""}</p> {/* Min height for consistency */}
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
                  onCheckedChange={() => handleStatusChange(task.id)} // Pass only ID
                  aria-label={`Mark task ${task.title} as ${task.isCompleted ? 'not completed' : 'completed'}`}
                />
                <label htmlFor={`task-${task.id}`} className="text-xs font-medium cursor-pointer">
                  {task.isCompleted ? "Completed" : "Mark complete"}
                </label>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} aria-label={`Edit task ${task.title}`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} aria-label={`Delete task ${task.title}`}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {/* No Tasks Message */}
        {tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No tasks match filter</h3>
            <p className="text-sm text-muted-foreground">
              {'No tasks found in the "{selectedCategory}" category.'}
            </p>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first task to get started!
            </p>
            <Button variant="outline" className="mt-4" onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
        onSaveAction={handleSaveTask}
        task={currentTask} // Pass the task to edit or null for new
      />
    </div>
  );
}
