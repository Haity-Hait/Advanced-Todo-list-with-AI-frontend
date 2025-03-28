"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Task } from "../types"
import { useDrag, useDrop } from "react-dnd"
import { CheckCircle, Circle, Clock, AlertCircle, ChevronDown, ChevronRight, Trash2 } from "lucide-react"

interface TaskItemProps {
  task: Task
  index: number
  onUpdateTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onMoveTask: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const TaskItem = ({ task, index, onUpdateTask, onDeleteTask, onMoveTask }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Check if all subtasks are completed
  const allSubtasksCompleted = task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.completed)

  // Determine if the task is completed (either manually marked or all subtasks completed)
  const isTaskCompleted = task.completed || allSubtasksCompleted

  // Function to toggle task completion status
  const toggleTaskCompletion = (e: React.MouseEvent) => {
    // Stop propagation to prevent expanding/collapsing when clicking the checkbox
    e.stopPropagation()

    onUpdateTask({
      ...task,
      completed: !task.completed,
    })
  }

  // Function to determine task status
  const getTaskStatus = () => {
    // If task is completed, show completed status
    if (isTaskCompleted) {
      return {
        text: "Completed",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
      }
    }

    const now = new Date()
    const taskDateTime = new Date(`${task.day}T${task.time}`)

    if (taskDateTime < now) {
      return {
        text: "Passed",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }

    const timeDiff = taskDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    if (hoursDiff <= 24) {
      return {
        text: "Upcoming",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        icon: <Clock className="h-4 w-4" />,
      }
    }

    return {
      text: "Pending",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: <Clock className="h-4 w-4" />,
    }
  }

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "TASK",
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMoveTask(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    )

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    })
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const status = getTaskStatus()

  // Handle click on the task card (excluding buttons and checkboxes)
  const handleTaskCardClick = () => {
    // If task has subtasks, expand/collapse
    if (task.subtasks.length > 0) {
      setIsExpanded(!isExpanded)
    } else {
      // If task has no subtasks, toggle completion status
      onUpdateTask({
        ...task,
        completed: !task.completed,
      })
    }
  }

  return (
    <div
      ref={ref}
      className={`bg-white border rounded-lg shadow-sm transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isTaskCompleted ? "border-green-500 border-2" : ""}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={handleTaskCardClick}>
            <div className="flex-shrink-0 mt-1">
              {task.subtasks.length === 0 ? (
                <button
                  onClick={toggleTaskCompletion}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                  )}
                </button>
              ) : (
                isTaskCompleted && <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-medium ${isTaskCompleted ? "text-green-700" : ""} ${task.completed && task.subtasks.length === 0 ? "line-through text-gray-500" : ""}`}
              >
                {task.title}
              </h3>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  {formatDate(task.day)} at {task.time}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${status.color} ${status.bgColor}`}
                >
                  {status.icon}
                  {status.text}
                </span>
                {task.subtasks.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} completed
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2 ml-2">
            {task.subtasks.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                aria-label={isExpanded ? "Collapse task" : "Expand task"}
              >
                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isExpanded && task.subtasks.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
            <ul className="space-y-2">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    id={`subtask-${subtask.id}`}
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`subtask-${subtask.id}`}
                    className={`ml-2 cursor-pointer flex-1 ${subtask.completed ? "line-through text-gray-400" : ""}`}
                  >
                    {subtask.title}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskItem
