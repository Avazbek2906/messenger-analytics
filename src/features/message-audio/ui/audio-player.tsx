import { useMutation } from '@tanstack/react-query'
import { Loader2, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { conversationApi } from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

/**
 * Voice-message player.
 *
 * The audio route requires a JWT, so a plain `<audio src>` cannot work, and the
 * backend does not support `Range` requests — the file is fetched whole as a
 * blob and handed to the player via `URL.createObjectURL`. That is why loading
 * starts only AFTER the user clicks (docs/03).
 */
export function AudioPlayer({ messageId }: { messageId: string }) {
  const { t } = useTranslation()
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const load = useMutation({
    mutationFn: () => conversationApi.audio(messageId),
    onSuccess: ({ blob }) => setObjectUrl(URL.createObjectURL(blob)),
  })

  // Blob URLs must be revoked by hand, otherwise they stay in memory until the
  // page is closed.
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    },
    [objectUrl],
  )

  useEffect(() => {
    if (objectUrl) void audioRef.current?.play()
  }, [objectUrl])

  if (objectUrl) {
    return (
      <audio
        ref={audioRef}
        src={objectUrl}
        controls
        className="h-9 w-full max-w-72"
      >
        <track kind="captions" />
      </audio>
    )
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        icon={load.isPending ? <Loader2 /> : <Play />}
        loading={load.isPending}
        onClick={() => load.mutate()}
      >
        {t('transcript.playAudio')}
      </Button>
      {load.isError ? (
        <p role="alert" className="text-xs text-danger-fg">
          {t('transcript.audioFailed')}
        </p>
      ) : null}
    </div>
  )
}
