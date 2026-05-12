import { getTenantAccessToken } from "./auth";

const BASE = "https://open.feishu.cn/open-apis/sheets/v2";

interface SheetRow {
  fields: Record<string, unknown>;
}

async function feishuFetch(url: string, options: RequestInit = {}) {
  const token = await getTenantAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Feishu API error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createSpreadsheet(title: string, sheetTitles: string[]) {
  const sheets = sheetTitles.map((t) => ({ title: t }));
  const body = { title, folder_token: "", sheets };
  const data = await feishuFetch(
    "https://open.feishu.cn/open-apis/sheets/v3/spreadsheets",
    { method: "POST", body: JSON.stringify(body) }
  );
  return data.data.spreadsheet;
}

export async function getSheetMeta(spreadsheetToken: string) {
  const data = await feishuFetch(
    `${BASE}/spreadsheets/${spreadsheetToken}/metainfo`
  );
  return data.data;
}

export async function appendRows(
  spreadsheetToken: string,
  sheetId: string,
  rows: Record<string, string>[]
) {
  const values = rows.map((row) => Object.values(row));
  const body = { value_range_list: [{ range: "", values }] };
  const data = await feishuFetch(
    `${BASE}/spreadsheets/${spreadsheetToken}/values_append`,
    { method: "POST", body: JSON.stringify(body) }
  );
  return data.data;
}

export async function getRows(
  spreadsheetToken: string,
  sheetId: string,
  range: string = ""
) {
  const data = await feishuFetch(
    `${BASE}/spreadsheets/${spreadsheetToken}/values/${sheetId}?valueRenderOption=ToString`
  );
  return data.data;
}

export async function updateRows(
  spreadsheetToken: string,
  sheetId: string,
  range: string,
  values: string[][]
) {
  const body = { value_range: { range, values } };
  const data = await feishuFetch(
    `${BASE}/spreadsheets/${spreadsheetToken}/values`,
    { method: "PUT", body: JSON.stringify(body) }
  );
  return data.data;
}
