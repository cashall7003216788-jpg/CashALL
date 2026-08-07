export const logger = {
  info(message: string, meta?: any) {
    console.log(
      JSON.stringify({
        level: "INFO",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },
  warn(message: string, meta?: any) {
    console.warn(
      JSON.stringify({
        level: "WARN",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },
  error(message: string, meta?: any) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },
  adminAction(adminId: string, action: string, details?: any) {
    console.log(
      JSON.stringify({
        level: "INFO",
        type: "ADMIN_ACTION",
        timestamp: new Date().toISOString(),
        adminId,
        action,
        ...details,
      })
    );
  },
  userAction(userId: string, action: string, details?: any) {
    console.log(
      JSON.stringify({
        level: "INFO",
        type: "USER_ACTION",
        timestamp: new Date().toISOString(),
        userId,
        action,
        ...details,
      })
    );
  },
  email(to: string, subject: string, status: string, error?: string) {
    console.log(
      JSON.stringify({
        level: status === "SENT" ? "INFO" : "ERROR",
        type: "EMAIL",
        timestamp: new Date().toISOString(),
        to,
        subject,
        status,
        error,
      })
    );
  },
  auth(phone: string, event: string, success: boolean, details?: any) {
    console.log(
      JSON.stringify({
        level: success ? "INFO" : "WARN",
        type: "AUTH",
        timestamp: new Date().toISOString(),
        phone,
        event,
        success,
        ...details,
      })
    );
  },
};
