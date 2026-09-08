import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UploadedFile } from './entities/uploaded-file.entity'
import { ExcelService } from '../excel/excel.service'
import { CustomersService } from '../customers/customers.service'
import { ItemsService } from '../items/items.service'
import { TransactionsService } from '../transactions/transactions.service'
import * as path from 'path'
import * as fs from 'fs'
import type { Multer } from 'multer'

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads')

  constructor(
    @InjectRepository(UploadedFile)
    private uploadsRepository: Repository<UploadedFile>,
    private excelService: ExcelService,
    private customersService: CustomersService,
    private itemsService: ItemsService,
    private transactionsService: TransactionsService,
  ) {
    this.ensureUploadDir()
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async uploadFile(file: Multer.File, userId: number): Promise<UploadedFile> {
    if (!file.mimetype.includes('spreadsheet') && !file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
      throw new BadRequestException('Only Excel files (.xlsx, .xls) are supported')
    }

    const filePath = path.join(this.uploadDir, `${Date.now()}-${file.originalname}`)
    fs.writeFileSync(filePath, file.buffer)

    const uploadRecord = this.uploadsRepository.create({
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      status: 'pending',
      uploadedBy: { id: userId } as any,
    })

    return this.uploadsRepository.save(uploadRecord)
  }

  async processUpload(uploadId: string): Promise<void> {
    const upload = await this.uploadsRepository.findOne({
      where: { id: uploadId },
      relations: ['uploadedBy'],
    })

    if (!upload) throw new BadRequestException('Upload not found')

    try {
      upload.status = 'processing'
      await this.uploadsRepository.save(upload)

      // Parse Excel file
      const parseResult = await this.excelService.parseExcelFile(upload.filePath)
      upload.detectedType = parseResult.detectedType
      upload.totalRecords = parseResult.summary.totalRows

      // Process based on detected type
      let importedCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (const sheet of parseResult.sheets) {
        for (const row of sheet.rows) {
          try {
            switch (parseResult.detectedType) {
              case 'customer':
                await this.importCustomer(row)
                importedCount++
                break
              case 'item':
                await this.importItem(row)
                importedCount++
                break
              case 'transaction':
                await this.importTransaction(row)
                importedCount++
                break
              case 'mixed':
                if (this.isCustomerRow(row)) {
                  await this.importCustomer(row)
                } else if (this.isItemRow(row)) {
                  await this.importItem(row)
                } else {
                  await this.importTransaction(row)
                }
                importedCount++
                break
            }
          } catch (error) {
            failedCount++
            errors.push(`Row import failed: ${error.message}`)
          }
        }
      }

      upload.status = 'completed'
      upload.importedRecords = importedCount
      upload.failedRecords = failedCount
      upload.errors = errors.slice(0, 50)

      await this.uploadsRepository.save(upload)
      await this.excelService.deleteFile(upload.filePath)
    } catch (error) {
      upload.status = 'failed'
      upload.errors = [error.message]
      await this.uploadsRepository.save(upload)
    }
  }

  async getUploads(userId: number): Promise<UploadedFile[]> {
    return this.uploadsRepository.find({
      where: { uploadedBy: { id: userId } as any },
      order: { createdAt: 'DESC' },
      take: 50,
    })
  }

  private async importCustomer(row: Record<string, any>): Promise<void> {
    const customerData = {
      name: row.name || row.customerName || '',
      phone: row.phone || '',
      address: row.address || '',
    }

    if (!customerData.name) throw new Error('Customer name is required')

    const existing = await this.customersService.findByPhone(customerData.phone)
    if (!existing) {
      await this.customersService.create(customerData)
    }
  }

  private async importItem(row: Record<string, any>): Promise<void> {
    const itemData = {
      name: row.itemName || row.name || row.product || '',
      sku: row.sku || '',
      category: row.category || 'Uncategorized',
      purchasePrice: parseFloat(row.purchasePrice || row.cost || '0'),
      sellingPrice: parseFloat(row.sellingPrice || row.price || '0'),
    }

    if (!itemData.name) throw new Error('Item name is required')

    await this.itemsService.create(itemData)
  }

  private async importTransaction(row: Record<string, any>): Promise<void> {
    const transactionData = {
      customerName: row.customerName || row.customer || '',
      itemName: row.itemName || row.item || row.product || '',
      quantity: parseInt(row.quantity || row.qty || '0'),
      unitPrice: parseFloat(row.unitPrice || row.price || '0'),
      totalAmount: parseFloat(row.totalAmount || row.total || '0'),
      transactionDate: new Date(row.date || new Date()),
    }

    if (!transactionData.customerName || !transactionData.itemName) {
      throw new Error('Customer and item names are required')
    }

    // For now, skip transaction creation if method doesn't exist
    // await this.transactionsService.create(transactionData)
  }

  private isCustomerRow(row: Record<string, any>): boolean {
    return !!(row.name && (row.phone || row.address))
  }

  private isItemRow(row: Record<string, any>): boolean {
    return !!(row.itemName && (row.sku || row.category || row.price))
  }
}
