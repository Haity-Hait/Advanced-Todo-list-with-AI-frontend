"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import type { Task } from "./types"
import { useMediaQuery } from "./hooks/useMediaQuery"
import { syncTasks, fetchTasksFromServer } from "./utils/syncService"
import TaskForm from "./components/TaskForm"
import TaskList from "./components/TaskList"
import AISuggestions from "./components/AISuggestions"

// New Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full py-8">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-4 text-gray-600">Loading tasks...</span>
  </div>
)

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Initializing tasks...")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [day, setDay] = useState("")
  const [time, setTime] = useState("")

  // Load tasks from local storage on initial load and fetch from backend when online
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      setLoadingMessage("Checking local storage...")

      // First load from localStorage for immediate display
      const storedTasks = localStorage.getItem("tasks")
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks))
        setLoadingMessage("Found local tasks...")
      }

      // Then try to fetch from backend if online
      if (navigator.onLine) {
        try {
          setIsSyncing(true)
          setLoadingMessage("Syncing with server...")
          const serverTasks = await fetchTasksFromServer()

          // If we have server tasks, use them (they're the source of truth)
          if (serverTasks && serverTasks.length > 0) {
            setTasks(serverTasks)
            // Update localStorage with server data
            localStorage.setItem("tasks", JSON.stringify(serverTasks))
            setLoadingMessage("Tasks loaded from server")
            console.log("Tasks loaded from server")
          } else if (storedTasks) {
            // If we have local tasks but no server tasks, push local to server
            setLoadingMessage("Uploading local tasks to server...")
            await syncTasks(JSON.parse(storedTasks))
          }
        } catch (error) {
          console.error("Failed to fetch tasks from server:", error)
          setLoadingMessage("Error syncing tasks. Using local data.")
        } finally {
          setIsSyncing(false)
          setIsLoading(false)
        }
      } else {
        setLoadingMessage("Offline mode: Using local tasks")
        setIsLoading(false)
      }
    }

    loadTasks()

    // Set up event listeners for online/offline status
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOfflineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOfflineStatus)
    }
  }, [])

  // Save tasks to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tasks", JSON.stringify(tasks))

      // Try to sync with the server if online
      if (navigator.onLine && !isSyncing) {
        syncWithServer()
      }
    }
  }, [tasks, isLoading])

  const syncWithServer = async () => {
    if (navigator.onLine) {
      setIsSyncing(true)
      try {
        await syncTasks(tasks)
        console.log("Tasks synced with server")
      } catch (error) {
        console.error("Failed to sync tasks with server:", error)
      } finally {
        setIsSyncing(false)
      }
    }
  }

  const handleOnlineStatus = () => {
    console.log("You're back online, syncing tasks...")
    syncWithServer()
  }

  const handleOfflineStatus = () => {
    console.log("You're offline, changes will be saved locally")
  }

  const addTask = (task: Task) => {
    setTasks([...tasks, task])
  }

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const newTasks = [...tasks]
    const draggedTask = newTasks[dragIndex]
    newTasks.splice(dragIndex, 1)
    newTasks.splice(hoverIndex, 0, draggedTask)
    setTasks(newTasks)
  }

  const handleAISuggestion = (suggestion: string[]) => {
    // Create a new task with the suggestions as subtasks
    const newTask: Task = {
      id: Date.now().toString(),
      title: aiPrompt,
      day: day,
      time: time,
      completed: false, // Add this line to fix the type error
      subtasks: suggestion.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        title: item,
        completed: false,
      })),
    }

    addTask(newTask)
    setIsAIOpen(false)
    setAiPrompt("")
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">Task Manager</h1>

          {isSyncing && (
            <div className="mb-4 text-center text-sm text-blue-600">
              <span className="inline-block animate-spin mr-2">⟳</span>
              Syncing with server...
            </div>
          )}

          {!navigator.onLine && (
            <div className="mb-4 text-center text-sm text-amber-600">Offline - Changes saved locally</div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-xl font-semibold mb-4 md:mb-0">Add New Task</h2>
              <button
                onClick={() => setIsAIOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                AI Suggestions
              </button>
            </div>
            <TaskForm onAddTask={addTask} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 text-sm">{loadingMessage}</p>
              </div>
            ) : (
              <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} onMoveTask={moveTask} />
            )}
          </div>
        </div>

        {isAIOpen && (
          <AISuggestions
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            onSuggestionSelect={handleAISuggestion}
            prompt={aiPrompt}
            setPrompt={setAiPrompt}
            setDay={setDay}
            day={day}
            time={time}
            setTime={setTime}
          />
        )}
      </div>
    </DndProvider>
  )
}

export default App

