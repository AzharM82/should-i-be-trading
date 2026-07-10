import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { listTrades } from "../lib/tradeLog.js";
import { computeCalibration } from "../lib/calibration.js";

// GET /api/calibration → the feedback mirror (recommended vs actual vs P&L)
async function calibrationHandler(_req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const trades = await listTrades();
    return { jsonBody: computeCalibration(trades) };
  } catch (err) {
    ctx.error("calibration error:", err);
    return { status: 500, jsonBody: { error: err instanceof Error ? err.message : "Unknown error" } };
  }
}

app.http("calibration", { methods: ["GET"], authLevel: "anonymous", route: "calibration", handler: calibrationHandler });
