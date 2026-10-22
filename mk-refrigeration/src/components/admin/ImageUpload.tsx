'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

type Props = {
  initialImages?: string[]
  name?: string
  maxImages?: number
}

export default function ImageUpload({ initialImages = [], name = 'images', maxImages = 5 }: Props) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const uploadFile = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      setError('Cloudinary not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setUploading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', uploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed — check your cloud name and upload preset')
      const data = await res.json() as { secure_url: string }
      setImages((prev) => [...prev, data.secure_url])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = async (files: FileList) => {
    const toUpload = Array.from(files).slice(0, maxImages - images.length)
    for (const file of toUpload) {
      await uploadFile(file)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    void handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void handleFiles(e.target.files)
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative group w-24 h-24 rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-primary text-on-primary py-0.5">
                  MAIN
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors select-none ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/60 hover:border-primary/60 hover:bg-surface-container'
          }`}
        >
          {uploading ? (
            <>
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
              <p className="text-xs text-on-surface-variant font-medium">Uploading…</p>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/60">cloud_upload</span>
              <p className="text-xs font-semibold text-on-surface-variant">
                Drop images here or <span className="text-primary">click to browse</span>
              </p>
              <p className="text-[10px] text-on-surface-variant/50">
                PNG, JPG, WEBP · {maxImages - images.length} slot{maxImages - images.length !== 1 ? 's' : ''} remaining
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <p className="text-xs text-error flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
