with open('types.ts', 'r') as f:
    content = f.read()

old_str = """export interface Invoice {
  id: string;"""

new_str = """export interface Invoice {
  id: string;
  items?: InvoiceItem[];
  estimatedPayoutAmount?: number;
  totalMrpRevenue?: number;
  estimatedPayoutPercentage?: number;"""

with open('types.ts', 'w') as f:
    f.write(content.replace(old_str, new_str))
print("Patched types.ts")
