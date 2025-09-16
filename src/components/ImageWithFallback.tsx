import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
};

export default function ImageWithFallback({ src, alt, width, height, className }: Props) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`w-${Math.round(width / 4)} h-${Math.round(height / 4)} flex items-center justify-center ${className || ''}`}>
      {loading && <div className="w-6 h-6 animate-spin border-2 border-gray-300 border-t-transparent rounded-full" />}
      <Image
        src={hasError ? '/logo.png' : src}
        alt={alt || 'Product image'}
        width={width}
        height={height}
        className={`object-cover rounded border bg-gray-100 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => { setHasError(true); setLoading(false); }}
      />
    </div>
  );
}
