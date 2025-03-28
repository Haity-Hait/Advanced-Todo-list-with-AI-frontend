export interface Task {
  id: string
  title: string
  day: string
  time: string
  completed: boolean
  subtasks: Subtask[]
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

