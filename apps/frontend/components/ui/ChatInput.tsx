'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Camera, Image as ImageIcon, Mic, Square, X, Smile } from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useTheme } from '../../contexts/ThemeContext'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onImageSelect?: (file: File) => void
  onAudioRecord?: (blob: Blob) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  onImageSelect,
  onAudioRecord,
  disabled = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const { theme } = useTheme()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(350)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setSelectedImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setSelectedImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setSelectedImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (onAudioRecord && audioBlob.size > 0) {
          onAudioRecord(audioBlob)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSend = () => {
    if (selectedImageFile && onImageSelect) {
      onImageSelect(selectedImageFile)
      removeImage()
    }
    if (value.trim() || selectedImageFile) {
      onSend()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onChange(value + emojiData.emoji)
  }

  useEffect(() => {
    const updateEmojiPickerWidth = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 350) : 350
        setEmojiPickerWidth(width)
      }
    }

    updateEmojiPickerWidth()
    window.addEventListener('resize', updateEmojiPickerWidth)

    return () => {
      window.removeEventListener('resize', updateEmojiPickerWidth)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  return (
    <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex-shrink-0 transition-colors safe-area-inset-bottom">
      {selectedImage && (
        <div className="mb-2 sm:mb-3 relative inline-block group">
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg border-2 border-linka-emerald/20 group-hover:border-linka-emerald/40 transition-colors">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-w-[120px] sm:max-w-[150px] md:max-w-[200px] max-h-[120px] sm:max-h-[150px] md:max-h-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 md:p-2 hover:bg-red-600 hover:scale-110 transition-all shadow-lg z-10 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Remove image"
            aria-label="Remove image"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3 relative">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || isRecording}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
              showEmojiPicker
                ? 'bg-linka-emerald/10 text-linka-emerald'
                : 'text-gray-600 dark:text-gray-400 hover:text-linka-emerald hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add emoji"
            aria-label="Add emoji"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 sm:mb-3 z-50 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50"
              style={{ width: `${emojiPickerWidth}px`, maxWidth: 'calc(100vw - 1rem)' }}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                theme={(theme === 'dark' ? 'dark' : 'light') as any}
                width={emojiPickerWidth}
                height={typeof window !== 'undefined' ? Math.min(350, window.innerHeight * 0.5) : 350}
                skinTonesDisabled
                previewConfig={{
                  showPreview: false
                }}
              />
            </div>
          )}

          <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300 dark:bg-gray-700" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isRecording}
            className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-linka-emerald hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Upload image"
            aria-label="Upload image"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled || isRecording}
            className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-linka-emerald hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center hidden sm:flex"
            title="Take photo"
            aria-label="Take photo"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
          
          <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
          
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled || !!selectedImage}
              className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-linka-emerald hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Record audio"
              aria-label="Record audio"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg sm:rounded-xl transition-all animate-pulse touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Stop recording"
              aria-label="Stop recording"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800/50 flex-shrink-0">
            <div className="relative">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-ping absolute" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full relative" />
            </div>
            <span className="text-red-600 dark:text-red-400 text-[10px] sm:text-xs md:text-sm font-semibold tabular-nums whitespace-nowrap">{formatTime(recordingTime)}</span>
          </div>
        )}

        <div className="flex-1 relative min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !disabled && !isRecording && handleSend()}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-200/50 dark:border-gray-800/50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald/50 focus:border-linka-emerald/50 bg-white dark:bg-gray-950 text-linka-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm disabled:opacity-50 touch-manipulation"
          />
        </div>
        
        {(value.trim() || selectedImage) && !isRecording && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-linka-emerald to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-linka-emerald/25 hover:shadow-linka-emerald/40 hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px]"
            title="Send message"
            aria-label="Send message"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

