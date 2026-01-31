/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

interface EnvSchema {
  [key: string]: {
    required: boolean
    type: 'string' | 'url' | 'number' | 'boolean'
    description: string
  }
}

const envSchema: EnvSchema = {
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    type: 'url',
    description: 'Supabase project URL',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    type: 'string',
    description: 'Supabase anonymous key',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: false,
    type: 'string',
    description: 'Supabase service role key (for scripts only)',
  },
  DATABASE_URL: {
    required: false,
    type: 'string',
    description: 'PostgreSQL connection string (for scripts only)',
  },
  NODE_ENV: {
    required: true,
    type: 'string',
    description: 'Node environment (development, production, test)',
  },
}

/**
 * Validate environment variables
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [key, config] of Object.entries(envSchema)) {
    const value = process.env[key]
    
    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} (${config.description})`)
      continue
    }
    
    // Skip validation if optional and not provided
    if (!value) continue
    
    // Validate type
    switch (config.type) {
      case 'url':
        try {
          new URL(value)
        } catch {
          errors.push(`Invalid URL for ${key}: ${value}`)
        }
        break
      
      case 'number':
        if (isNaN(Number(value))) {
          errors.push(`Invalid number for ${key}: ${value}`)
        }
        break
      
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          errors.push(`Invalid boolean for ${key}: ${value}`)
        }
        break
      
      // String type - no additional validation needed
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Run validation on startup
 */
if (process.env.NODE_ENV !== 'test') {
  const result = validateEnv()
  
  if (!result.valid) {
    console.error('❌ Environment variable validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration')
    }
  } else {
    console.log('✅ Environment variables validated successfully')
  }
}
