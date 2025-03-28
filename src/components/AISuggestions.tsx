"use client"

import { useState } from "react"
import { generateAISuggestions } from "../utils/aiService"

interface AISuggestionsProps {
  isOpen: boolean
  onClose: () => void
  onSuggestionSelect: (suggestions: string[]) => void
  prompt: string
  setPrompt: (prompt: string) => void
  setDay: (day: string) => void
  day: string
  time: string
  setTime: (time: string) => void
}

const AISuggestions = ({ isOpen, setDay, day, time, setTime, onClose, onSuggestionSelect, prompt, setPrompt }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")


  const handleGenerateSuggestions = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await generateAISuggestions(prompt)
      setSuggestions(result)
    } catch (err) {
      setError("Failed to generate suggestions. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Suggestions</h2>

          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              What would you like suggestions for?
            </label>
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., ingredients for oatmeal cookies"
            />
          </div>

          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

          <div className="flex justify-between mb-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? "Generating..." : "Generate Suggestions"}
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Suggestions:</h3>
              <ul className="bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="py-1">
                    {suggestion}
                  </li>
                ))}

                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                    Day
                  </label>
                  <input
                    type="date"
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </ul>
              <button
                onClick={() => onSuggestionSelect(suggestions)}
                className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Use These Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AISuggestions

