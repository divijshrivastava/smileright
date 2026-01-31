/**
 * File Upload Security Validation
 * Validates actual file content, not just MIME types
 */

/**
 * File magic numbers (file signatures) for validation
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF
  ],
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
  ],
  'video/quicktime': [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74],
  ],
  'video/webm': [
    [0x1A, 0x45, 0xDF, 0xA3],
  ],
}

/**
 * Validate file content against magic numbers
 */
export async function validateFileContent(file: File): Promise<boolean> {
  const expectedSignatures = FILE_SIGNATURES[file.type]
  
  if (!expectedSignatures) {
    return false
  }
  
  try {
    // Read first 12 bytes of the file
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check if any signature matches
    return expectedSignatures.some(signature => {
      if (bytes.length < signature.length) {
        return false
      }
      
      return signature.every((byte, index) => bytes[index] === byte)
    })
  } catch {
    return false
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          width: img.width,
          height: img.height,
          error: `Image dimensions exceed maximum allowed (${maxWidth}x${maxHeight})`,
        })
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        })
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, error: 'Invalid image file' })
    }
    
    img.src = url
  })
}

/**
 * Comprehensive file validation
 */
export interface FileValidationConfig {
  allowedTypes: string[]
  maxSize: number // in bytes
  checkContent?: boolean
  maxWidth?: number
  maxHeight?: number
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  details?: {
    type: string
    size: number
    dimensions?: { width: number; height: number }
  }
}

export async function validateFile(
  file: File,
  config: FileValidationConfig
): Promise<FileValidationResult> {
  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
    }
  }
  
  // Check file size
  if (file.size > config.maxSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    const maxSizeMB = (config.maxSize / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
    }
  }
  
  // Validate file content by magic numbers
  if (config.checkContent !== false) {
    const contentValid = await validateFileContent(file)
    if (!contentValid) {
      return {
        valid: false,
        error: 'File content does not match declared file type',
      }
    }
  }
  
  // Validate image dimensions if applicable
  if (file.type.startsWith('image/') && (config.maxWidth || config.maxHeight)) {
    const dimensionResult = await validateImageDimensions(
      file,
      config.maxWidth,
      config.maxHeight
    )
    
    if (!dimensionResult.valid) {
      return {
        valid: false,
        error: dimensionResult.error,
      }
    }
    
    return {
      valid: true,
      details: {
        type: file.type,
        size: file.size,
        dimensions: {
          width: dimensionResult.width!,
          height: dimensionResult.height!,
        },
      },
    }
  }
  
  return {
    valid: true,
    details: {
      type: file.type,
      size: file.size,
    },
  }
}

/**
 * Predefined validation configs
 */
export const fileValidationConfigs = {
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    checkContent: true,
    maxWidth: 4096,
    maxHeight: 4096,
  },
  video: {
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxSize: 50 * 1024 * 1024, // 50MB
    checkContent: true,
  },
}
