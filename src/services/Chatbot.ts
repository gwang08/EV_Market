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
  
  // Pattern 1: Markdown format with bullets: * **Xe điện 2019 Rivian...** với giá... [url]
  const markdownLinkRegex = /\*\s+\*\*(.+?)\*\*.*?https?:\/\/[^\s]+\/vehicle\/([\w-]+)/g
  let match
  
  while ((match = markdownLinkRegex.exec(answer)) !== null) {
    links.push({
      title: match[1].trim(),
      url: `/vehicle/${match[2]}`
    })
  }
  
  // Pattern 2: Markdown format for batteries: * **Pin EV...** với giá... [url]
  const batteryMarkdownRegex = /\*\s+\*\*(.+?)\*\*.*?https?:\/\/[^\s]+\/battery\/([\w-]+)/g
  while ((match = batteryMarkdownRegex.exec(answer)) !== null) {
    links.push({
      title: match[1].trim(),
      url: `/battery/${match[2]}`
    })
  }
  
  // Pattern 3: Bold text followed by URL: **BMW 320i** ... https://...
  const boldWithUrlRegex = /\*\*([^*]+)\*\*[\s\S]{0,200}?https?:\/\/[^\s]+\/vehicle\/([\w-]+)/g
  
  while ((match = boldWithUrlRegex.exec(answer)) !== null) {
    const title = match[1].trim()
    const id = match[2]
    
    // Check if this link is not already added
    const alreadyExists = links.some(link => link.url === `/vehicle/${id}`)
    if (!alreadyExists) {
      links.push({
        title: title,
        url: `/vehicle/${id}`
      })
    }
  }
  
  // Pattern 4: Bold battery text followed by URL
  const boldBatteryWithUrlRegex = /\*\*([^*]+(?:pin|battery|Pin|Battery)[^*]*)\*\*[\s\S]{0,200}?https?:\/\/[^\s]+\/battery\/([\w-]+)/gi
  
  while ((match = boldBatteryWithUrlRegex.exec(answer)) !== null) {
    const title = match[1].trim()
    const id = match[2]
    
    const alreadyExists = links.some(link => link.url === `/battery/${id}`)
    if (!alreadyExists) {
      links.push({
        title: title,
        url: `/battery/${id}`
      })
    }
  }
  
  // Pattern 5: Fallback - Any vehicle/battery URLs not caught above
  const fallbackVehicleRegex = /https?:\/\/[^\s]+\/vehicle\/([\w-]+)/g
  while ((match = fallbackVehicleRegex.exec(answer)) !== null) {
    const id = match[1]
    const alreadyExists = links.some(link => link.url === `/vehicle/${id}`)
    if (!alreadyExists) {
      links.push({
        title: 'Xem chi tiết sản phẩm',
        url: `/vehicle/${id}`
      })
    }
  }
  
  const fallbackBatteryRegex = /https?:\/\/[^\s]+\/battery\/([\w-]+)/g
  while ((match = fallbackBatteryRegex.exec(answer)) !== null) {
    const id = match[1]
    const alreadyExists = links.some(link => link.url === `/battery/${id}`)
    if (!alreadyExists) {
      links.push({
        title: 'Xem chi tiết pin',
        url: `/battery/${id}`
      })
    }
  }

  return links
}

// Format markdown-style text to HTML
export const formatChatMessage = (text: string): string => {
  // Remove URLs from text (they will be shown as buttons)
  let formattedText = text
    .replace(/https?:\/\/[^\s]+/g, '') // Remove all URLs
    .replace(/^\*\s+/gm, '• ') // Convert markdown bullets to •
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\n\n+/g, '<br/><br/>') // Double line breaks
    .replace(/\n/g, '<br/>') // Single line breaks
    .replace(/(<br\/>){3,}/g, '<br/><br/>') // Max 2 consecutive breaks
    .trim()
  
  return formattedText
}
