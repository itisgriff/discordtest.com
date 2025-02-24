import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, InfoIcon } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
  action?: React.ReactNode;
}

function getToastIcon(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'info':
      return <InfoIcon className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
}

function getToastClassName(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100';
    case 'error':
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100';
    case 'warning':
      return 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100';
    case 'info':
      return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100';
    default:
      return '';
  }
}

const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom(
      (id) => (
        <div className={`py-2 ${getToastClassName('success')}`}>
          <div className="flex items-start gap-2 px-4">
            {getToastIcon('success')}
            <div className="flex-1">
              {options?.title && <div className="font-medium">{options.title}</div>}
              <div className="text-sm dark:text-green-200/90">{message}</div>
            </div>
            {options?.action}
          </div>
        </div>
      ),
      {
        id: options?.id,
        duration: options?.duration || 5000,
      }
    );
  },

  error: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom(
      (id) => (
        <div className={`py-2 ${getToastClassName('error')}`}>
          <div className="flex items-start gap-2 px-4">
            {getToastIcon('error')}
            <div className="flex-1">
              {options?.title && <div className="font-medium">{options.title}</div>}
              <div className="text-sm dark:text-red-200/90">{message}</div>
            </div>
            {options?.action}
          </div>
        </div>
      ),
      {
        id: options?.id,
        duration: options?.duration || 5000,
      }
    );
  },

  warning: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom(
      (id) => (
        <div className={`py-2 ${getToastClassName('warning')}`}>
          <div className="flex items-start gap-2 px-4">
            {getToastIcon('warning')}
            <div className="flex-1">
              {options?.title && <div className="font-medium">{options.title}</div>}
              <div className="text-sm dark:text-amber-200/90">{message}</div>
            </div>
            {options?.action}
          </div>
        </div>
      ),
      {
        id: options?.id,
        duration: options?.duration || 5000,
      }
    );
  },

  info: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.custom(
      (id) => (
        <div className={`py-2 ${getToastClassName('info')}`}>
          <div className="flex items-start gap-2 px-4">
            {getToastIcon('info')}
            <div className="flex-1">
              {options?.title && <div className="font-medium">{options.title}</div>}
              <div className="text-sm dark:text-blue-200/90">{message}</div>
            </div>
            {options?.action}
          </div>
        </div>
      ),
      {
        id: options?.id,
        duration: options?.duration || 5000,
      }
    );
  },

  // Generic toast
  message: (options: ToastOptions) => {
    const variant = options.variant || 'default';
    
    return sonnerToast.custom(
      (id) => (
        <div className={`py-2 ${getToastClassName(variant)}`}>
          <div className="flex items-start gap-2 px-4">
            {getToastIcon(variant)}
            <div className="flex-1">
              {options.title && <div className="font-medium">{options.title}</div>}
              {options.description && <div className="text-sm">{options.description}</div>}
            </div>
            {options.action}
          </div>
        </div>
      ),
      {
        id: options.id,
        duration: options.duration || 5000,
      }
    );
  },

  // Original toast methods
  dismiss: sonnerToast.dismiss,
};

export { toast, type ToastOptions };
export { Toaster } from 'sonner';
