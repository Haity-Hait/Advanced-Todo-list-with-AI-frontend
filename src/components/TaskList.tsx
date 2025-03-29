/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import { useCallback } from "react"
import type { Task } from "../types"
import TaskItem from "./TaskItem"

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onMoveTask: (dragIndex: number, hoverIndex: number) => void
}

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, onMoveTask }: TaskListProps) => {
  if (tasks.length === 0) {
    return <div className="text-center py-8 text-gray-500">No tasks yet. Add a task to get started!</div>
  }

  // First, separate completed and incomplete tasks
  const completedTasks: Task[] = []
  const incompleteTasks: Task[] = []

  tasks.forEach((task) => {
    // Check if task is completed (either manually or all subtasks completed)
    const allSubtasksCompleted = task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.completed)

    if (task.completed || allSubtasksCompleted) {
      completedTasks.push(task)
    } else {
      incompleteTasks.push(task)
    }
  })

  // Sort incomplete tasks by creation date (newest first)
  const sortedIncompleteTasks = [...incompleteTasks].sort((a, b) => {
    const aId = Number.parseInt(a.id)
    const bId = Number.parseInt(b.id)
    return bId - aId
  })

  // Sort completed tasks by completion date (if available) or creation date
  const sortedCompletedTasks = [...completedTasks].sort((a, b) => {
    const aId = Number.parseInt(a.id)
    const bId = Number.parseInt(b.id)
    return bId - aId
  })

  // Combine the arrays: incomplete tasks first, then completed tasks

  // Handle moving tasks within their respective sections
  const handleMoveTask = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // Check if we're moving within the incomplete tasks section
      if (dragIndex < sortedIncompleteTasks.length && hoverIndex < sortedIncompleteTasks.length) {
        onMoveTask(dragIndex, hoverIndex)
      }
      // Check if we're moving within the completed tasks section
      else if (dragIndex >= sortedIncompleteTasks.length && hoverIndex >= sortedIncompleteTasks.length) {
        // Adjust indices to be relative to the completed tasks section
        const adjustedDragIndex = dragIndex - sortedIncompleteTasks.length
        const adjustedHoverIndex = hoverIndex - sortedIncompleteTasks.length

        // Move within the completed tasks section
        const newCompletedTasks = [...sortedCompletedTasks]
        const draggedTask = newCompletedTasks[adjustedDragIndex]
        newCompletedTasks.splice(adjustedDragIndex, 1)
        newCompletedTasks.splice(adjustedHoverIndex, 0, draggedTask)

        // Recombine the arrays and update
        onMoveTask(dragIndex, hoverIndex)
      }
    },
    [sortedIncompleteTasks.length, sortedCompletedTasks, onMoveTask],
  )

  return (
    <div>
      <div className="space-y-4">
        {/* Render incomplete tasks */}
        {sortedIncompleteTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onMoveTask={handleMoveTask}
            isCompleted={false}
          />
        ))}

        {/* Render completed tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Completed Tasks</h3>
            <div className="space-y-4">
              {sortedCompletedTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index + sortedIncompleteTasks.length}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onMoveTask={handleMoveTask}
                  isCompleted={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskList

