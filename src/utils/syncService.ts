import type { Task } from "../types"

// This function will sync tasks with the backend when online
export async function syncTasks(tasks: Task[]): Promise<void> {
  try {
    await fetch("http://localhost:5000/api/tasks/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
  } catch (error) {
    console.error("Error syncing tasks:", error)
    // We don't throw here because we don't want to interrupt the user experience
    // The sync will be attempted again later
  }
}

// Add a new function to fetch tasks from the server
export async function fetchTasksFromServer(): Promise<Task[]> {
  try {
    const response = await fetch("http://localhost:5000/api/tasks")
console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

