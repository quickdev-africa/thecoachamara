"use client";
import Script from 'next/script';
import { useEffect } from 'react';

type CrispChatProps = {
  websiteId?: string;
  themeColor?: string;
  positionRight?: boolean;
  enabled?: boolean;
  userPhone?: string;
};

export default function CrispChat({
  websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || '5bf4f4c6-e904-485d-a951-8123295b75c1',
  themeColor = '#25D366',
  positionRight = true,
  enabled = true,
  userPhone,
}: CrispChatProps) {
  if (!enabled) return null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    w.$crisp = w.$crisp || [];
    w.CRISP_WEBSITE_ID = websiteId;
    try {
      w.$crisp.push(['config', 'color:theme', [themeColor]]);
      // Crisp uses position:reverse = true for left, false for right
      w.$crisp.push(['config', 'position:reverse', [!positionRight]]);
      if (userPhone) {
        w.$crisp.push(['set', 'user:phone', userPhone]);
      }
    } catch (_e) {
      // Ignore if Crisp not yet loaded; queue will be processed after script loads
    }
  }, [websiteId, themeColor, positionRight, userPhone]);

  return (
    <Script id="crisp-chat-script" src="https://client.crisp.chat/l.js" strategy="afterInteractive" />
  );
}
