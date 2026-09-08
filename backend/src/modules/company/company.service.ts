import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

@Injectable()
export class CompanyService {
  private logoPath: string
  // In-memory storage as backup
  private logoMemory: { logo: string | null } = { logo: null }

  constructor() {
    // Use home directory for reliable file storage
    const homeDir = os.homedir()
    const appDir = path.join(homeDir, '.alem-crm')
    this.logoPath = path.join(appDir, 'company-logo.json')
    
    // Ensure directory exists
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true })
    }

    // Load logo from file on initialization
    this.loadLogoFromFile()
  }

  private loadLogoFromFile() {
    try {
      if (fs.existsSync(this.logoPath)) {
        const data = fs.readFileSync(this.logoPath, 'utf-8')
        this.logoMemory = JSON.parse(data)
        console.log('Logo loaded from file on service init')
      }
    } catch (error) {
      console.error('Error loading logo on init:', error)
    }
  }

  async getLogo() {
    try {
      console.log('Getting logo from memory:', !!this.logoMemory.logo)
      
      // First try to get from memory
      if (this.logoMemory.logo) {
        return this.logoMemory
      }

      // Try to load from file as fallback
      if (fs.existsSync(this.logoPath)) {
        const data = fs.readFileSync(this.logoPath, 'utf-8')
        const parsed = JSON.parse(data)
        this.logoMemory = parsed
        console.log('Logo loaded from file successfully')
        return parsed
      }

      console.log('No logo found')
      return { logo: null }
    } catch (error) {
      console.error('Error getting logo:', error)
      // Return from memory even if file read fails
      return this.logoMemory
    }
  }

  async saveLogo(logoData: string) {
    try {
      // Save to memory first (always works)
      this.logoMemory = { logo: logoData }

      // Save to file
      fs.writeFileSync(this.logoPath, JSON.stringify(this.logoMemory), 'utf-8')
      console.log('Logo saved successfully to:', this.logoPath)
      return { success: true, message: 'Logo saved successfully' }
    } catch (error) {
      console.error('Error saving logo:', error)
      // Even if file write fails, we have it in memory
      return { success: true, message: 'Logo saved to memory (file storage unavailable)' }
    }
  }
}
