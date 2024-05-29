import { ClientSideSuspense } from '@liveblocks/react'
import { CommentsOverlay } from './CommentsOverlay'
import React from 'react'

export const Comments = () => {
  return (
    <ClientSideSuspense fallback={null}>
      {() => <CommentsOverlay />
      }
    </ClientSideSuspense>
  )
}