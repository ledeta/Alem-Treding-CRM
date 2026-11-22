"""
Ethiopian Bank Receipt Verification Microservice
Wraps ethiobank_receipts library and exposes a simple HTTP API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def detect_bank(transaction_id: str) -> str:
    """Auto-detect bank from transaction ID format"""
    tid = transaction_id.strip().upper()
    
    # CBE: starts with FT
    if tid.startswith('FT'):
        return 'cbe'
    # Telebirr: starts with CHQ or T followed by alphanumeric
    if tid.startswith('CHQ') or (len(tid) == 10 and tid.isalnum()):
        return 'tele'
    # Dashen: contains ETAP
    if 'ETAP' in tid:
        return 'dashen'
    # Awash: starts with AW or -
    if tid.startswith('AW') or tid.startswith('-'):
        return 'awash'
    # BOA: starts with BOA
    if tid.startswith('BOA'):
        return 'boa'
    # Zemen: starts with ZM
    if tid.startswith('ZM'):
        return 'zemen'
    
    return 'unknown'


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'verify-service'})


@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    transaction_id = data.get('transactionId', '').strip()
    bank = data.get('bank', '').lower().strip()
    account = data.get('account', '').strip()  # optional, for CBE
    
    if not transaction_id:
        return jsonify({'success': False, 'error': 'Transaction ID is required'}), 400
    
    # Auto-detect bank if not provided
    if not bank or bank == 'auto':
        bank = detect_bank(transaction_id)
    
    # Normalize bank name
    bank_map = {
        'cbe': 'cbe',
        'commercial bank of ethiopia': 'cbe',
        'dashen': 'dashen',
        'awash': 'awash',
        'boa': 'boa',
        'bank of abyssinia': 'boa',
        'zemen': 'zemen',
        'telebirr': 'tele',
        'tele': 'tele',
        'ethio telecom': 'tele',
    }
    bank_key = bank_map.get(bank.lower(), bank)
    
    if bank_key == 'unknown':
        return jsonify({
            'success': False,
            'error': f'Could not detect bank from transaction ID: {transaction_id}. Please specify the bank.',
            'detectedBank': 'unknown'
        }), 400
    
    logger.info(f'Verifying {bank_key} transaction: {transaction_id}')
    
    try:
        from ethiobank_receipts import extract_receipt
        
        # Special handling for CBE with FT number
        if bank_key == 'cbe' and transaction_id.upper().startswith('FT') and account:
            from ethiobank_receipts.extractors.cbe import extract_cbe_receipt_info_from_ft
            result = extract_cbe_receipt_info_from_ft(transaction_id, account)
        else:
            result = extract_receipt(bank_key, transaction_id)
        
        if result:
            return jsonify({
                'success': True,
                'bank': bank_key,
                'transactionId': transaction_id,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No receipt data found for this transaction ID',
                'bank': bank_key,
                'transactionId': transaction_id
            }), 404
            
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except ImportError:
        return jsonify({
            'success': False,
            'error': 'ethiobank_receipts library not installed. Run: pip install ethiobank-receipts'
        }), 500
    except Exception as e:
        logger.error(f'Verification failed: {e}')
        return jsonify({
            'success': False,
            'error': f'Verification failed: {str(e)}',
            'bank': bank_key,
            'transactionId': transaction_id
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
