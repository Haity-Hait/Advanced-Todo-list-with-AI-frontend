"use client"

import type React from "react"
import { useState } from "react"
import type { Task } from "../types"
import { Plus, Trash2, CalendarIcon, Clock } from "lucide-react"

interface TaskFormProps {
  onAddTask: (task: Task) => void
}

const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState("")
  const [day, setDay] = useState("")
  const [time, setTime] = useState("")
  const [subtasks, setSubtasks] = useState<string[]>([""])
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError("Please enter a task title")
      return
    }

    if (!day) {
      setFormError("Please select a date")
      return
    }

    if (!time) {
      setFormError("Please select a time")
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      day,
      time,
      completed: false, // Add this line to fix the type error
      subtasks: subtasks
        .filter((st) => st.trim() !== "")
        .map((st, index) => ({
          id: `${Date.now()}-${index}`,
          title: st,
          completed: false,
        })),
    }

    onAddTask(newTask)

    // Reset form
    setTitle("")
    setDay("")
    setTime("")
    setSubtasks([""])
    setFormError(null)
  }

  const addSubtaskField = () => {
    setSubtasks([...subtasks, ""])
  }

  const updateSubtask = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks]
    updatedSubtasks[index] = value
    setSubtasks(updatedSubtasks)
  }

  const removeSubtaskField = (index: number) => {
    if (subtasks.length === 1) {
      setSubtasks([""])
      return
    }
    const updatedSubtasks = subtasks.filter((_, i) => i !== index)
    setSubtasks(updatedSubtasks)
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{formError}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter task title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <input
              type="date"
              id="day"
              value={day}
              min={today}
              onChange={(e) => setDay(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Clock className="h-4 w-4" />
            </div>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Subtasks</label>
          <span className="text-xs text-gray-500">{subtasks.filter((st) => st.trim() !== "").length} subtasks</span>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto p-1">
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <input
                type="text"
                value={subtask}
                onChange={(e) => updateSubtask(index, e.target.value)}
                className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={`Subtask ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeSubtaskField(index)}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Remove subtask"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSubtaskField}
          className="mt-3 text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium py-1.5 px-2 rounded-md hover:bg-blue-50 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Subtask
        </button>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-1.5" />
          Add Task
        </button>
      </div>

      {day && time && title && (
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-500 mb-2">Task Preview:</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-md font-medium">{title}</h3>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span>
                {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at{" "}
                {time}
              </span>
              {subtasks.filter((st) => st.trim() !== "").length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {subtasks.filter((st) => st.trim() !== "").length} subtasks
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default TaskForm

