import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, bank, account } = body

    if (!transactionId?.trim()) {
      return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    }

    // Map bank names to cheki bank codes
    const bankMap: Record<string, string> = {
      'CBE': 'cbe',
      'Dashen': 'dashen',
      'Awash': 'awash',
      'Abyssinia': 'boa',
      'BOA': 'boa',
      'Telebirr': 'telebirr',
      'Siinqee': 'siinqee',
      'Wegagen': 'wegagen',
      'Bunna': 'bunna',
      'M-pesa': 'mpesa',
      'mpesa': 'mpesa',
    }
    const bankCode = bankMap[bank] || bankMap[bank?.toLowerCase()] || 'cbe'

    // Call cheki.et from server side (no CORS restrictions)
    const chekiResponse = await fetch('https://cheki.et/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bank: bankCode,
        reference: transactionId.trim(),
        ...(account?.trim() ? { accountNumber: account.trim() } : {}),
      }),
      signal: AbortSignal.timeout(30000),
    })

    const result = await chekiResponse.json()

    if (result.verified === true) {
      return NextResponse.json({
        success: true,
        verified: true,
        bank: result.bank || bank,
        transactionId: transactionId.trim(),
        data: {
          payer_name: result.senderName || null,
          payer_account: result.senderAccount || null,
          receiver_name: result.receiverName || null,
          receiver_account: result.receiverAccount || null,
          amount: result.amount || null,
          currency: result.currency || 'ETB',
          date: result.date || null,
          reference: result.reference || transactionId,
          status: 'SUCCESS',
        },
      })
    }

    // Not verified
    return NextResponse.json({
      success: false,
      verified: false,
      error: result.error || 'Transaction could not be confirmed by the bank.',
      fallbackUrl: result.fallbackUrl || null,
      transactionId: transactionId.trim(),
    })

  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    return NextResponse.json({
      success: false,
      verified: false,
      error: isTimeout
        ? 'Verification timed out. Please try again.'
        : `Verification failed: ${error?.message || 'Unknown error'}`,
    }, { status: 502 })
  }
}
