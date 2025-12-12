'use client'

import CountdownLaunchPage from '../components/ui/CountdownLaunchPage'

const getLaunchDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const launchDate = new Date(today)
  launchDate.setDate(today.getDate() + 7)
  launchDate.setHours(23, 59, 59, 999)
  return launchDate
}

export default function Home() {
  return <CountdownLaunchPage launchDate={getLaunchDate()} />
}
