import { useRef, useState } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_FILES = 8
const MAX_BYTES = 5 * 1024 * 1024

export function ImageUploader({ images, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  function addFiles(fileList) {
    const incoming = [...fileList]
    const next = [...images]
    let message = ''

    for (const file of incoming) {
      if (next.length >= MAX_FILES) {
        message = `You can upload up to ${MAX_FILES} photos.`
        break
      }
      if (!file.type.startsWith('image/')) {
        message = 'Only image files are accepted.'
        continue
      }
      if (file.size > MAX_BYTES) {
        message = 'Each photo must be under 5 MB.'
        continue
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      })
    }

    setLocalError(message)
    onChange(next)
  }

  function removeImage(id) {
    const target = images.find((image) => image.id === id)
    if (target?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(target.preview)
    }
    onChange(images.filter((image) => image.id !== id))
    setLocalError('')
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="uploader">
      <div
        className={dragging ? 'uploader__dropzone is-dragging' : 'uploader__dropzone'}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false)
          }
        }}
        onDrop={handleDrop}
      >
        <p className="uploader__title">Drag and drop property photos here</p>
        <p className="uploader__hint">JPG, PNG, or WebP · up to {MAX_FILES} files · 5 MB each</p>
        <button type="button" className="uploader__browse" onClick={() => inputRef.current?.click()}>
          Browse files
        </button>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {images.length > 0 ? (
        <ul className="uploader__grid">
          {images.map((image, index) => (
            <li key={image.id} className="uploader__item">
              <img src={image.preview} alt={`Upload preview ${index + 1}`} />
              {index === 0 ? <span className="uploader__badge">Cover</span> : null}
              <button
                type="button"
                className="uploader__remove"
                aria-label={`Remove ${image.name}`}
                onClick={() => removeImage(image.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {localError || error ? <p className="form-error">{localError || error}</p> : null}
    </div>
  )
}
