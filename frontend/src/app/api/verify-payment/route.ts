import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

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
  if (/^[A-Z0-9]{10}$/.test(t) && !t.startsWith('FT')) return 'telebirr'
  if (t.includes('ETAP') || t.includes('DASHENBANKSC')) return 'dashen'
  if (/^[A-Z0-9]{16}$/.test(t) && !t.startsWith('FT')) return 'dashen'
  if (t.includes('AWASHPAY') || /^-[A-Z0-9]+/.test(t)) return 'awash'
  if (t.includes('CS.BANKOFABYSSINIA') || t.startsWith('BOA')) return 'boa'
  if (t.includes('MPESA') || t.includes('SAFARICOM')) return 'mpesa'
  if (/^DTS[A-Z0-9]+/.test(t)) return 'cbebirr'
  if (t.includes('WEGAGEN')) return 'wegagen'
  return 'unknown'
}

// Direct CBE new API - much more reliable than old FT endpoint
async function verifyCBEDirect(tid: string, account?: string): Promise<any> {
  const cleanTid = tid.trim().toUpperCase()

  // Method 1: New CBE receipt link (mbreciept.cbe.com.et)
  if (cleanTid.includes('MBRECIEPT.CBE.COM.ET') || cleanTid.includes('MB.CBE.COM.ET')) {
    // Extract receipt ID from URL
    const match = cleanTid.match(/\/([A-Z0-9]+)\s*$/)
    const receiptId = match ? match[1] : cleanTid
    try {
      const res = await fetch(`https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${receiptId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data && (data.amount || data.senderName)) {
          return {
            success: true, verified: true, bank: 'CBE', transactionId: tid,
            data: {
              payer_name: data.senderName || data.sender || null,
              payer_account: data.senderAccount || null,
              receiver_name: data.receiverName || data.receiver || null,
              receiver_account: data.receiverAccount || null,
              amount: data.amount ? parseFloat(String(data.amount)) : null,
              currency: 'ETB',
              date: data.date || data.transactionDate || new Date().toISOString(),
              reference: data.reference || data.transactionId || tid,
              status: 'SUCCESS',
            }
          }
        }
      }
    } catch {}
  }

  // Method 2: FT reference with account - try new CBE API
  const ftNum = cleanTid.replace(/^FT/i, '')
  const acc = (account || '').replace(/\D/g, '').slice(-8)

  if (acc) {
    try {
      const res = await fetch(`https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${cleanTid}${acc}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data && (data.amount || data.senderName)) {
          return {
            success: true, verified: true, bank: 'CBE', transactionId: tid,
            data: {
              payer_name: data.senderName || null,
              payer_account: data.senderAccount || null,
              receiver_name: data.receiverName || null,
              receiver_account: data.receiverAccount || null,
              amount: data.amount ? parseFloat(String(data.amount)) : null,
              currency: 'ETB',
              date: data.date || new Date().toISOString(),
              reference: data.reference || tid,
              status: 'SUCCESS',
            }
          }
        }
      }
    } catch {}
  }

  // Method 3: Old CBE apps endpoint (port 100)
  const agent = new https.Agent({ rejectUnauthorized: false })
  const urls = acc
    ? [`https://apps.cbe.com.et:100/?id=FT${ftNum}${acc}`, `https://apps.cbe.com.et:100/?id=FT${ftNum}`]
    : [`https://apps.cbe.com.et:100/?id=FT${ftNum}`]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        // @ts-ignore
        agent,
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const html = await res.text()
        if (html && html.length > 200 && !html.includes('not found')) {
          // Parse amount from HTML
          const amountMatch = html.match(/(\d[\d,]+\.?\d*)\s*(?:ETB|Birr|ብ)/i)
          const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null
          return {
            success: true, verified: true, bank: 'CBE', transactionId: tid,
            data: {
              payer_name: null,
              receiver_name: null,
              amount,
              currency: 'ETB',
              date: new Date().toISOString(),
              reference: tid,
              status: 'SUCCESS',
            }
          }
        }
      }
    } catch {}
  }

  return null
}

async function verifyTelebirr(receiptNo: string) {
  try {
    const { receipt, utils: { loadReceipt, parseFromHTML } } = require('telebirr-receipt')
    const orig = process.env['NODE_TLS_REJECT_UNAUTHORIZED']
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    try {
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
          payer_account: parsed.sender_phone || null,
          receiver_name: parsed.to || parsed.receiver || null,
          amount: parsed.amount ? parseFloat(String(parsed.amount).replace(/,/g, '')) : null,
          currency: 'ETB',
          date: parsed.date || null,
          reference: parsed.transaction_id || receiptNo,
          status: 'SUCCESS',
        },
      }
    } catch (e) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = orig ?? '1'
      throw e
    }
  } catch { return null }
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
        error: `Could not detect bank from "${tid}".`,
        hint: 'CBE: FT... | Telebirr: CHQ... | Dashen: 16 chars | CBE Birr: DTS...',
      })
    }

    // CBE: Try direct API first, then cheki.et
    if (bankCode === 'cbe') {
      const direct = await verifyCBEDirect(tid, account)
      if (direct) return NextResponse.json(direct)
      // Falls through to cheki.et
    }

    // Telebirr: Try direct first
    if (bankCode === 'telebirr') {
      const result = await verifyTelebirr(tid)
      if (result) return NextResponse.json(result)
      // Falls through to cheki.et for fallback URL
    }

    // Try cheki.et for all banks
    const chekiBody: any = { bank: bankCode, reference: tid }
    if (account?.trim()) chekiBody.accountNumber = account.trim()
    if (phoneNumber?.trim()) chekiBody.phoneNumber = phoneNumber.trim()

    const chekiRes = await fetch('https://cheki.et/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chekiBody),
      signal: AbortSignal.timeout(25000),
    })

    const result = await chekiRes.json()

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

    // Geo-blocked (Telebirr/M-Pesa)
    if (chekiRes.status === 502 && result.fallbackUrl) {
      const name = bankCode === 'telebirr' ? 'Telebirr' : bankCode === 'mpesa' ? 'M-Pesa' : bank
      return NextResponse.json({
        success: false, verified: false,
        error: `${name} cannot be verified from outside Ethiopia. Open the official receipt below.`,
        fallbackUrl: result.fallbackUrl, transactionId: tid, isGeoBlocked: true,
      })
    }

    // CBE specific - server down
    if (bankCode === 'cbe') {
      return NextResponse.json({
        success: false, verified: false,
        error: 'CBE verification servers are temporarily unavailable.',
        hint: 'Try using the full receipt link from CBE app: open CBE app → go to transaction → Share → copy the mbreciept.cbe.com.et/... link',
        transactionId: tid,
      })
    }

    return NextResponse.json({
      success: false, verified: false,
      error: result.error || `Transaction not found in ${result.bank || bank}.`,
      fallbackUrl: result.fallbackUrl || null, transactionId: tid,
    })

  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    return NextResponse.json({
      success: false, verified: false,
      error: isTimeout ? 'Timed out (25s). Try again.' : `Failed: ${error?.message || 'Unknown'}`,
    }, { status: 502 })
  }
}
