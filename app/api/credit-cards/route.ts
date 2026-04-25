import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('ub_user_id')?.value;
    
    let customerId = 1;
    if (userId) {
       const userRes: any = await query('SELECT id as customer_id FROM customers WHERE user_id = ?', [userId]);
       if (userRes.length && userRes[0].customer_id) customerId = userRes[0].customer_id;
    }

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
    const { action, card_id, amount } = await request.json();
    if (!action || !card_id || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    if (action === 'spend') {
      const cards: any = await query('SELECT limit_amount, used_amount FROM credit_cards WHERE id = ?', [card_id]);
      if (!cards.length) return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
      
      const card = cards[0];
      if (Number(card.used_amount) + amount > Number(card.limit_amount)) {
        return NextResponse.json({ success: false, error: 'Credit limit exceeded' }, { status: 400 });
      }
      
      await query('UPDATE credit_cards SET used_amount = used_amount + ? WHERE id = ?', [amount, card_id]);
      return NextResponse.json({ success: true, message: 'Spend successful' });
      
    } else if (action === 'pay') {
      await query('UPDATE credit_cards SET used_amount = GREATEST(used_amount - ?, 0) WHERE id = ?', [amount, card_id]);
      return NextResponse.json({ success: true, message: 'Payment successful' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
