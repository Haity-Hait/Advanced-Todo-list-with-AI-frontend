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

  const sortedTasks = [...tasks].sort((a, b) => {
    // Convert IDs to numbers (assuming they're timestamps)
    const aId = Number.parseInt(a.id)
    const bId = Number.parseInt(b.id)
    // Sort in descending order (newest first)
    return bId - aId
  })

  return (
    <div className="space-y-4">
      {sortedTasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
        />
      ))}
    </div>
  )
}

export default TaskList

