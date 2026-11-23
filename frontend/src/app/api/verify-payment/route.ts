import { NextRequest, NextResponse } from 'next/server'

// Map all frontend bank names to cheki bank codes
const BANK_MAP: Record<string, string> = {
  'cbe': 'cbe', 'nbe': 'cbe', 'dashen': 'dashen', 'awash': 'awash',
  'abyssinia': 'boa', 'boa': 'boa', 'hibret': 'cbe', 'addis': 'cbe',
  'berhan': 'cbe', 'oromia': 'cbe', 'wegagen': 'wegagen', 'walia': 'cbe',
  'telebirr': 'telebirr', 'cash': 'cbe', 'm-pesa': 'mpesa', 'mpesa': 'mpesa',
  'siinqee': 'siinqee', 'ebirr': 'ebirr', 'zamzam': 'zamzam',
  'cbe birr': 'cbebirr', 'cbebirr': 'cbebirr', 'bunna': 'bunna',
}

function detectBankFromId(transactionId: string): string {
  const tid = transactionId.trim().toUpperCase()
  if (tid.includes('MBRECIEPT.CBE.COM.ET') || tid.includes('MB.CBE.COM.ET')) return 'cbe'
  if (/^FT[0-9A-Z]{8,}/.test(tid)) return 'cbe'
  if (tid.startsWith('CHQ')) return 'telebirr'
  if (tid.includes('ETHIOTELECOM')) return 'telebirr'
  if (/^[A-Z0-9]{10}$/.test(tid) && !tid.startsWith('FT')) return 'telebirr'
  if (tid.includes('ETAP') || tid.includes('DASHENBANKSC')) return 'dashen'
  if (/^[A-Z0-9]{16}$/.test(tid) && !tid.startsWith('FT')) return 'dashen'
  if (tid.includes('AWASHPAY') || /^-[A-Z0-9]+/.test(tid)) return 'awash'
  if (tid.includes('CS.BANKOFABYSSINIA') || tid.startsWith('BOA')) return 'boa'
  if (tid.includes('MPESA') || tid.includes('SAFARICOM')) return 'mpesa'
  if (tid.includes('SIINQEE')) return 'siinqee'
  if (tid.includes('EBIRR')) return 'ebirr'
  if (tid.includes('ZAMZAM')) return 'zamzam'
  if (/^DTS[A-Z0-9]+/.test(tid)) return 'cbebirr'
  if (tid.includes('BUNNABANKSC')) return 'bunna'
  if (tid.includes('WEGAGEN')) return 'wegagen'
  return 'unknown'
}

