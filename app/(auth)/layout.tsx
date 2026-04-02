import { getCurrentUser } from '@/src/auth/session'
import { redirect } from 'next/navigation'

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const user = await getCurrentUser()

  if (user) {
    redirect('/index')
  }

  return children
}

export default AuthLayout
