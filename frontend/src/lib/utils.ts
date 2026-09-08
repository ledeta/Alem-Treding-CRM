import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'ብር'): string {
  // Format the number without currency symbol first
  const numberFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const formattedNumber = numberFormatter.format(value);
  
  // Return with ብር symbol at the end (correct format: 454,600 ับር)
  return `${formattedNumber} ${currency}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function getBalanceColor(balance: number): string {
  if (balance > 0) return 'text-green-600'
  if (balance < 0) return 'text-red-600'
  return 'text-gray-400'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
