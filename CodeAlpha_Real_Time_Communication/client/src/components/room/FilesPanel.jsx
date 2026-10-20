import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  FileText,
  Download,
  Image,
  Film,
  Music,
  Archive,
  Loader2,
  Lock,
} from 'lucide-react'
import { Button, useToast } from '../ui'
import { useRoomStore } from '../../store/room.store'
import api from '../../lib/api'

export function FilesPanel({ roomId }) {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { files, setFiles, addFile } = useRoomStore()

  // Fetch initial room files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get(`/files/room/${roomId}`)
        setFiles(data.files || [])
      } catch (err) {
        console.warn('Could not fetch room files:', err)
      }
    }
    if (roomId) fetchFiles()
  }, [roomId, setFiles])

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />
    if (mimeType?.startsWith('video/')) return <Film className="w-5 h-5 text-purple-500" />
    if (mimeType?.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />
    if (mimeType?.includes('zip') || mimeType?.includes('compressed'))
      return <Archive className="w-5 h-5 text-amber-500" />
    return <FileText className="w-5 h-5 text-accent" />
  }

  const handleUploadFile = async (file) => {
    if (!file) return

    // 50MB check
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('roomId', roomId)

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const { data } = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        },
      })

      addFile(data.file)
      toast.success(`${file.name} encrypted & uploaded`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'File upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const { data } = await api.get(`/files/sign/${fileId}`)
      const response = await api.get(data.downloadUrl, {
        responseType: 'blob',
      })

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Decrypted and downloaded!')
    } catch (err) {
      toast.error('Failed to download file.')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleUploadFile(droppedFile)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full relative select-none"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleUploadFile(e.target.files[0])}
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute inset-0 z-30 bg-accent/90 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-6 text-white text-center shadow-2xl"
          >
            <UploadCloud className="w-12 h-12 mb-2 animate-bounce" />
            <p className="text-title-2 font-bold">Drop to encrypt & share</p>
            <p className="text-footnote mt-1 opacity-80">AES-256-GCM Vault • Max 50MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info & Upload Button */}
      <div className="p-4 border-b border-separator/30 flex items-center justify-between">
        <div>
          <h4 className="text-subheadline font-semibold text-label">Encrypted Vault</h4>
          <p className="text-caption-1 text-label-secondary flex items-center gap-1 mt-0.5">
            <Lock className="w-3 h-3 text-system-success" />
            <span>AES-256-GCM Encrypted at rest</span>
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={UploadCloud}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Upload
        </Button>
      </div>

      {/* Upload Progress Bar if active */}
      {isUploading && (
        <div className="p-3 bg-surface-elevated border-b border-separator/30">
          <div className="flex items-center justify-between text-caption-1 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-accent">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Encrypting & Uploading...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-system-gray4 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-200 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Files List (macOS Finder Row Items) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-label-secondary">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-label-tertiary mb-3 border border-separator/30 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-subheadline font-semibold text-label">No files shared yet</p>
            <p className="text-caption-1 mt-1 text-label-secondary max-w-[200px]">
              Drag & drop files here to encrypt and broadcast to the room.
            </p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-2xl bg-surface-elevated border border-separator/30 hover:border-accent/40 transition-all duration-150 flex items-center justify-between gap-3 group shadow-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 border border-separator/20">
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="truncate">
                  <p className="text-subheadline font-medium text-label truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="text-caption-1 text-label-secondary">
                    {formatFileSize(file.size)} • {file.displayName}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDownloadFile(file.id, file.originalName)}
                aria-label={`Download ${file.originalName}`}
                className="text-label-secondary hover:text-accent shrink-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
