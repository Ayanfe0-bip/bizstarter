export type WorkspacePage =
  | "dashboard"
  | "sales"
  | "expenses"
  | "profit"
  | "debts"
  | "reports"
  | "settings";

export type TransactionKind = "sale" | "expense";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  description: string;
  amount: number;
  category: string;
  date: string;
};

export type CustomerDebt = {
  id: string;
  name: string;
  amountOwed: number;
  amountPaid: number;
  dueDate: string;
};

function dayOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const initialTransactions: Transaction[] = [
  { id: "sample-1", kind: "sale", description: "Custom cake order", amount: 185000, category: "Product sales", date: dayOffset(0) },
  { id: "sample-2", kind: "expense", description: "Packaging supplies", amount: 32000, category: "Supplies", date: dayOffset(0) },
  { id: "sample-3", kind: "sale", description: "Weekend pastry orders", amount: 95000, category: "Product sales", date: dayOffset(1) },
  { id: "sample-4", kind: "expense", description: "Market ingredients", amount: 65000, category: "Inventory", date: dayOffset(2) },
  { id: "sample-5", kind: "sale", description: "Celebration dessert box", amount: 62000, category: "Product sales", date: dayOffset(3) },
  { id: "sample-6", kind: "expense", description: "Delivery costs", amount: 20500, category: "Transport", date: dayOffset(4) },
  { id: "sample-7", kind: "sale", description: "Office snack order", amount: 48000, category: "Product sales", date: dayOffset(5) },
];

export const initialDebts: CustomerDebt[] = [
  { id: "debt-1", name: "Demo customer A", amountOwed: 180000, amountPaid: 125000, dueDate: dayOffset(-5) },
  { id: "debt-2", name: "Demo customer B", amountOwed: 68000, amountPaid: 39000, dueDate: dayOffset(4) },
];

export const chartData = [
  { label: "Mon", amount: 54 },
  { label: "Tue", amount: 72 },
  { label: "Wed", amount: 46 },
  { label: "Thu", amount: 88 },
  { label: "Fri", amount: 63 },
  { label: "Sat", amount: 96 },
  { label: "Sun", amount: 68 },
];

export const expenseCategories = ["Inventory", "Supplies", "Transport", "Rent", "Utilities", "Marketing", "Other"];