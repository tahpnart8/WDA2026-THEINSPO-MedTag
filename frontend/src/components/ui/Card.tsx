import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'danger' | 'warning' | 'black';
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const baseStyles = 'rounded-2xl shadow-sm border p-6 overflow-hidden';
  
  const variants = {
    default: 'bg-white border-gray-200',
    danger: 'bg-red-50 border-red-200 text-red-900', // Dành cho mảng Dị ứng (Allergies)
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900', // Dành cho Bệnh nền khẩn cấp
    black: 'bg-gray-900 border-gray-800 text-white', // Dành cho Nhóm máu (Blood Type)
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
