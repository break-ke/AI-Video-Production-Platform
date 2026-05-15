import { getTenantAccessToken } from "@/lib/feishu/auth";

const SPREADSHEET_TOKEN = process.env.FEISHU_SPREADSHEET_TOKEN || "S4kqsRjHjhQulqt4g9ScCXzTndg";
const SPREADSHEET_URL = process.env.FEISHU_SPREADSHEET_URL || "https://rcndps73fp7d.feishu.cn/sheets/S4kqsRjHjhQulqt4g9ScCXzTndg";

export async function syncToFeishu(table: string, row: Record<string, string>) {
  try {
    const token = await getTenantAccessToken();
    const values = [Object.values(row)];
    const body = { value_range_list: [{ range: `A:ZZ`, values }] };

    const res = await fetch(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${SPREADSHEET_TOKEN}/values_append`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (data.code !== 0) {
      console.error(`[Feishu] Write failed: ${data.msg}`);
      return false;
    }
    console.log(`[Feishu] Data written to ${table}`);
    return true;
  } catch (e) {
    console.error(`[Feishu] Sync error:`, (e as Error).message);
    return false;
  }
}

export function getSpreadsheetUrl() {
  return SPREADSHEET_URL;
}
