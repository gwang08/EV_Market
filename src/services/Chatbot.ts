// Chatbot API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  links?: Array<{
    url: string
    title: string
  }>
}

export interface ChatbotResponse {
  answer: string
  success: boolean
}

export const sendChatMessage = async (question: string): Promise<ChatbotResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.trim()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      answer: data.answer || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
      success: true
    }
  } catch (error: unknown) {
    console.error('Chatbot API Error:', error)
    return {
      answer: 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
      success: false
    }
  }
}

// Parse vehicle links from response
export const parseVehicleLinks = (answer: string): Array<{ url: string; title: string }> => {
  const links: Array<{ url: string; title: string }> = []
  const linkRegex = /\*\s+\*\*(.+?)\*\*.*?\/vehicle\/([\w-]+)/g
  let match

  while ((match = linkRegex.exec(answer)) !== null) {
    links.push({
      title: match[1],
      url: `/vehicle/${match[2]}`
    })
  }

  return links
}

// Format markdown-style text to HTML
export const formatChatMessage = (text: string): string => {
  // Remove markdown bullets and format bold text
  return text
    .replace(/^\*\s+/gm, '• ')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
