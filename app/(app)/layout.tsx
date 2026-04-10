import { getCurrentUser } from '@/src/auth/session'
import LogoutButton from '@/src/components/LogoutButton'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const AppLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div>
      <nav>
        <LogoutButton />
        <Link href={`/users/${user.id}`}>Profile</Link>
      </nav>
      {children}
    </div>
  )
}

export default AppLayout
