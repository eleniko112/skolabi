"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QrCode, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function QRCodeDisplay() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // This is necessary to access `window.location.origin`.
    if (typeof window !== 'undefined') {
      const mobileUrl = `${window.location.origin}/mobile`;
      const generatedQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(mobileUrl)}&qzone=1&bgcolor=F0F4F8`;
      setQrCodeUrl(generatedQrCodeUrl);
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <Card className="w-auto shadow-2xl rounded-lg bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            მობილური ვერსია
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code for mobile version"
              width={128}
              height={128}
              className="rounded-md"
            />
          ) : (
            <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">
              <QrCode className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
