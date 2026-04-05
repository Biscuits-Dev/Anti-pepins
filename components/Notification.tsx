"use client";

import React, { useEffect } from "react";
import { useAppStore, selectNotification } from "../store";
import { toast } from "react-hot-toast";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 5000,
}) => {
  useEffect(() => {
    let toastId: string | number | undefined;

    switch (type) {
      case "success":
        toastId = toast.success(message, { duration });
        break;
      case "error":
        toastId = toast.error(message, { duration });
        break;
      case "info":
        toastId = toast(message, { duration });
        break;
      case "warning":
        toastId = toast(message, { duration, icon: "⚠️" });
        break;
    }

    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [message, type, duration]);

  return null;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notification = useAppStore(selectNotification);

  useEffect(() => {
    if (notification.visible && notification.message) {
      let toastId: string | number | undefined;

      switch (notification.type) {
        case "success":
          toastId = toast.success(notification.message);
          break;
        case "error":
          toastId = toast.error(notification.message);
          break;
        case "info":
          toastId = toast(notification.message);
          break;
        case "warning":
          toastId = toast(notification.message, { icon: "⚠️" });
          break;
      }

      return () => {
        if (toastId) {
          toast.dismiss(toastId);
        }
      };
    }
  }, [notification]);

  return <>{children}</>;
};

export default Notification;
