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
            error: {
              message: error.message,
              statusCode: error.statusCode,
            },
          },
          { status: error.statusCode }
        );
      }

      // Hide internal server errors in production
      const isProduction = process.env.NODE_ENV === "production";
      return NextResponse.json(
        {
          success: false,
          error: {
            message: isProduction ? "Internal Server Error" : error.message,
            statusCode: 500,
          },
        },
        { status: 500 }
      );
    }
  };
}
