with open('types.ts', 'r') as f:
    content = f.read()

old_str = """export interface InvoiceItem {
  sku: string;
  qty: number;
  value: number;
}"""

new_str = """export interface InvoiceItem {
  sku?: string;
  qty?: number;
  value?: number;
  skuName?: string;
  matchedSkuName?: string;
  invoicedSkuName?: string;
  category?: string;
  caseConfiguration?: string;
  physicalCases?: number;
  invoicedQuantity?: number;
  invoicedUnit?: string;
  mrpPerCase?: number;
  mrpRevenue?: number;
  payoutPercentage?: number;
  payoutAmount?: number;
  confidence?: number;
  [key: string]: unknown;
}"""

with open('types.ts', 'w') as f:
    f.write(content.replace(old_str, new_str))
print("Patched types.ts")
