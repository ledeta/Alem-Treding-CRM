/**
 * DTO for importing customers from Excel (Column B only)
 * This is a simple import that ONLY creates customer records
 * without creating any transactions or items
 */
export class CustomerImportRowDto {
  /**
   * Customer name extracted from Excel Column B
   */
  customerName: string;

  /**
   * Optional phone number (can be parsed from the same or adjacent column)
   */
  phone?: string;

  /**
   * Optional email (can be parsed from the same or adjacent column)
   */
  email?: string;

  /**
   * Optional address/location
   */
  address?: string;

  /**
   * Optional city
   */
  city?: string;
}
