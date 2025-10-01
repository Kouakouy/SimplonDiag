// Configuration de l'application
export const config = {
  deepSeek: {
    apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

// Validation de la configuration
export function validateConfig() {
  const errors: string[] = []
  
  if (!config.deepSeek.apiKey) {
    errors.push('NEXT_PUBLIC_DEEPSEEK_API_KEY est requis')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
