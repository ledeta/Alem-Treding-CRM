import { NextRequest, NextResponse } from 'next/server'

const BANK_MAP: Record<string, string> = {
  'cbe': 'cbe', 'nbe': 'cbe', 'dashen': 'dashen', 'awash': 'awash',
  'abyssinia': 'boa', 'boa': 'boa', 'hibret': 'cbe', 'addis': 'cbe',
  'berhan': 'cbe', 'oromia': 'cbe', 'wegagen': 'wegagen', 'walia': 'cbe',
  'telebirr': 'telebirr', 'cash': 'cbe', 'm-pesa': 'mpesa', 'mpesa': 'mpesa',
  'siinqee': 'siinqee', 'ebirr': 'ebirr', 'zamzam': 'zamzam',
  'cbe birr': 'cbebirr', 'cbebirr': 'cbebirr', 'bunna': 'bunna',
}

function detectBank(tid: string): string {
  const t = tid.trim().toUpperCase()
  if (t.includes('MBRECIEPT.CBE.COM.ET') || t.includes('MB.CBE.COM.ET')) return 'cbe'
  if (/^FT[0-9A-Z]{8,}/.test(t)) return 'cbe'
  if (t.startsWith('CHQ') || t.includes('ETHIOTELECOM')) return 'telebirr'
  if (/^[A-Z0-9]{10}$/.test(t)) return 'telebirr'
  if (t.includes('ETAP') || t.includes('DASHENBANKSC')) return 'dashen'
  if (/^[A-Z0-9]{16}$/.test(t)) return 'dashen'
  if (t.includes('AWASHPAY') || /^-[A-Z0-9]+/.test(t)) return 'awash'
  if (t.includes('CS.BANKOFABYSSINIA') || t.startsWith('BOA')) return 'boa'
  if (t.includes('MPESA') || t.includes('SAFARICOM')) return 'mpesa'
  if (t.includes('SIINQEE')) return 'siinqee'
  if (t.includes('EBIRR')) return 'ebirr'
  if (t.includes('ZAMZAM')) return 'zamzam'
  if (/^DTS[A-Z0-9]+/.test(t)) return 'cbebirr'
  if (t.includes('BUNNABANKSC')) return 'bunna'
  if (t.includes('WEGAGEN')) return 'wegagen'
  return 'unknown'
}

async function verifyTelebirr(receiptNo: string) {
  try {
    const { receipt, utils: { loadReceipt, parseFromHTML } } = require('telebirr-receipt')
    const orig = process.env['NODE_TLS_REJECT_UNAUTHORIZED']
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    try {
      // Short 8 second timeout - if outside Ethiopia it will fail fast
      const html = await Promise.race([
        loadReceipt({ receiptNo }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]) as string
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = orig ?? '1'
      const parsed = parseFromHTML(html)
      if (!parsed || Object.keys(parsed).length === 0) return null
      return {
        success: true, verified: true, bank: 'Telebirr', transactionId: receiptNo,
        data: {
          payer_name: parsed.payer_name || parsed.sender || null,
          payer_account: parsed.sender_phone || parsed.from || null,
          receiver_name: parsed.to || parsed.receiver || null,
          receiver_account: parsed.receiver_phone || null,
          amount: parsed.amount ? parseFloat(String(parsed.amount).replace(/,/g, '')) : null,
          currency: 'ETB',
          date: parsed.date || parsed.time || null,
          reference: parsed.transaction_id || receiptNo,
          status: 'SUCCESS',
        },
      }
    } catch (e) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = orig ?? '1'
      throw e
    }
  } catch (e: any) {
    console.error('[telebirr-receipt]', e.message)
    return null
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
    const bankCode = BANK_MAP[(bank || '').toLowerCase().trim()] || detectBank(tid)

    if (bankCode === 'unknown') {
      return NextResponse.json({
        success: false, verified: false,
        error: `Could not detect bank from "${tid}". Please select the correct bank.`,
        hint: 'CBE: FT... | Telebirr: CHQ... or 10 chars | Dashen: 16 chars | CBE Birr: DTS...',
      })
    }

    console.log(`[verify] bank="${bank}" → "${bankCode}" tid="${tid}"`)

    // Try telebirr-receipt package first (works inside Ethiopia)
    if (bankCode === 'telebirr') {
      const result = await verifyTelebirr(tid)
      if (result) return NextResponse.json(result)
      // falls through to cheki.et for fallback URL
    }

    // Call cheki.et
    const chekiBody: any = { bank: bankCode, reference: tid }
    if (account?.trim()) chekiBody.accountNumber = account.trim()
    if (phoneNumber?.trim()) chekiBody.phoneNumber = phoneNumber.trim()

    const chekiRes = await fetch('https://cheki.et/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chekiBody),
      signal: AbortSignal.timeout(30000),
    })

    const result = await chekiRes.json()
    console.log(`[verify] cheki verified=${result.verified} status=${chekiRes.status}`)

    if (result.verified === true) {
      return NextResponse.json({
        success: true, verified: true,
        bank: result.bank || bank, transactionId: tid,
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

    // Geo-blocked
    if (chekiRes.status === 502 && result.fallbackUrl) {
      const name = bankCode === 'telebirr' ? 'Telebirr' : bankCode === 'mpesa' ? 'M-Pesa' : bank
      return NextResponse.json({
        success: false, verified: false,
        error: `${name} cannot be verified from outside Ethiopia. Open the official receipt below, verify the amount and receiver, then confirm payment.`,
        fallbackUrl: result.fallbackUrl, transactionId: tid, isGeoBlocked: true,
      })
    }

    return NextResponse.json({
      success: false, verified: false,
      error: result.error || `Transaction not found in ${result.bank || bank}.`,
      fallbackUrl: result.fallbackUrl || null, transactionId: tid,
    })

  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    console.error('[verify] Error:', error?.message)
    return NextResponse.json({
      success: false, verified: false,
      error: isTimeout ? 'Timed out (30s). Try again.' : `Failed: ${error?.message || 'Unknown'}`,
    }, { status: 502 })
  }
}
