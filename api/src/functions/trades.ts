import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { createTrade, listTrades, closeTrade } from "../lib/tradeLog.js";
import type { NewTradeInput, CloseTradeInput } from "../lib/types.js";

// GET /api/trades  → list all trades (newest first)
async function listHandler(_req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const trades = await listTrades();
    return { jsonBody: { trades } };
  } catch (err) {
    ctx.error("trades list error:", err);
    return { status: 500, jsonBody: { error: err instanceof Error ? err.message : "Unknown error" } };
  }
}

// POST /api/trades  → create a trade (snapshots the recommendation)
async function createHandler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as Partial<NewTradeInput>;

    // minimal validation
    if (!body.ticker || !body.dirTaken || body.sizeUsedPct === undefined) {
      return { status: 400, jsonBody: { error: "ticker, dirTaken and sizeUsedPct are required" } };
    }

    const input: NewTradeInput = {
      ticker: String(body.ticker).toUpperCase().slice(0, 8),
      dirTaken: body.dirTaken,
      sizeUsedPct: clampPct(Number(body.sizeUsedPct)),
      mode: body.mode === "day" ? "day" : "swing",
      recSize: body.recSize ?? "NONE",
      recSizePct: Number(body.recSizePct ?? 0),
      recInstrument: body.recInstrument ?? "CASH",
      recDirection: body.recDirection ?? "NEITHER",
      recBias: body.recBias ?? "NEUTRAL",
      decision: body.decision ?? "CAUTION",
      qualityScore: Number(body.qualityScore ?? 0),
      execScore: Number(body.execScore ?? 0),
      regime: String(body.regime ?? ""),
      vixLevel: Number(body.vixLevel ?? 0),
    };

    const trade = await createTrade(input, Date.now());
    return { status: 201, jsonBody: { trade } };
  } catch (err) {
    ctx.error("trades create error:", err);
    return { status: 500, jsonBody: { error: err instanceof Error ? err.message : "Unknown error" } };
  }
}

// PATCH /api/trades/{id}  → close a trade with an outcome
async function closeHandler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = req.params.id;
    if (!id) return { status: 400, jsonBody: { error: "id required" } };

    const body = (await req.json()) as CloseTradeInput;
    const close: CloseTradeInput = {
      pnl: body.pnl === undefined || body.pnl === null ? null : Number(body.pnl),
      rMultiple: body.rMultiple === undefined || body.rMultiple === null ? null : Number(body.rMultiple),
      win: typeof body.win === "boolean" ? body.win : null,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : "",
    };

    const trade = await closeTrade(id, close);
    return { jsonBody: { trade } };
  } catch (err) {
    ctx.error("trades close error:", err);
    const status = (err as { statusCode?: number })?.statusCode === 404 ? 404 : 500;
    return { status, jsonBody: { error: err instanceof Error ? err.message : "Unknown error" } };
  }
}

function clampPct(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

app.http("tradesList", { methods: ["GET"], authLevel: "anonymous", route: "trades", handler: listHandler });
app.http("tradesCreate", { methods: ["POST"], authLevel: "anonymous", route: "trades", handler: createHandler });
app.http("tradesClose", { methods: ["PATCH"], authLevel: "anonymous", route: "trades/{id}", handler: closeHandler });
