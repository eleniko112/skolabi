"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QrCode, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export function QRCodeDisplay({ schoolId }: { schoolId: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobileUrl = `${window.location.origin}/mobile/${schoolId}`;
      const generatedQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(mobileUrl)}&qzone=1&bgcolor=F0F4F8`;
      setQrCodeUrl(generatedQrCodeUrl);
    }
  }, [schoolId]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <QrCode className="h-5 w-5" />
          <span className="sr-only">QR კოდი მობილური ვერსიისთვის</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="text-center space-y-2">
          <h3 className="text-sm font-semibold flex items-center justify-center gap-2 text-foreground">
            <Smartphone className="h-4 w-4" />
            მობილური ვერსია
          </h3>
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code for mobile version"
              width={100}
              height={100}
              className="rounded-md mx-auto"
            />
          ) : (
            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center mx-auto">
              <QrCode className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">დაასკანერეთ კოდი</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
