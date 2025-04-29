import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  category: string
  status: "Pending" | "Completed"
}

interface TasksState {
  tasks: Task[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  status: "idle",
  error: null,
}

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, "id">>) => {
      const newTask = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.tasks.push(newTask)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((task) => task.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload)
    },
    toggleTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload)
      if (task) {
        task.status = task.status === "Completed" ? "Pending" : "Completed"
      }
    },
  },
})

export const { addTask, updateTask, deleteTask, toggleTaskStatus } = tasksSlice.actions

export default tasksSlice.reducer
