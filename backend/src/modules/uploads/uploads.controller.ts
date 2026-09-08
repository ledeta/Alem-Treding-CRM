import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadsService } from './uploads.service'
import { JwtAuthGuard } from '../../common/guards/auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { Multer } from 'multer'

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }

    const upload = await this.uploadsService.uploadFile(file, user.id)
    
    // Start processing asynchronously
    this.uploadsService.processUpload(upload.id).catch((error) => {
      console.error('Background upload processing failed:', error)
    })

    return {
      success: true,
      uploadId: upload.id,
      message: 'File uploaded and processing started',
    }
  }

  @Get()
  async getUploads(@CurrentUser() user: any) {
    const uploads = await this.uploadsService.getUploads(user.id)
    return uploads.map((upload) => ({
      id: upload.id,
      fileName: upload.fileName,
      status: upload.status,
      detectedType: upload.detectedType,
      totalRecords: upload.totalRecords,
      importedRecords: upload.importedRecords,
      failedRecords: upload.failedRecords,
      errors: upload.errors || [],
      createdAt: upload.createdAt,
    }))
  }
}
