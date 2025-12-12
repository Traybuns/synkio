export const getBackendUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'
}

export const getRootUrl = (): string => {
  return process.env.NEXT_PUBLIC_ROOT_URL ?? 'http://localhost:3000'
}

