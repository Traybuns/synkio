export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function containsScriptTags(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  // Use String.search() instead of RegExp.test() to avoid lastIndex state issues with global regex
  // String.search() doesn't maintain lastIndex state, making it safe for repeated calls
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  const iframePattern = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  const javascriptUrlPattern = /javascript:/gi
  const eventHandlerPattern = /on\w+\s*=/gi

  // String.search() doesn't maintain lastIndex state, making it safe for repeated calls
  return (
    input.search(scriptPattern) !== -1 ||
    input.search(iframePattern) !== -1 ||
    input.search(javascriptUrlPattern) !== -1 ||
    input.search(eventHandlerPattern) !== -1
  )
}

