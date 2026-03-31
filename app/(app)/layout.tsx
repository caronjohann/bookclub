import { getCurrentUser } from '@/src/auth/session'
import LogoutButton from '@/src/components/LogoutButton'
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
      </nav>
      {children}
    </div>
  )
}

export default AppLayout
