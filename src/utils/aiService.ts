// This is a frontend service that will call our backend API
export async function generateAISuggestions(prompt: string): Promise<string[]> {
    try {
      const response = await fetch("http://localhost:5000/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }
  
      const data = await response.json()
      return data.suggestions
    } catch (error) {
      console.error("Error generating AI suggestions:", error)
      throw error
    }
  }
  
  