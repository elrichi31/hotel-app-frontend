"use client";
import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { notion } from '@/lib/theme';

/** Reemplazo de `Result` de antd: pantalla de estado (éxito/error) con icono, título y acciones. */
export function ResultState({
  status,
  icon,
  title,
  subTitle,
  extra,
}: {
  status: 'success' | 'error';
  icon?: React.ReactNode;
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const defaultIcon =
    status === 'success' ? (
      <CheckCircle2 size={64} color={notion.blue} />
    ) : (
      <XCircle size={64} color={notion.red} />
    );

  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>{icon ?? defaultIcon}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginBottom: 8 }}>{title}</div>
      {subTitle && <div style={{ color: notion.inkMuted, marginBottom: 20 }}>{subTitle}</div>}
      {extra && <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>{extra}</div>}
    </div>
  );
}
