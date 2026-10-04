/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastViewport = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className,
      )}
      {...props}
    />
  ),
);
ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-background text-foreground',
        warning: 'border-yellow-500 bg-background text-foreground',
        info: 'border-blue-500 bg-background text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Toast = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> &
    VariantProps<typeof toastVariants> & {
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, variant, open, onOpenChange, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    data-state={open ? 'open' : 'closed'}
    {...props}
  />
));
Toast.displayName = 'Toast';

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Close"
      className={cn(
        'absolute right-1 top-1 rounded-md p-1 text-foreground/60 transition-colors hover:text-foreground focus:outline-none focus:ring-1 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className,
      )}
      type="button"
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  ),
);
ToastClose.displayName = 'ToastClose';

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-semibold [&+div]:text-xs', className)} {...props} />
  ),
);
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />,
);
ToastDescription.displayName = 'ToastDescription';

export { ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, toastVariants };
export type { VariantProps };
