import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/src/auth/session'

const LibraryPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <h1>Library page</h1>
}

export default LibraryPage
