import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./AppError";
import { logger } from "./logger";

type ApiHandler = (req: NextRequest, context: any) => Promise<Response>;

export function apiWrapper(handler: ApiHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      // Basic request log
      logger.info(`[API REQUEST] ${req.method} ${req.nextUrl.pathname}`);
      
      const response = await handler(req, context);
      return response;
    } catch (error: any) {
      logger.error(`[API ERROR] ${req.method} ${req.nextUrl.pathname}`, {
        message: error.message,
        stack: error.stack,
        statusCode: error instanceof AppError ? error.statusCode : 500,
      });

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message || "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };
}
