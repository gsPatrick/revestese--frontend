'use client';
import { useEffect } from 'react';
import { trackPageview } from '@/services/analytics';

export default function TrackView({ tipo, produtoId }) {
  useEffect(() => {
    trackPageview(tipo, produtoId || null);
  }, [tipo, produtoId]);
  return null;
}
