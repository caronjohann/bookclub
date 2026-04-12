import Link from 'next/link'

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string; archive_id: string }>
}) {
  const { user_id: userIdParams, archive_id: archiveIdParams } = await params

  return (
    <div>
      <Link href={`/users/${userIdParams}/archives/${archiveIdParams}/edit`}>Edit archive</Link>
      <Link href={`/users/${userIdParams}/archives/${archiveIdParams}/delete`}>Delete archive</Link>
    </div>
  )
}
