import { getArchiveById } from '@/src/db/archives'
import EditArchiveForm from './EditArchiveForm'
import { notFound } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string; archive_id: string }>
}) {
  const { user_id: userIdParams, archive_id: archiveIdParams } = await params
  const archive = await getArchiveById(archiveIdParams, userIdParams)

  if (!archive) {
    notFound()
  }

  return (
    <div>
      <h1>Edit archive</h1>
      <EditArchiveForm archive={archive} />
    </div>
  )
}
