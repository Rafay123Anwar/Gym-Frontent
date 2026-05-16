import React from 'react';
import './GlassCard.css';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glass-card ${className}`}>
      {children}
    </div>
  );
}
