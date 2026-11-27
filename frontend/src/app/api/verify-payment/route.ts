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

function extractCBEReceiptId(url: string): string {
  // Extract receipt ID from various CBE URL formats:
  // https://mbreciept.cbe.com.et/v2-hfHCxO → v2-hfHCxO
  // https://mbreciept.cbe.com.et/fHCxExampleRcpt01 → fHCxExampleRcpt01
  // https://apps.cbe.com.et:100/?id=FT26... → FT26...
  const urlParts = url.trim().split('/')
  const last = urlParts[urlParts.length - 1].split('?')[0].trim()
  return last || url
}

async function verifyCBEDirect(tid: string, account?: string): Promise<any> {
  const isUrl = tid.includes('cbe.com.et') || tid.includes('http')
  const acc = (account || '').replace(/\D/g, '').slice(-8)
  const ftUpper = tid.trim().toUpperCase()

  // --- Strategy 1: New CBE receipt link ---
  if (isUrl) {
    const receiptId = extractCBEReceiptId(tid)
    const endpoints = [
      `https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${receiptId}`,
      `https://mb.cbe.com.et/api/v1/transactions/receipt/${receiptId}`,
    ]
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000),
        })
        if (res.ok) {
          const data = await res.json()
          if (data && (data.amount !== undefined || data.senderName || data.transactionAmount)) {
            return buildCBEResult(tid, data)
          }
        }
      } catch {}
    }
  }

  // --- Strategy 2: FT reference via new CBE API ---
  const isFT = /^FT[0-9A-Z]{6,}/i.test(tid.trim())
  if (isFT) {
    const ftNum = ftUpper.startsWith('FT') ? ftUpper : `FT${ftUpper}`
    const endpoints: string[] = []

    // With account
    if (acc) {
      endpoints.push(`https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${ftNum}${acc}`)
      endpoints.push(`https://mb.cbe.com.et/api/v1/transactions/receipt/${ftNum}/${acc}`)
      endpoints.push(`https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${ftNum}`)
    } else {
      endpoints.push(`https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${ftNum}`)
      endpoints.push(`https://mb.cbe.com.et/api/v1/transactions/receipt/${ftNum}`)
    }

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(12000),
        })
        if (res.ok) {
          const data = await res.json()
          if (data && (data.amount !== undefined || data.senderName || data.transactionAmount)) {
            return buildCBEResult(tid, data)
          }
        }
      } catch {}
    }

    // --- Strategy 3: Old CBE apps.cbe.com.et:100 ---
    if (acc) {
      try {
        const res = await fetch(`https://apps.cbe.com.et:100/?id=${ftNum}${acc}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(10000),
        })
        if (res.ok) {
          const html = await res.text()
          if (html && html.length > 300 && !html.toLowerCase().includes('not found')) {
            const amountMatch = html.match(/([\d,]+\.?\d*)\s*(?:ETB|Birr)/i)
            return {
              success: true, verified: true, bank: 'CBE', transactionId: tid,
              data: {
                payer_name: null, receiver_name: null,
                amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
                currency: 'ETB', date: new Date().toISOString(),
                reference: ftNum, status: 'SUCCESS',
              }
            }
          }
        }
      } catch {}
    }
  }

  return null
}

function buildCBEResult(tid: string, data: any) {
  return {
    success: true, verified: true, bank: 'CBE', transactionId: tid,
    data: {
      payer_name: data.senderName || data.senderFullName || data.sender || null,
      payer_account: data.senderAccount || null,
      receiver_name: data.receiverName || data.receiverFullName || data.receiver || null,
      receiver_account: data.receiverAccount || null,
      amount: data.amount !== undefined ? parseFloat(String(data.amount)) :
              data.transactionAmount !== undefined ? parseFloat(String(data.transactionAmount)) : null,
      currency: 'ETB',
      date: data.date || data.transactionDate || data.createdAt || new Date().toISOString(),
      reference: data.reference || data.transactionId || data.ftNumber || tid,
      status: 'SUCCESS',
    }
  }
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
          currency: 'ETB', date: parsed.date || null,
          reference: parsed.transaction_id || receiptNo, status: 'SUCCESS',
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
        hint: 'CBE: FT... or receipt link | Telebirr: CHQ... | Dashen: 16 chars | CBE Birr: DTS...',
      })
    }

    // CBE: Try direct API first (handles both receipt links and FT numbers)
    if (bankCode === 'cbe') {
      const direct = await verifyCBEDirect(tid, account)
      if (direct) return NextResponse.json(direct)
      // Falls through to cheki.et
    }

    // Telebirr: Try direct first
    if (bankCode === 'telebirr') {
      const result = await verifyTelebirr(tid)
      if (result) return NextResponse.json(result)
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

    // CBE servers down
    if (bankCode === 'cbe') {
      return NextResponse.json({
        success: false, verified: false,
        error: 'CBE verification servers are temporarily unavailable.',
        hint: 'Use the full receipt link from CBE app: open CBE app → go to transaction → Share → copy the mbreciept.cbe.com.et/... link and paste it as the Transaction ID.',
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
