import { TableClient, odata } from "@azure/data-tables";
import type { TradeRecord, NewTradeInput, CloseTradeInput } from "./types.js";

const TABLE_NAME = "TradeLog";
const PARTITION = "trades"; // single-user app

let clientPromise: Promise<TableClient> | null = null;

function getConnectionString(): string {
  const conn = process.env.TABLES_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  if (!conn) {
    throw new Error("No storage connection string (set TABLES_CONNECTION_STRING or AzureWebJobsStorage)");
  }
  return conn;
}

async function getClient(): Promise<TableClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = TableClient.fromConnectionString(getConnectionString(), TABLE_NAME, {
        allowInsecureConnection: true, // permits the local Azurite emulator over http
      });
      try {
        await client.createTable();
      } catch (err: unknown) {
        // 409 = table already exists; anything else is real
        const status = (err as { statusCode?: number })?.statusCode;
        if (status !== 409) throw err;
      }
      return client;
    })();
  }
  return clientPromise;
}

// Descending rowKey so the natural table order is newest-first.
function makeRowKey(now: number): string {
  const inverted = (9_999_999_999_999 - now).toString().padStart(13, "0");
  return `${inverted}`;
}

type TradeEntity = Omit<TradeRecord, "id"> & { partitionKey: string; rowKey: string };

function toRecord(e: TradeEntity): TradeRecord {
  const { partitionKey: _pk, rowKey, ...rest } = e;
  return { id: rowKey, ...rest } as TradeRecord;
}

export async function createTrade(input: NewTradeInput, nowMs: number): Promise<TradeRecord> {
  const client = await getClient();
  const rowKey = makeRowKey(nowMs);
  const openedAt = new Date(nowMs).toISOString();

  const entity: TradeEntity = {
    partitionKey: PARTITION,
    rowKey,
    openedAt,
    status: "OPEN",
    ticker: input.ticker,
    dirTaken: input.dirTaken,
    sizeUsedPct: input.sizeUsedPct,
    mode: input.mode,
    recSize: input.recSize,
    recSizePct: input.recSizePct,
    recInstrument: input.recInstrument,
    recDirection: input.recDirection,
    recBias: input.recBias,
    decision: input.decision,
    qualityScore: input.qualityScore,
    execScore: input.execScore,
    regime: input.regime,
    vixLevel: input.vixLevel,
    pnl: null,
    rMultiple: null,
    win: null,
    notes: "",
    closedAt: null,
  };

  await client.createEntity(entity);
  return toRecord(entity);
}

export async function listTrades(): Promise<TradeRecord[]> {
  const client = await getClient();
  const out: TradeRecord[] = [];
  const iter = client.listEntities<TradeEntity>({
    queryOptions: { filter: odata`PartitionKey eq ${PARTITION}` },
  });
  for await (const e of iter) {
    out.push(toRecord(e as TradeEntity));
  }
  return out;
}

export async function closeTrade(id: string, close: CloseTradeInput): Promise<TradeRecord> {
  const client = await getClient();
  const existing = await client.getEntity<TradeEntity>(PARTITION, id);

  const updated: TradeEntity = {
    ...(existing as TradeEntity),
    status: "CLOSED",
    pnl: close.pnl ?? existing.pnl ?? null,
    rMultiple: close.rMultiple ?? existing.rMultiple ?? null,
    win: close.win ?? existing.win ?? null,
    notes: close.notes ?? existing.notes ?? "",
    closedAt: new Date().toISOString(),
  };

  await client.updateEntity(updated, "Replace");
  return toRecord(updated);
}
