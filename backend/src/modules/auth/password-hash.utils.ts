import * as argon2 from 'argon2'

export class PasswordHashUtils {
  /**
   * Hash a password using Argon2
   * @param password Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
        raw: false,
      })
    } catch (error) {
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password to verify
   * @param hash Hashed password to compare against
   * @returns True if password matches, false otherwise
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password)
    } catch (error) {
      return false
    }
  }

  /**
   * Check if a password needs to be rehashed (for algorithm updates)
   * @param hash Current password hash
   * @returns True if hash needs update
   */
  static async needsRehash(hash: string): Promise<boolean> {
    try {
      // For argon2, we can't easily check parameters without a private API
      // In production, you'd track algorithm version separately or use a wrapper
      // For now, assume hashes created with this utility are valid
      return false
    } catch (error) {
      return true // If we can't parse, assume needs rehash
    }
  }

  /**
   * Validate password strength
   * @param password Password to validate
   * @returns Validation result
   */
  static validatePasswordStrength(password: string): {
    isStrong: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isStrong: errors.length === 0,
      errors,
    }
  }
}