// Try Telebirr using telebirr-receipt package (works from Ethiopia only)
async function verifyTelebirr(receiptNo: string) {
  try {
    // Dynamically import - server side only
    const { receipt, utils: { loadReceipt, parseFromHTML } } = require('telebirr-receipt')

    // Disable SSL verification (known issue with Telebirr cert)
    const origEnv = process.env['NODE_TLS_REJECT_UNAUTHORIZED']
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

    try {
      const html = await loadReceipt({ receiptNo })
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = origEnv ?? '1'

      const parsed = parseFromHTML(html)
      console.log('[telebirr] parsed:', parsed)

      if (!parsed || Object.keys(parsed).length === 0) {
        return { success: false, verified: false, error: 'Could not parse Telebirr receipt. Receipt may not exist.' }
      }

      return {
        success: true,
        verified: true,
        bank: 'Telebirr',
        transactionId: receiptNo,
        data: {
          payer_name: parsed.payer_name || parsed.sender || null,
          payer_account: parsed.sender_phone || parsed.from || null,
          receiver_name: parsed.to || parsed.receiver || null,
          receiver_account: parsed.receiver_phone || null,
          amount: parsed.amount ? parseFloat(String(parsed.amount).replace(/,/g, '')) : null,
          currency: 'ETB',
          date: parsed.date || parsed.time || null,
          reference: parsed.transaction_id || parsed.receipt_no || receiptNo,
          status: 'SUCCESS',
        },
      }
    } catch (fetchErr: any) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = origEnv ?? '1'
      throw fetchErr
    }
  } catch (err: any) {
    console.error('[telebirr-receipt] error:', err.message)
    return null // null means fall through to cheki.et
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, bank, account, phoneNumber } = body

    if (!transactionId?.trim()) {
      return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    }

    const tid = transactionId.trim()
    const bankLower = (bank || '').toLowerCase().trim()
    let bankCode = BANK_MAP[bankLower] || detectBankFromId(tid)

    if (bankCode === 'unknown') {
      return NextResponse.json({
        success: false, verified: false,
        error: `Could not detect bank from "${tid}". Please select the correct bank.`,
        hint: 'CBE: starts with FT | Telebirr: starts with CHQ or 10 chars | Dashen: 16 chars | CBE Birr: starts with DTS',
      })
    }

    console.log(`[verify-payment] bank="${bank}" → code="${bankCode}" tid="${tid}"`)

    // Try telebirr-receipt package first for Telebirr (works inside Ethiopia)
    if (bankCode === 'telebirr') {
      const result = await verifyTelebirr(tid)
      if (result) {
        return NextResponse.json(result)
      }
      // If package failed (outside Ethiopia), fall through to cheki.et for fallback URL
    }

    // Call cheki.et for all banks
    const chekiBody: any = { bank: bankCode, reference: tid }
    if (account?.trim()) chekiBody.accountNumber = account.trim()
    if (phoneNumber?.trim()) chekiBody.phoneNumber = phoneNumber.trim()

    const chekiResponse = await fetch('https://cheki.et/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chekiBody),
      signal: AbortSignal.timeout(30000),
    })

    const result = await chekiResponse.json()
    console.log(`[verify-payment] cheki: verified=${result.verified} status=${chekiResponse.status}`)

    if (result.verified === true) {
      return NextResponse.json({
        success: true, verified: true,
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

    // Geo-blocked (Telebirr/M-Pesa from outside Ethiopia)
    if (chekiResponse.status === 502 && result.fallbackUrl) {
      const bankName = bankCode === 'telebirr' ? 'Telebirr' : bankCode === 'mpesa' ? 'M-Pesa' : bank
      return NextResponse.json({
        success: false, verified: false,
        error: `${bankName} cannot be verified from outside Ethiopia. Open the official receipt below, verify the amount and receiver, then confirm payment.`,
        fallbackUrl: result.fallbackUrl,
        transactionId: tid,
        isGeoBlocked: true,
      })
    }

    return NextResponse.json({
      success: false, verified: false,
      error: result.error || `Transaction not found in ${result.bank || bank}. Check the transaction ID.`,
      fallbackUrl: result.fallbackUrl || null,
      transactionId: tid,
    })

  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    console.error('[verify-payment] Error:', error?.message)
    return NextResponse.json({
      success: false, verified: false,
      error: isTimeout ? 'Verification timed out (30s). Try again.' : `Verification failed: ${error?.message || 'Unknown'}`,
    }, { status: 502 })
  }
}
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
  // CBE legacy FT reference (FT + digits/letters)
  if (/^FT[0-9A-Z]{8,}/.test(tid)) return 'cbe'
  // Telebirr - CHQ prefix or 10-char alphanumeric
  if (tid.startsWith('CHQ')) return 'telebirr'
  if (tid.includes('ETHIOTELECOM')) return 'telebirr'
  // Telebirr receipt IDs are typically 10 chars alphanumeric
  if (/^[A-Z0-9]{10}$/.test(tid) && !tid.startsWith('FT')) return 'telebirr'
  // Dashen - FT ref 16 chars or ETAP
  if (tid.includes('ETAP') || tid.includes('DASHENBANKSC')) return 'dashen'
  if (/^[A-Z0-9]{16}$/.test(tid) && !tid.startsWith('FT')) return 'dashen'
  // Awash - share link or AW prefix
  if (tid.includes('AWASHPAY') || /^-[A-Z0-9]+/.test(tid)) return 'awash'
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
  // CBE Birr - starts with DTS
  if (/^DTS[A-Z0-9]+/.test(tid) || tid.includes('CBEPAY')) return 'cbebirr'
  // Bunna
  if (tid.includes('BUNNABANKSC')) return 'bunna'
  // Wegagen
  if (tid.includes('WEGAGEN') || tid.includes('TRANSINFO.WEGAGEN')) return 'wegagen'
  
  return 'unknown'
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

    // If still unknown, return helpful error
    if (bankCode === 'unknown') {
      return NextResponse.json({
        success: false,
        verified: false,
        error: `Could not detect bank from transaction ID "${tid}". Please select the correct bank from the dropdown and try again.`,
        hint: 'CBE: starts with FT | Telebirr: starts with CHQ or 10 chars | Dashen: 16 chars | Awash: starts with - | CBE Birr: starts with DTS',
      })
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
      const bankName = bankCode === 'telebirr' ? 'Telebirr' : bankCode === 'mpesa' ? 'M-Pesa' : bank
      return NextResponse.json({
        success: false,
        verified: false,
        error: `${bankName} cannot be verified from outside Ethiopia. Please open the official receipt link below to check the payment manually, then confirm.`,
        fallbackUrl: result.fallbackUrl,
        transactionId: tid,
        isGeoBlocked: true,
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
