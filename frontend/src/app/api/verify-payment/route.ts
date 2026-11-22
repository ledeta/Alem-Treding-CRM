import { NextRequest, NextResponse } from 'next/server'

// Map all frontend bank names to cheki bank codes
const BANK_MAP: Record<string, string> = {
  // Exact matches from dropdown
  'cbe': 'cbe',
  'nbe': 'cbe',           // NBE uses CBE network
  'dashen': 'dashen',
  'awash': 'awash',
  'abyssinia': 'boa',
  'boa': 'boa',
  'hibret': 'cbe',        // Fallback
  'addis': 'cbe',         // Fallback
  'berhan': 'cbe',        // Fallback
  'oromia': 'cbe',        // Fallback
  'wegagen': 'wegagen',
  'walia': 'cbe',         // Fallback
  'telebirr': 'telebirr',
  'cash': 'cbe',          // Cash has no receipt
  'm-pesa': 'mpesa',
  'mpesa': 'mpesa',
  'siinqee': 'siinqee',
  'ebirr': 'ebirr',
  'zamzam': 'zamzam',
  'cbebirr': 'cbebirr',
  'bunna': 'bunna',
}

// Auto-detect bank from transaction ID format
function detectBankFromId(transactionId: string): string {
  const tid = transactionId.trim().toUpperCase()
  
  // CBE new receipt links
  if (tid.includes('MBRECIEPT.CBE.COM.ET') || tid.includes('MB.CBE.COM.ET')) return 'cbe'
  // CBE legacy FT reference
  if (/^FT[0-9A-Z]{10,}/.test(tid)) return 'cbe'
  // Telebirr
  if (tid.startsWith('CHQ') || tid.includes('ETHIOTELECOM')) return 'telebirr'
  // Dashen - FT ref 16 chars
  if (tid.includes('ETAP') || tid.includes('DASHENBANKSC')) return 'dashen'
  if (/^[A-Z0-9]{16}$/.test(tid) && !tid.startsWith('FT')) return 'dashen'
  // Awash - share link
  if (tid.includes('AWASHPAY') || tid.startsWith('-')) return 'awash'
  // BOA
  if (tid.includes('CS.BANKOFABYSSINIA') || tid.startsWith('BOA')) return 'boa'
  // M-Pesa
  if (tid.includes('MPESA') || tid.includes('SAFARICOM')) return 'mpesa'
  // Siinqee
  if (tid.includes('SIINQEE')) return 'siinqee'
  // eBirr
  if (tid.includes('EBIRR') || tid.includes('RECEIPT.EBIRR')) return 'ebirr'
  // ZamZam
  if (tid.includes('ZAMZAM')) return 'zamzam'
  // CBE Birr
  if (/^DTS[A-Z0-9]+/.test(tid) || tid.includes('CBEPAY')) return 'cbebirr'
  // Bunna
  if (tid.includes('BUNNABANKSC')) return 'bunna'
  // Wegagen
  if (tid.includes('WEGAGEN')) return 'wegagen'
  
  return 'cbe' // default
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, bank, account, phoneNumber } = body

    if (!transactionId?.trim()) {
      return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    }

    const tid = transactionId.trim()
    
    // Get bank code - normalize to lowercase first
    const bankLower = (bank || '').toLowerCase().trim()
    let bankCode = BANK_MAP[bankLower]
    
    // If not found in map, auto-detect from transaction ID
    if (!bankCode) {
      bankCode = detectBankFromId(tid)
    }

    console.log(`[verify-payment] bank="${bank}" → code="${bankCode}" tid="${tid}"`)

    // Build cheki request
    const chekiBody: any = {
      bank: bankCode,
      reference: tid,
    }
    if (account?.trim()) {
      chekiBody.accountNumber = account.trim()
    }
    if (phoneNumber?.trim()) {
      chekiBody.phoneNumber = phoneNumber.trim()
    }

    // Call cheki.et from server side (no CORS restrictions)
    const chekiResponse = await fetch('https://cheki.et/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chekiBody),
      signal: AbortSignal.timeout(30000),
    })

    const result = await chekiResponse.json()
    console.log(`[verify-payment] cheki response: verified=${result.verified} error=${result.error}`)

    if (result.verified === true) {
      return NextResponse.json({
        success: true,
        verified: true,
        bank: result.bank || bank,
        transactionId: tid,
        data: {
          payer_name: result.senderName || null,
          payer_account: result.senderAccount || null,
          receiver_name: result.receiverName || null,
          receiver_account: result.receiverAccount || null,
          amount: result.amount || null,
          currency: result.currency || 'ETB',
          date: result.date || null,
          reference: result.reference || tid,
          status: 'SUCCESS',
        },
      })
    }

    // Handle geo-blocked banks (Telebirr, M-Pesa)
    if (chekiResponse.status === 502 && result.fallbackUrl) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: `${result.bank || bank} receipts cannot be verified from outside Ethiopia. Click the link below to check manually.`,
        fallbackUrl: result.fallbackUrl,
        transactionId: tid,
      })
    }

    // Not verified
    return NextResponse.json({
      success: false,
      verified: false,
      error: result.error || `Transaction not found in ${result.bank || bank}. Please check the transaction ID.`,
      fallbackUrl: result.fallbackUrl || null,
      transactionId: tid,
    })

  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    console.error('[verify-payment] Error:', error?.message)
    return NextResponse.json({
      success: false,
      verified: false,
      error: isTimeout
        ? 'Verification timed out (30s). Please try again.'
        : `Verification failed: ${error?.message || 'Unknown error'}`,
    }, { status: 502 })
  }
}
