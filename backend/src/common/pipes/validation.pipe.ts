import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ValidationError,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: any): Promise<any> {
    if (!metadata.type || !metadata.metatype) {
      return value
    }

    // Skip validation for primitive types
    if (
      [String, Boolean, Number, Array, Object].includes(metadata.metatype)
    ) {
      return value
    }

    const object = plainToClass(metadata.metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors)
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      })
    }

    return object
  }

  private formatErrors(errors: ValidationError[]): any {
    const formatted: any = {}

    errors.forEach((error) => {
      if (error.constraints) {
        formatted[error.property] = Object.values(error.constraints)
      }
      if (error.children && error.children.length > 0) {
        formatted[error.property] = this.formatErrors(error.children)
      }
    })

    return formatted
  }
}
