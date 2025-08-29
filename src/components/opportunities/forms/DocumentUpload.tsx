'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  X,
  Image,
  FileSpreadsheet
} from 'lucide-react'
import { toast } from 'sonner'

// Supported file types
const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'text/plain': ['.txt']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface Document {
  id: string
  fileName: string
  fileSize: number
  fileType?: string
  url: string
  uploadedAt: string
}

interface DocumentUploadProps {
  opportunityId: string
  documents: Document[]
  onDocumentUploaded: (document: Document) => void
  onDocumentDeleted: (documentId: string) => void
  disabled?: boolean
}

interface UploadProgress {
  fileName: string
  progress: number
  error?: string
  completed?: boolean
}

export default function DocumentUpload({
  opportunityId,
  documents,
  onDocumentUploaded,
  onDocumentDeleted,
  disabled = false
}: DocumentUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please upload PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, or TXT files.`
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds limit. Maximum file size is 10MB.`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const fileKey = `${file.name}-${Date.now()}`
    
    // Set initial progress
    setUploadProgress(prev => ({
      ...prev,
      [fileKey]: {
        fileName: file.name,
        progress: 0
      }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', opportunityId)

      // Simulate progress updates (in real implementation, you might use XHR for progress)
      setUploadProgress(prev => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], progress: 25 }
      }))

      const response = await fetch('/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(prev => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], progress: 75 }
      }))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      setUploadProgress(prev => ({
        ...prev,
        [fileKey]: { 
          ...prev[fileKey], 
          progress: 100, 
          completed: true 
        }
      }))

      // Call parent callback
      onDocumentUploaded(result.data)

      toast.success(`${file.name} uploaded successfully!`)

      // Remove progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileKey]
          return newProgress
        })
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadProgress(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          progress: 0,
          error: errorMessage
        }
      }))

      toast.error(`Failed to upload ${file.name}: ${errorMessage}`)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    for (const file of acceptedFiles) {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        continue
      }

      await uploadFile(file)
    }
  }, [disabled, opportunityId, onDocumentUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: true,
    accept: SUPPORTED_FILE_TYPES
  })

  const handleDeleteDocument = async (document: Document) => {
    if (disabled) return

    try {
      const response = await fetch('/api/uploads/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          opportunityId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      onDocumentDeleted(document.id)
      toast.success(`${document.fileName} deleted successfully!`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error(`Failed to delete ${document.fileName}: ${errorMessage}`)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.toLowerCase().split('.').pop()
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-4 h-4" />
    }
    if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileSpreadsheet className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const progressEntries = Object.entries(uploadProgress)

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload financial models, market analysis, property photos, and other relevant documents.
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT. Max 10 MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive || dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <Button type="button" variant="outline" disabled={disabled}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {progressEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressEntries.map(([key, progress]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{progress.fileName}</span>
                  <div className="flex items-center gap-2">
                    {progress.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : progress.error ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{progress.progress}%</span>
                    )}
                  </div>
                </div>
                {!progress.error && (
                  <Progress value={progress.progress} className="h-2" />
                )}
                {progress.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{progress.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(document.fileName, document.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{document.fileName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Download ${document.fileName}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(document)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      title={`Delete ${document.fileName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && progressEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
      )}
    </div>
  )
}