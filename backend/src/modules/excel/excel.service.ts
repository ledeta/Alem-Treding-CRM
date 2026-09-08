import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { Workbook } from 'exceljs'
import * as fs from 'fs'
import { SalesImportRowDto } from './dtos/sales-import.dto'

export interface ColumnMapping {
  column: string
  header: string
  dataType: 'string' | 'number' | 'date' | 'phone' | 'email'
  confidence: number
}

export interface ExcelParseResult {
  fileName: string
  sheets: SheetData[]
  detectedType: 'customer' | 'item' | 'transaction' | 'mixed' | 'unknown'
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    errors: string[]
  }
}

export interface SheetData {
  name: string
  headers: string[]
  rows: Record<string, any>[]
  columnMappings: ColumnMapping[]
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name)
  private readonly CUSTOMER_KEYWORDS = [
    'customer', 'name', 'phone', 'address', 'contact', 'client', 'buyer',
  ]
  private readonly ITEM_KEYWORDS = [
    'item', 'product', 'sku', 'category', 'price', 'quantity', 'stock', 'warehouse',
  ]
  private readonly TRANSACTION_KEYWORDS = [
    'transaction', 'sale', 'purchase', 'date', 'amount', 'total', 'qty', 'unit',
  ]

  // Sales import specific keywords mapping
  private readonly SALES_COLUMN_MAPPING = {
    customerName: ['customer', 'name', 'customer name', 'buyer'],
    itemName: ['item', 'product', 'item name', 'product name', 'goods'],
    quantity: ['qty', 'quantity', 'amount', 'units'],
    sellingPrice: ['price', 'selling price', 'unit price', 'rate'],
    soldBy: ['sold by', 'salesman', 'sales', 'salesperson', 'user'],
    branch: ['branch', 'location', 'warehouse', 'shop'],
    date: ['date', 'transaction date', 'sale date', 'sold date'],
    discount: ['discount', 'discount amount'],
    tax: ['tax', 'tax amount', 'vat'],
    notes: ['notes', 'remarks', 'description'],
  }

  async parseExcelFile(filePath: string): Promise<ExcelParseResult> {
    const workbook = new Workbook()
    await workbook.xlsx.readFile(filePath)

    const sheets: SheetData[] = []
    let detectedType: 'customer' | 'item' | 'transaction' | 'mixed' | 'unknown' = 'unknown'
    const allErrors: string[] = []
    let totalRows = 0
    let validRows = 0

    for (const worksheet of workbook.worksheets) {
      if (worksheet.rowCount === 0) continue

      const headers: string[] = []
      const rows: Record<string, any>[] = []
      const columnMappings: ColumnMapping[] = []

      // Extract headers
      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        headers.push(String(cell.value || '').toLowerCase().trim())
      })

      // Detect data type from headers
      const dataType = this.detectDataType(headers)
      if (dataType !== 'unknown' && detectedType === 'unknown') {
        detectedType = dataType
      } else if (dataType !== 'unknown' && dataType !== detectedType && detectedType !== 'unknown') {
        detectedType = 'mixed'
      }

      // Map columns
      for (let i = 0; i < headers.length; i++) {
        const mapping = this.mapColumn(headers[i], i, dataType)
        columnMappings.push(mapping)
      }

      // Extract rows
      for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum)
        const rowData: Record<string, any> = {}
        let hasData = false
        let isValid = true

        row.eachCell((cell, colNum) => {
          const header = headers[colNum - 1]
          const mapping = columnMappings[colNum - 1]

          if (cell.value) {
            hasData = true
            rowData[header] = this.parseCell(cell.value, mapping.dataType)

            // Validate
            if (!this.validateCell(rowData[header], mapping.dataType)) {
              isValid = false
              allErrors.push(`Row ${rowNum}, Column ${header}: Invalid ${mapping.dataType}`)
            }
          }
        })

        if (hasData) {
          totalRows++
          if (isValid) {
            validRows++
            rows.push(rowData)
          }
        }
      }

      sheets.push({
        name: worksheet.name,
        headers,
        rows,
        columnMappings,
      })
    }

    return {
      fileName: filePath.split('\\').pop() || 'unknown',
      sheets,
      detectedType,
      summary: {
        totalRows,
        validRows,
        invalidRows: totalRows - validRows,
        errors: allErrors.slice(0, 50), // Limit to first 50 errors
      },
    }
  }

  private detectDataType(headers: string[]): 'customer' | 'item' | 'transaction' | 'unknown' {
    const headerStr = headers.join(' ').toLowerCase()

    let customerScore = 0
    let itemScore = 0
    let transactionScore = 0

    this.CUSTOMER_KEYWORDS.forEach((keyword) => {
      if (headerStr.includes(keyword)) customerScore++
    })

    this.ITEM_KEYWORDS.forEach((keyword) => {
      if (headerStr.includes(keyword)) itemScore++
    })

    this.TRANSACTION_KEYWORDS.forEach((keyword) => {
      if (headerStr.includes(keyword)) transactionScore++
    })

    if (customerScore > itemScore && customerScore > transactionScore) return 'customer'
    if (itemScore > customerScore && itemScore > transactionScore) return 'item'
    if (transactionScore > customerScore && transactionScore > itemScore) return 'transaction'

    return 'unknown'
  }

  private mapColumn(
    header: string,
    index: number,
    dataType: 'customer' | 'item' | 'transaction' | 'mixed' | 'unknown'
  ): ColumnMapping {
    let mappedHeader = header
    let detectedType: 'string' | 'number' | 'date' | 'phone' | 'email' = 'string'
    let confidence = 0

    // Phone detection
    if (header.includes('phone') || header.includes('tel') || header.includes('mobile')) {
      detectedType = 'phone'
      confidence = 0.95
      mappedHeader = 'phone'
    }
    // Email detection
    else if (header.includes('email') || header.includes('mail')) {
      detectedType = 'email'
      confidence = 0.95
      mappedHeader = 'email'
    }
    // Date detection
    else if (
      header.includes('date') ||
      header.includes('time') ||
      header.includes('created') ||
      header.includes('updated')
    ) {
      detectedType = 'date'
      confidence = 0.9
      mappedHeader = 'date'
    }
    // Number detection
    else if (
      header.includes('price') ||
      header.includes('amount') ||
      header.includes('quantity') ||
      header.includes('qty') ||
      header.includes('total') ||
      header.includes('cost')
    ) {
      detectedType = 'number'
      confidence = 0.9
      mappedHeader = header.includes('price') ? 'price' : header.includes('amount') ? 'amount' : 'quantity'
    }
    // String detection
    else if (
      header.includes('name') ||
      header.includes('title') ||
      header.includes('item') ||
      header.includes('product')
    ) {
      detectedType = 'string'
      confidence = 0.85
      mappedHeader = header.includes('item') ? 'itemName' : 'name'
    }

    return {
      column: header,
      header: mappedHeader,
      dataType: detectedType,
      confidence,
    }
  }

  private parseCell(value: any, dataType: 'string' | 'number' | 'date' | 'phone' | 'email'): any {
    switch (dataType) {
      case 'number':
        const num = Number(value)
        return isNaN(num) ? 0 : num
      case 'date':
        return this.parseDate(value)
      case 'phone':
        return String(value).replace(/\D/g, '').slice(-10)
      case 'email':
        return String(value).toLowerCase().trim()
      case 'string':
      default:
        return String(value).trim()
    }
  }

  private parseDate(value: any): Date {
    if (value instanceof Date) return value
    if (typeof value === 'number') {
      // Excel serial date
      const excelEpoch = new Date(1900, 0, 1)
      const result = new Date(excelEpoch)
      result.setDate(result.getDate() + value - 2)
      return result
    }
    return new Date(value)
  }

  private validateCell(value: any, dataType: 'string' | 'number' | 'date' | 'phone' | 'email'): boolean {
    if (value === null || value === undefined) return false

    switch (dataType) {
      case 'number':
        return typeof value === 'number' && !isNaN(value) && value >= 0
      case 'date':
        return value instanceof Date && !isNaN(value.getTime())
      case 'phone':
        return /^\d{7,}$/.test(String(value))
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
      case 'string':
      default:
        return String(value).length > 0
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error)
    }
  }

  /**
   * Parse Excel file for sales import
   * Expected columns: Customer name, Item name, Quantity, Selling price, Sold by, Branch, Date
   */
  async parseSalesImportExcel(filePath: string): Promise<{
    rows: SalesImportRowDto[]
    columnMapping: Record<string, number | null>
    errors: Array<{ rowNumber: number; error: string }>
  }> {
    try {
      this.logger.log(`Starting to parse sales import Excel: ${filePath}`)
      const workbook = new Workbook()
      await workbook.xlsx.readFile(filePath)

      const worksheet = workbook.worksheets[0]
      if (!worksheet || worksheet.rowCount === 0) {
        this.logger.error('Excel file is empty or has no worksheets')
        throw new BadRequestException('Excel file is empty')
      }

      this.logger.log(`Worksheet found with ${worksheet.rowCount} rows`)

      // Extract headers
      const headers: string[] = []
      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        headers.push(String(cell.value || '').toLowerCase().trim())
      })

      this.logger.log(`Extracted headers: ${JSON.stringify(headers)}`)

      // Auto-detect and map columns
      const columnMapping = this.mapSalesColumns(headers)
      this.logger.log(`Mapped columns: ${JSON.stringify(columnMapping)}`)

      // Validate required columns are found
      const requiredColumns = ['customerName', 'itemName', 'quantity', 'sellingPrice', 'soldBy', 'branch', 'date']
      const missingColumns = requiredColumns.filter((col) => columnMapping[col] === null)

      if (missingColumns.length > 0) {
        throw new BadRequestException(
          `Missing required columns: ${missingColumns.join(', ')}. Expected: Customer Name, Item Name, Quantity, Selling Price, Sold By, Branch, Date`,
        )
      }

      // Parse rows
      const rows: SalesImportRowDto[] = []
      const errors: Array<{ rowNumber: number; error: string }> = []

      for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum)
        let hasData = false
        const rowData: any = {}

        // Extract data based on mapped columns
        Object.entries(columnMapping).forEach(([fieldName, colNum]) => {
          if (colNum !== null) {
            const cell = row.getCell(colNum)
            if (cell.value) {
              hasData = true
              rowData[fieldName] = this.parseSalesCell(cell.value, fieldName)
            }
          }
        })

        if (!hasData) continue

        try {
          // Validate required fields
          if (!rowData.customerName || !rowData.itemName || !rowData.quantity || !rowData.sellingPrice) {
            throw new Error('Missing required fields: customer name, item name, quantity, or selling price')
          }

          if (!rowData.soldBy || !rowData.branch) {
            throw new Error('Missing required fields: sold by or branch')
          }

          if (typeof rowData.quantity !== 'number' || rowData.quantity <= 0) {
            throw new Error('Quantity must be a positive number')
          }

          if (typeof rowData.sellingPrice !== 'number' || rowData.sellingPrice <= 0) {
            throw new Error('Selling price must be a positive number')
          }

          if (!['Warehouse', 'Shop'].includes(rowData.branch)) {
            throw new Error(`Invalid branch value "${rowData.branch}". Branch must be exactly "Warehouse" or "Shop" (case-sensitive). Accepted values: Warehouse, Shop, or abbreviations: W, S, WH, SH`)
          }

          rows.push({
            customerName: String(rowData.customerName).trim(),
            itemName: String(rowData.itemName).trim(),
            quantity: rowData.quantity,
            sellingPrice: rowData.sellingPrice,
            soldBy: String(rowData.soldBy).trim(),
            branch: rowData.branch,
            date: rowData.date || new Date(),
            discount: rowData.discount || 0,
            tax: rowData.tax || 0,
            notes: rowData.notes || undefined,
          })
        } catch (error) {
          errors.push({
            rowNumber: rowNum,
            error: error instanceof Error ? error.message : String(error),
          })
          this.logger.warn(`Row ${rowNum} error: ${error}`)
        }
      }

      if (rows.length === 0 && errors.length === 0) {
        this.logger.error('No valid data found in Excel file')
        throw new BadRequestException('No valid data found in Excel file')
      }

      this.logger.log(`Successfully parsed ${rows.length} valid rows with ${errors.length} errors`)
      return { rows, columnMapping, errors }
    } catch (error) {
      this.logger.error(`Excel parsing error: ${error}`)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Map Excel columns to sales import fields
   */
  private mapSalesColumns(headers: string[]): Record<string, number | null> {
    const mapping: Record<string, number | null> = {
      customerName: null,
      itemName: null,
      quantity: null,
      sellingPrice: null,
      soldBy: null,
      branch: null,
      date: null,
      discount: null,
      tax: null,
      notes: null,
    }

    this.logger.debug(`Mapping columns from headers: ${JSON.stringify(headers)}`)
    this.logger.debug(`Available keywords: ${JSON.stringify(this.SALES_COLUMN_MAPPING)}`)

    // First pass: exact keyword matching
    for (const [fieldName, keywords] of Object.entries(this.SALES_COLUMN_MAPPING)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]
        const isMatch = keywords.some((keyword) => {
          const cleanHeader = header.replace(/\s+/g, ' ')
          return cleanHeader.includes(keyword) || cleanHeader.includes(keyword.replace(/\s+/g, '_'))
        })

        if (isMatch) {
          mapping[fieldName] = i + 1 // ExcelJS uses 1-based column indexing
          this.logger.log(`Matched field "${fieldName}" to column ${i + 1} (header: "${header}")`)
          break
        }
      }
    }

    // Second pass: fuzzy matching for unmapped critical columns
    if (mapping.customerName === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        // AGGRESSIVE: Match any column that suggests customer data
        if ((h.includes('customer') || h === 'name' || h.includes('buyer') || h.includes('contact') || 
             h.includes('person') || h === 'customer name' || h.match(/^[a-z]{1,20}$/) || h === 'c' || h === 'cust') &&
            !h.includes('item') && !h.includes('product') && !h.includes('price') && !h.includes('qty') && 
            !h.includes('quantity') && !h.includes('date') && !h.includes('branch') && !h.includes('sold by') && 
            !h.includes('discount') && !h.includes('tax') && !h.includes('amount') && !h.includes('total')) {
          mapping.customerName = i + 1
          this.logger.log(`Fuzzy matched customerName to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    if (mapping.itemName === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        // AGGRESSIVE: Match any column that suggests item data
        if ((h.includes('item') || h.includes('product') || h.includes('goods') || h.includes('service') ||
             h === 'item name' || h === 'product name' || h === 'item' || h === 'i' || h === 'desc') &&
            !h.includes('customer') && !h.includes('buyer') && !h.includes('quantity') && 
            !h.includes('price') && !h.includes('qty') && !h.includes('date')) {
          mapping.itemName = i + 1
          this.logger.log(`Fuzzy matched itemName to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    // Third pass: for critical missing columns, be even MORE aggressive
    if (mapping.quantity === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (h.includes('qty') || h.includes('quantity') || h === 'q' || h === 'amount' || h === 'units') {
          mapping.quantity = i + 1
          this.logger.log(`Fuzzy matched quantity to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    if (mapping.sellingPrice === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (h.includes('price') || h.includes('rate') || h === 'p' || h.includes('unit price')) {
          mapping.sellingPrice = i + 1
          this.logger.log(`Fuzzy matched sellingPrice to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    if (mapping.soldBy === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (h.includes('sold by') || h.includes('salesman') || h.includes('sales') || h === 'sold' || h === 's' || h.includes('person')) {
          mapping.soldBy = i + 1
          this.logger.log(`Fuzzy matched soldBy to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    if (mapping.branch === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (h.includes('branch') || h === 'b' || h.includes('location') || h.includes('warehouse') || h.includes('shop')) {
          mapping.branch = i + 1
          this.logger.log(`Fuzzy matched branch to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    if (mapping.date === null) {
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (h.includes('date') || h === 'd' || h.includes('transaction') || h.includes('sale date')) {
          mapping.date = i + 1
          this.logger.log(`Fuzzy matched date to column ${i + 1} (header: "${headers[i]}")`)
          break
        }
      }
    }

    this.logger.debug(`Final column mapping: ${JSON.stringify(mapping)}`)
    return mapping
  }

  /**
   * Parse a cell value for sales import
   */
  private parseSalesCell(value: any, fieldName: string): any {
    if (value === null || value === undefined) {
      return fieldName === 'date' ? new Date() : null
    }

    switch (fieldName) {
      case 'quantity':
      case 'sellingPrice':
      case 'discount':
      case 'tax':
        const num = Number(value)
        return isNaN(num) ? 0 : num

      case 'date':
        return this.parseDate(value)

      case 'branch':
        let branch = String(value).trim()
        // Ultra-aggressive branch normalization - remove numbers and extra spaces
        branch = branch.replace(/\d+/g, '').trim() // Remove all numbers
        branch = branch.replace(/\s+/g, ' ').trim() // Normalize spaces
        
        // Auto-normalize branch names
        const branchLower = branch.toLowerCase()
        if (branchLower.includes('warehouse') || branchLower === 'wh' || branchLower === 'w') {
          return 'Warehouse'
        }
        if (branchLower.includes('shop') || branchLower === 'sh' || branchLower === 's') {
          return 'Shop'
        }
        // Return as-is, validation will catch if invalid
        return branch

      case 'customerName':
      case 'itemName':
      case 'soldBy':
      case 'notes':
      default:
        return String(value).trim()
    }
  }

  /**
   * Detect category from item name
   */
  detectCategoryFromItemName(itemName: string): string {
    const name = itemName.toLowerCase()

    // Common categories
    const categories: Record<string, string[]> = {
      'Grains & Cereals': ['rice', 'wheat', 'maize', 'corn', 'barley', 'grain', 'cereal'],
      'Legumes': ['bean', 'lentil', 'pea', 'chickpea', 'pulse'],
      'Oils & Fats': ['oil', 'ghee', 'butter', 'fat'],
      'Spices': ['spice', 'salt', 'pepper', 'cumin', 'turmeric'],
      'Vegetables': ['vegetable', 'onion', 'garlic', 'potato', 'tomato', 'carrot'],
      'Fruits': ['fruit', 'apple', 'banana', 'orange', 'mango'],
      'Dairy': ['milk', 'cheese', 'yogurt', 'dairy'],
      'Meat & Fish': ['meat', 'chicken', 'fish', 'beef', 'lamb'],
      'Bakery': ['bread', 'flour', 'bake'],
      'Beverages': ['tea', 'coffee', 'juice', 'beverage', 'drink'],
      'General': ['item', 'product', 'goods'],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => name.includes(keyword))) {
        return category
      }
    }

    return 'General'
  }
}
