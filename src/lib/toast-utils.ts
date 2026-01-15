import { toast } from "sonner";

// Success toast - auto-dismiss after 3 seconds
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

// Error toast - manual dismiss with retry option
export const showError = (
  message: string, 
  options?: { 
    description?: string; 
    onRetry?: () => void;
    supportLink?: boolean;
  }
) => {
  toast.error(message, {
    description: options?.description,
    duration: Infinity, // Manual dismiss
    action: options?.onRetry
      ? {
          label: "Try Again",
          onClick: options.onRetry,
        }
      : options?.supportLink
      ? {
          label: "Get Help",
          onClick: () => window.open("/dashboard/support", "_blank"),
        }
      : undefined,
  });
};

// Info toast - auto-dismiss after 4 seconds
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
  });
};

// Warning toast - auto-dismiss after 5 seconds
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
  });
};

// Loading toast with promise handling
export const showLoadingToast = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
  return promise;
};

// API error handler
export const handleApiError = (
  error: unknown, 
  fallbackMessage = "Something went wrong"
) => {
  const message = error instanceof Error ? error.message : fallbackMessage;
  
  // Check for specific error types
  if (message.includes("auth") || message.includes("session")) {
    showError("Your session has expired", {
      description: "Please log in again to continue.",
    });
    return;
  }
  
  if (message.includes("network") || message.includes("fetch")) {
    showError("Connection error", {
      description: "Please check your internet connection.",
      onRetry: () => window.location.reload(),
    });
    return;
  }
  
  showError(fallbackMessage, {
    description: message !== fallbackMessage ? message : undefined,
  });
};

// Payment error handler
export const handlePaymentError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Payment failed";
  
  showError("Payment could not be processed", {
    description: message,
    supportLink: true,
  });
};