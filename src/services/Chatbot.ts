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
  const processedIds = new Set<string>()
  
  // Find all URLs with their IDs
  const urlPattern = /https?:\/\/[^\s\)]+\/(vehicle|battery)\/([\w-]+)/g
  let match
  
  while ((match = urlPattern.exec(answer)) !== null) {
    const type = match[1] as 'vehicle' | 'battery'
    const id = match[2]
    
    if (processedIds.has(id)) continue
    
    // Get text before this URL (up to 300 chars)
    const textBefore = answer.substring(Math.max(0, match.index - 300), match.index)
    
    let title = type === 'vehicle' ? 'Xem chi tiết xe' : 'Xem chi tiết pin'
    
    // Strategy: Try multiple patterns in order of specificity
    
    // 1. Direct colon format: "* ProductName: https://" or "* **ProductName:** text https://"
    const colonMatch = textBefore.match(/\*\s+(?:\*\*)?([^*:\n]+?)(?:\*\*)?:\s*[^:]*?$/i)
    if (colonMatch) {
      const candidate = colonMatch[1].trim()
      if (isValidProductName(candidate)) {
        title = candidate
        processedIds.add(id)
        links.push({ title, url: `/${type}/${id}` })
        continue
      }
    }
    
    // 2. Markdown link: [text](url)
    const mdLinkMatch = answer.substring(match.index - 100, match.index + 100).match(/\[([^\]]+)\]\([^)]+\)/)
    if (mdLinkMatch) {
      const candidate = mdLinkMatch[1].trim()
      if (isValidProductName(candidate)) {
        title = candidate
        processedIds.add(id)
        links.push({ title, url: `/${type}/${id}` })
        continue
      }
    }
    
    // 3. Find ALL bold text in context, filter and pick best one
    const boldMatches: string[] = []
    const boldPattern = /\*\*([^*]+?)\*\*/g
    let boldMatch
    
    while ((boldMatch = boldPattern.exec(textBefore)) !== null) {
      boldMatches.push(boldMatch[1].trim())
    }
    
    if (boldMatches.length > 0) {
      // Filter to get valid product names only
      const validNames = boldMatches.filter(isValidProductName)
      
      if (validNames.length > 0) {
        // Pick the LAST valid name (closest to URL)
        title = validNames[validNames.length - 1]
      }
    }
    
    processedIds.add(id)
    links.push({ title, url: `/${type}/${id}` })
  }

  return links
}

// Helper: Check if text looks like a valid product name (not a price or gibberish)
function isValidProductName(text: string): boolean {
  if (!text || text.length < 3 || text.length > 60) return false
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(text)) return false
  
  // Exclude prices
  if (/^\d+[,.]?\d*\s*(VND|USD|đ|vnđ)$/i.test(text)) return false
  
  // Exclude if it's mostly numbers
  const numberCount = (text.match(/\d/g) || []).length
  if (numberCount > text.length * 0.7) return false
  
  // Exclude common filler phrases
  const fillerPhrases = [
    'với giá', 'giá', 'vnd', 'tại đây', 'xem chi tiết', 'thông tin', 
    'mời bạn', 'ghé thăm', 'bạn có thể', 'để biết', 'rất ấn tượng',
    'mẫu xe này', 'chiếc xe', 'sản phẩm'
  ]
  
  const lowerText = text.toLowerCase()
  for (const phrase of fillerPhrases) {
    if (lowerText === phrase || lowerText.includes(phrase) && lowerText.length < 30) {
      return false
    }
  }
  
  return true
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
