import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get('customerId');
    
    if (!customerId) {
      const cookieStore = await cookies();
      const userId = cookieStore.get('ub_user_id')?.value;
      if (userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }
    }

    if (!customerId) return NextResponse.json([]);

    const cards = await query(`
      SELECT * FROM credit_cards
      WHERE customer_id = ?
      ORDER BY id DESC
    `, [customerId]);
    
    return NextResponse.json(cards);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, card_id, amount, otp } = await request.json();
    
    // For actions other than 'apply', we need valid card_id and amount
    if (action !== 'apply' && (!action || !card_id || typeof amount !== 'number')) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    const auditUserId = userId || 1;

    if (action === 'spend' || action === 'pay') {
      // 1. SECURITY LAYER: OTP Validation
      if (!otp) {
        return NextResponse.json({ success: false, error: 'OTP verification required', requireOTP: true }, { status: 403 });
      }

      // 2. SIMULATE VERIFICATION (PENDING STATE in frontend)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const cards: any = await query('SELECT limit_amount, used_amount FROM credit_cards WHERE id = ?', [card_id]);
      if (!cards.length) return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
      
      const card = cards[0];
      const refId = 'CC-' + Date.now() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      // 3. FRAUD CHECK (Mock average since we don't track CC tx history yet)
      const mockAvgAmount = 5000; 
      let isSuspicious = amount > (3 * mockAvgAmount) ? 1 : 0;

      // 4. PROCESS ACTION
      if (action === 'spend') {
        if (Number(card.used_amount) + amount > Number(card.limit_amount)) {
          await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_SPEND_FAILED', `Ref: ${refId}, Amount: ${amount}, Reason: Limit exceeded`]);
          return NextResponse.json({ success: false, error: 'Credit limit exceeded' }, { status: 400 });
        }
        await query('UPDATE credit_cards SET used_amount = used_amount + ? WHERE id = ?', [amount, card_id]);
        await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_SPEND_SUCCESS', `Ref: ${refId}, Amount: ${amount}, Suspicious: ${isSuspicious}`]);
        
        return NextResponse.json({ success: true, message: 'Spend successful', status: 'SUCCESS', reference_id: refId, is_suspicious: isSuspicious === 1 });
      } else if (action === 'pay') {
        await query('UPDATE credit_cards SET used_amount = GREATEST(used_amount - ?, 0) WHERE id = ?', [amount, card_id]);
        await query('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [auditUserId, 'CC_PAY_SUCCESS', `Ref: ${refId}, Amount: ${amount}`]);
        
        return NextResponse.json({ success: true, message: 'Payment successful', status: 'SUCCESS', reference_id: refId });
      }
    } else if (action === 'apply') {
      let customerId = null;
      if (userId) {
        const userRes: any = await query('SELECT customer_id FROM users WHERE user_id = ?', [userId]);
        if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
      }

      if (!customerId) return NextResponse.json({ success: false, error: 'Customer profile not found' }, { status: 400 });

      const card_number = Array.from({length: 4}, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
      const limit_amount = 50000.00;
      const due_date = new Date();
      due_date.setMonth(due_date.getMonth() + 1); // Next month

      await query(
        'INSERT INTO credit_cards (customer_id, card_number, limit_amount, used_amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, card_number, limit_amount, 0, due_date, 'active']
      );

      return NextResponse.json({ success: true, message: 'Credit card application approved!' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
