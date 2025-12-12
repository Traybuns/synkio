/**
 * Array utility functions
 */

/**
 * Chunk an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0')
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Remove duplicates from an array by a key selector
 */
export function uniqueBy<T, K>(array: T[], keySelector: (item: T) => K): T[] {
  const seen = new Set<K>()
  return array.filter((item) => {
    const key = keySelector(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Group array items by a key selector
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keySelector(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

/**
 * Sort array by a key selector
 */
export function sortBy<T>(
  array: T[],
  keySelector: (item: T) => number | string,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aKey = keySelector(a)
    const bKey = keySelector(b)
    
    if (aKey < bKey) return order === 'asc' ? -1 : 1
    if (aKey > bKey) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Paginate an array
 */
export function paginate<T>(array: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return array.slice(start, start + pageSize)
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  
  return {
    totalItems,
    totalPages,
    currentPage: page,
    pageSize,
    hasNextPage,
    hasPrevPage,
    startIndex: (page - 1) * pageSize,
    endIndex: Math.min(page * pageSize, totalItems)
  }
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Pick random items from an array
 */
export function sample<T>(array: T[], count: number = 1): T[] {
  const shuffled = shuffle(array)
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * Check if an array is empty or null/undefined
 */
export function isEmptyArray<T>(array: T[] | null | undefined): boolean {
  return !array || array.length === 0
}

/**
 * Get the first item of an array or undefined
 */
export function first<T>(array: T[]): T | undefined {
  return array[0]
}

/**
 * Get the last item of an array or undefined
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1]
}

/**
 * Create a range array
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

