import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "@/features/bizstarter/AuthScreen";
import LandingPage from "@/features/bizstarter/LandingPage";
import { supabase } from "@/lib/supabase";
import {
ArrowDownLeft,
ArrowRight,
ArrowUpRight,
BarChart3,
Bell,
Building2,
CheckCircle2,
ChevronDown,
CircleDollarSign,
ClipboardList,
Database,
Download,
FileText,
HandCoins,
Info,
LayoutDashboard,
Menu,
MoreHorizontal,
Plus,
Receipt,
Search,
Settings2,
ShieldCheck,
ShoppingBag,
Sparkles,
TrendingUp,
Wallet,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  chartData,
  expenseCategories,
  type CustomerDebt,
  type Product,
  type Transaction,
  type TransactionKind,
  type WorkspacePage,
} from "@/features/bizstarter/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BizStarter — Small business, in good hands" },
      {
        name: "description",
        content:
          "A simple business workspace to record sales, manage expenses, track customer balances, and understand business performance.",
      },
      {
        property: "og:title",
        content: "BizStarter — Small business, in good hands",
      },
      {
        property: "og:description",
        content:
          "A simple business workspace to record sales, manage expenses, track customer balances, and understand business performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthenticatedIndex,
});

const pageLinks: {
  id: WorkspacePage;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "sales", label: "Sales", icon: ShoppingBag },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "profit", label: "Profit overview", icon: TrendingUp },
  { id: "debts", label: "Customer debts", icon: HandCoins },
  { id: "inventory", label: "Inventory", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const featureCards = [
  {
    title: "Sales tracking",
    detail: "Keep every order in one clear place.",
    icon: ShoppingBag,
    tone: "mint",
  },
  {
    title: "Expense management",
    detail: "Know what your business spends.",
    icon: Wallet,
    tone: "peach",
  },
  {
    title: "Profit overview",
    detail: "See a thoughtful estimate at a glance.",
    icon: TrendingUp,
    tone: "blue",
  },
  {
    title: "Customer debts",
    detail: "Keep track of credit and payments.",
    icon: HandCoins,
    tone: "lilac",
  },
  {
    title: "Business reports",
    detail: "Review daily and monthly activity.",
    icon: ClipboardList,
    tone: "yellow",
  },
];

const TRANSACTIONS_STORAGE_KEY_PREFIX = "bizstarter-transactions-v1";
const DEBTS_STORAGE_KEY_PREFIX = "bizstarter-debts-v1";
const PRODUCTS_STORAGE_KEY_PREFIX = "bizstarter-products-v1";
type BusinessProfile = {
  businessName: string;
  phone: string;
  address: string;
  email: string;
};

const BUSINESS_PROFILE_STORAGE_KEY = "bizstarter-business-profile-v1";

function getBusinessProfile(): BusinessProfile {
  const fallback: BusinessProfile = {
    businessName: "",
    phone: "",
    address: "",
    email: "",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY);

    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}
function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  const value = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
function downloadReceiptPdf(transaction: Transaction) {
  const receiptNumber = `BS-${transaction.id.slice(-8).toUpperCase()}`;
  const customerName =
    transaction.customerName?.trim() || "Walk-in customer";

  const amount = `NGN ${transaction.amount.toLocaleString("en-NG")}`;

  const description = transaction.description || "Sale";
  const descriptionLines =
    description.match(/.{1,50}/g) || ["Sale"];

  const lines = [
    { text: "BizStarter", size: 22 },
    { text: "SALES RECEIPT", size: 14 },
    { text: `Receipt number: ${receiptNumber}`, size: 11 },
    { text: `Date: ${formatDate(transaction.date)}`, size: 11 },
    { text: `Customer: ${customerName}`, size: 11 },
    { text: "Item purchased:", size: 11 },
    ...descriptionLines.map((text) => ({ text, size: 11 })),
    { text: `Total: ${amount}`, size: 16 },
    { text: "Thank you for supporting our business.", size: 11 },
    { text: "Created with BizStarter - Ayanfe Innovation Labs Limited", size: 9 },
  ];

  const escapePdfText = (text: string) =>
    text
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  let y = 790;

  const content = lines
    .map((line) => {
      const command =
        `BT /F1 ${line.size} Tf 50 ${y} Td ` +
        `(${escapePdfText(line.text)}) Tj ET`;
      y -= line.size === 22 ? 38 : line.size === 16 ? 34 : 25;
      return command;
    })
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `BizStarter-Receipt-${receiptNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function isValidTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<Transaction>;

  return (
    typeof item.id === "string" &&
    (item.kind === "sale" || item.kind === "expense") &&
    typeof item.description === "string" &&
    typeof item.amount === "number" &&
    Number.isFinite(item.amount) &&
    item.amount > 0 &&
    typeof item.category === "string" &&
    typeof item.date === "string"
  );
}

function isValidDebt(value: unknown): value is CustomerDebt {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CustomerDebt>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.amountOwed === "number" &&
    Number.isFinite(item.amountOwed) &&
    item.amountOwed >= 0 &&
    typeof item.amountPaid === "number" &&
    Number.isFinite(item.amountPaid) &&
    item.amountPaid >= 0 &&
    typeof item.dueDate === "string"
  );
}
function isValidProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<Product>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.sku === "string" &&
    typeof item.category === "string" &&
    typeof item.costPrice === "number" &&
    Number.isFinite(item.costPrice) &&
    item.costPrice >= 0 &&
    typeof item.sellingPrice === "number" &&
    Number.isFinite(item.sellingPrice) &&
    item.sellingPrice >= 0 &&
    typeof item.quantityInStock === "number" &&
    Number.isFinite(item.quantityInStock) &&
    item.quantityInStock >= 0 &&
    typeof item.lowStockThreshold === "number" &&
    Number.isFinite(item.lowStockThreshold) &&
    item.lowStockThreshold >= 0
  );
    }
  function AuthenticatedIndex() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Session check failed:", error);
      }

      setSession(data.session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return <div className="p-8 text-center">Checking your account...</div>;
  }

  if (!session) {
  if (!showAuth) {
    return (
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
      />
    );
  }

  return (
    <AuthScreen
      onBack={() => setShowAuth(false)}
      onSuccess={() => {
        void supabase.auth.getSession().then(({ data }) => {
          setSession(data.session);
        });
      }}
    />
  );
  }
    
return <Index key={session.user.id} userId={session.user.id} />;
}
function Index({ userId }: { userId: string }) {
const [page, setPage] = useState<WorkspacePage | "home">("dashboard");
  const transactionsStorageKey = `${TRANSACTIONS_STORAGE_KEY_PREFIX}-${userId}`;
const debtsStorageKey = `${DEBTS_STORAGE_KEY_PREFIX}-${userId}`;
const productsStorageKey = `${PRODUCTS_STORAGE_KEY_PREFIX}-${userId}`;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
const [debts, setDebts] = useState<CustomerDebt[]>([]);
const [products, setProducts] = useState<Product[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
const [cloudReady, setCloudReady] = useState(false);
const [storageError, setStorageError] = useState("");

  const [dialogKind, setDialogKind] = useState<
  TransactionKind | "payment" | "debt" | "product" | null
>(null);
const [receiptTransaction, setReceiptTransaction] =
  useState<Transaction | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");

      // Restore both older records and this user's records.
  useEffect(() => {
    try {
      const savedTransactions = window.localStorage.getItem(
  transactionsStorageKey,
);

const savedDebts = window.localStorage.getItem(
  debtsStorageKey,
);

const savedProducts = window.localStorage.getItem(
  productsStorageKey,
);

      // Legacy records were stored under shared keys before accounts
      // had separate local storage. Keep them with the original owner.
      const legacyOwnerKey = "bizstarter-legacy-owner-v1";

      const oldTransactions = window.localStorage.getItem(
        "bizstarter-transactions-v1",
      );
      const oldDebts = window.localStorage.getItem(
        "bizstarter-debts-v1",
      );

      const parseArray = (value: string | null): unknown[] => {
        if (!value) return [];

        try {
          const parsed: unknown = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const legacyTransactions = parseArray(oldTransactions).filter(
        isValidTransaction,
      );
      const legacyDebts = parseArray(oldDebts).filter(isValidDebt);

      let legacyOwnerId = window.localStorage.getItem(legacyOwnerKey);

      if (
        !legacyOwnerId &&
        (legacyTransactions.length > 0 || legacyDebts.length > 0)
      ) {
        legacyOwnerId = userId;
        window.localStorage.setItem(legacyOwnerKey, userId);
      }

      const isLegacyOwner = legacyOwnerId === userId;

      const legacyTransactionIds = new Set(
        legacyTransactions.map((item) => item.id),
      );
      const legacyDebtIds = new Set(legacyDebts.map((item) => item.id));

      const savedTransactionRecords = parseArray(savedTransactions).filter(
        isValidTransaction,
      );
      const savedDebtRecords = parseArray(savedDebts).filter(isValidDebt);
      const savedProductRecords = parseArray(savedProducts).filter(
  isValidProduct,
);
      // Do not load legacy records into another account.
      const isolatedTransactions = isLegacyOwner
        ? savedTransactionRecords
        : savedTransactionRecords.filter(
            (item) => !legacyTransactionIds.has(item.id),
          );

      const isolatedDebts = isLegacyOwner
        ? savedDebtRecords
        : savedDebtRecords.filter((item) => !legacyDebtIds.has(item.id));

      const mergeById = <T extends { id: string }>(
        older: T[],
        current: T[],
      ): T[] => {
        const records = new Map<string, T>();

        for (const item of older) records.set(item.id, item);
        for (const item of current) records.set(item.id, item);

        return Array.from(records.values());
      };

            const restoredTransactions = isLegacyOwner
        ? mergeById(legacyTransactions, isolatedTransactions)
        : isolatedTransactions;

      const restoredDebts = isLegacyOwner
        ? mergeById(legacyDebts, isolatedDebts)
        : isolatedDebts;

      setTransactions(restoredTransactions);
setDebts(restoredDebts);
setProducts(savedProductRecords);
    } catch (error) {
      console.error("Could not restore BizStarter records:", error);
      setStorageError(
        "Some records could not be restored. Your saved data has not been intentionally deleted.",
      );
    } finally {
      setStorageLoaded(true);
    }
  }, [transactionsStorageKey, debtsStorageKey, productsStorageKey]);

  // Save records automatically after the initial restoration has completed.
  useEffect(() => {
    if (!storageLoaded) return;

    try {
      window.localStorage.setItem(
        transactionsStorageKey,
        JSON.stringify(transactions),
      );

      window.localStorage.setItem(
        debtsStorageKey,
        JSON.stringify(debts),
      );
    window.localStorage.setItem(
  productsStorageKey,
  JSON.stringify(products),
); 
      setStorageError("");
    } catch (error) {
      console.error("Could not save BizStarter records:", error);
      setStorageError(
        "Your latest changes could not be saved. Check available browser storage.",
      );
    }
  }, [
  storageLoaded,
  transactions,
  debts,
  products,
  transactionsStorageKey,
  debtsStorageKey,
  productsStorageKey,
]);
    
  // Load cloud records and safely merge them with this user's local records.
  useEffect(() => {
    if (!storageLoaded) return;

    let cancelled = false;

    async function syncRecords() {
      try {
        
const [
  transactionsResult,
  debtsResult,
  productsResult,
] = await Promise.all([
  supabase
    .from("bizstarter_transactions")
    .select("*")
    .eq("user_id", userId),

  supabase
    .from("bizstarter_customer_debts")
    .select("*")
    .eq("user_id", userId),

  supabase
    .from("bizstarter_products")
    .select("*")
    .eq("user_id", userId),
]);
        if (transactionsResult.error) throw transactionsResult.error;
        if (debtsResult.error) throw debtsResult.error;
         if (productsResult.error) throw productsResult.error;
        const validUuid = (id: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        const localTransactions: Transaction[] = transactions
          .filter(isValidTransaction)
          .map((item) =>
            validUuid(item.id)
              ? item
              : { ...item, id: crypto.randomUUID() },
          );

        const localDebts: CustomerDebt[] = debts
          .filter(isValidDebt)
          .map((item) =>
            validUuid(item.id)
              ? item
              : { ...item, id: crypto.randomUUID() },
          );

        
        const cloudTransactions: Transaction[] =
  (transactionsResult.data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as TransactionKind,
    description: row.description,
    customerName: row.customer_name ?? "",
    amount: Number(row.amount),
    category: row.category,
    date: row.transaction_date,
  }));
        const cloudProducts: Product[] =
  (productsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku ?? "",
    category: row.category ?? "",
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    quantityInStock: Number(row.quantity_in_stock),
    lowStockThreshold: Number(row.low_stock_threshold),
  }));
        const cloudDebts: CustomerDebt[] =
          (debtsResult.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            amountOwed: Number(row.amount_owed),
            amountPaid: Number(row.amount_paid),
            dueDate: row.due_date ?? "",
          }));

        const mergeById = <T extends { id: string }>(
          cloud: T[],
          local: T[],
        ): T[] => {
          const records = new Map(
            cloud.map((item) => [item.id, item]),
          );

          for (const item of local) {
            records.set(item.id, item);
          }

          return Array.from(records.values());
        };
       const localProducts: Product[] = products
  .filter(isValidProduct)
  .map((item) =>
    validUuid(item.id)
      ? item
      : { ...item, id: crypto.randomUUID() },
  );

const mergedProducts = mergeById(
  cloudProducts,
  localProducts,
);
        const mergedTransactions = mergeById(
          cloudTransactions,
          localTransactions,
        );

        const mergedDebts = mergeById(cloudDebts, localDebts);
        if (mergedTransactions.length > 0) {
          const { error } = await supabase
            .from("bizstarter_transactions")
            .upsert(
mergedTransactions.map((item) => ({
id: item.id,
user_id: userId,
kind: item.kind,
description: item.description,
customer_name: item.customerName ?? null,
amount: item.amount,
category: item.category,
transaction_date: item.date,
})),
{ onConflict: "id" },
);
          if (error) throw error;
        }

        if (mergedDebts.length > 0) {
          const { error } = await supabase
            .from("bizstarter_customer_debts")
            .upsert(
              mergedDebts.map((item) => ({
                id: item.id,
                user_id: userId,
                name: item.name,
                amount_owed: item.amountOwed,
                amount_paid: item.amountPaid,
                due_date: item.dueDate || null,
              })),
              { onConflict: "id" },
            );

          if (error) throw error;
        }
      if (mergedProducts.length > 0) {
  const productRows = mergedProducts.map((item) => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    sku: item.sku || null,
    category: item.category || null,
    cost_price: item.costPrice,
    selling_price: item.sellingPrice,
    quantity_in_stock: item.quantityInStock,
    low_stock_threshold: item.lowStockThreshold,
  }));

  const { error } = await supabase
    .from("bizstarter_products")
    .upsert(productRows, { onConflict: "id" });

  if (error) throw error;
}
        if (cancelled) return;

        setTransactions(mergedTransactions);
        setDebts(mergedDebts);
        setProducts(mergedProducts);
        setCloudReady(true);
        setStorageError("");
      } catch (error) {
        console.error("BizStarter cloud migration failed:", error);

        if (!cancelled) {
          setStorageError(
            "Cloud sync failed. Your existing records remain on this device.",
          );
        }
      }
    }

    void syncRecords();

    return () => {
      cancelled = true;
    };
  }, [storageLoaded, userId]);
      // Automatically save changes to this user's cloud records.
  useEffect(() => {
    if (!cloudReady) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      async function saveToCloud() {
        try {
          const transactionRows = transactions.map((item) => ({
  id: item.id,
  user_id: userId,
  kind: item.kind,
  description: item.description,
  customer_name: item.customerName ?? null,
  amount: item.amount,
  category: item.category,
  transaction_date: item.date,
}));

          const debtRows = debts.map((item) => ({
            id: item.id,
            user_id: userId,
            name: item.name,
            amount_owed: item.amountOwed,
            amount_paid: item.amountPaid,
            due_date: item.dueDate || null,
          }));
        const productRows = products.map((item) => ({
  id: item.id,
  user_id: userId,
  name: item.name,
  sku: item.sku || null,
  category: item.category || null,
  cost_price: item.costPrice,
  selling_price: item.sellingPrice,
  quantity_in_stock: item.quantityInStock,
  low_stock_threshold: item.lowStockThreshold,
}));
          if (transactionRows.length > 0) {
            const { error } = await supabase
              .from("bizstarter_transactions")
              .upsert(transactionRows, { onConflict: "id" });

            if (error) throw error;
          }

          if (debtRows.length > 0) {
            const { error } = await supabase
              .from("bizstarter_customer_debts")
              .upsert(debtRows, { onConflict: "id" });

            if (error) throw error;
          }
          if (productRows.length > 0) {
  const { error } = await supabase
    .from("bizstarter_products")
    .upsert(productRows, { onConflict: "id" });

  if (error) throw error;
}
          if (!cancelled) {
            setStorageError("");
          }
        } catch (error) {
          console.error("BizStarter cloud save failed:", error);

          if (!cancelled) {
            setStorageError(
              "Cloud save failed. Your device records are still available.",
            );
          }
        }
      }

      void saveToCloud();
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cloudReady, transactions, debts, products, userId]);
  const sales = useMemo(
    () => transactions.filter((transaction) => transaction.kind === "sale"),
    [transactions],
  );

  const expenses = useMemo(
    () => transactions.filter((transaction) => transaction.kind === "expense"),
    [transactions],
  );

  const salesTotal = sales.reduce((sum, item) => sum + item.amount, 0);
  const expensesTotal = expenses.reduce((sum, item) => sum + item.amount, 0);

  const debtsTotal = debts.reduce(
    (sum, item) => sum + Math.max(0, item.amountOwed - item.amountPaid),
    0,
  );

  const openDebtCount = debts.filter(
    (debt) => debt.amountOwed > debt.amountPaid,
  ).length;

        function addTransaction(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

if (dialogKind !== "sale" && dialogKind !== "expense") return;

const formData = new FormData(event.currentTarget);

const description = String(formData.get("description") ?? "").trim();
   const customerName =
  dialogKind === "sale"
    ? String(formData.get("customerName") ?? "").trim()
    : "";       
const amount = Number(formData.get("amount"));
const date = String(formData.get("date") ?? "");

const category =
  dialogKind === "sale"
    ? "Product sales"
    : String(formData.get("category") ?? "Other");

if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
  return;
}

const newTransaction: Transaction = {
  id: crypto.randomUUID(),
  kind: dialogKind,
  description,
  customerName,
  amount,
  category,
  date,
};

setTransactions((current) => [newTransaction, ...current]);

if (newTransaction.kind === "sale") {
  setReceiptTransaction(newTransaction);
}

setDialogKind(null);

}
function addProduct(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const costPrice = Number(formData.get("costPrice"));
  const sellingPrice = Number(formData.get("sellingPrice"));
  const quantityInStock = Number(formData.get("quantityInStock"));
  const lowStockThreshold = Number(formData.get("lowStockThreshold") ?? 5);

  if (
    !name ||
    !Number.isFinite(costPrice) ||
    !Number.isFinite(sellingPrice) ||
    !Number.isInteger(quantityInStock) ||
    !Number.isInteger(lowStockThreshold) ||
    costPrice < 0 ||
    sellingPrice < 0 ||
    quantityInStock < 0 ||
    lowStockThreshold < 0
  ) {
    return;
  }

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name,
    sku,
    category,
    costPrice,
    sellingPrice,
    quantityInStock,
    lowStockThreshold,
  };

  setProducts((current) => [newProduct, ...current]);
  setDialogKind(null);
                          }
function addDebt(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

const formData = new FormData(event.currentTarget);

const name = String(formData.get("name") ?? "").trim();
const amountOwed = Number(formData.get("amountOwed"));
const amountPaid = Number(formData.get("amountPaid") ?? 0);
const dueDate = String(formData.get("dueDate") ?? "");

if (
  !name ||
  !Number.isFinite(amountOwed) ||
  !Number.isFinite(amountPaid) ||
  amountOwed <= 0 ||
  amountPaid < 0 ||
  amountPaid > amountOwed
) {
  return;
}

const newDebt: CustomerDebt = {
  id: crypto.randomUUID(),
  name,
  amountOwed,
  amountPaid,
  dueDate,
};

setDebts((current) => [newDebt, ...current]);
setDialogKind(null);

}

function recordPayment(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

const formData = new FormData(event.currentTarget);

const debtId = String(formData.get("debtId") ?? "");
const payment = Number(formData.get("payment"));

if (!debtId || !Number.isFinite(payment) || payment <= 0) return;

setDebts((current) =>
  current.map((debt) =>
    debt.id === debtId
      ? {
          ...debt,
          amountPaid: Math.min(
            debt.amountOwed,
            debt.amountPaid + payment,
          ),
        }
      : debt,
  ),
);

setDialogKind(null);

  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesQuery = `${transaction.description} ${transaction.category}`
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesCategory =
      categoryFilter === "All categories" ||
      transaction.category === categoryFilter;

    return matchesQuery && matchesCategory;
  });

  if (page === "home") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="landing-header">
          <a
            className="brand-lockup"
            href="#top"
            aria-label="BizStarter home"
          >
            <BrandMark />
            <span>BizStarter</span>
          </a>

          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#preview">Preview</a>
          </nav>

          <Button
            onClick={() => setPage("dashboard")}
            className="header-cta"
          >
            Open workspace <ArrowRight />
          </Button>
        </header>

        <main id="top">
          <section className="landing-hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles /> A clearer way to run your business
              </span>

              <h1>
                Take control of
                <br />
                <span>your business.</span>
              </h1>

              <p>
                Keep sales, expenses, and customer balances together in one
                simple place. Make a little more sense of every business day.
              </p>

              <div className="hero-actions">
                <Button size="lg" onClick={() => setPage("dashboard")}>
                  Get started <ArrowRight />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore features
                </Button>
              </div>

              <div className="hero-footnote">
                <span className="sample-dot" />
                Your records, saved in this browser on this device
              </div>
            </div>

            <div className="hero-preview-wrap" id="preview">
              <div className="preview-sparkle sparkle-one">✳</div>

              <DashboardPreview
                salesTotal={salesTotal}
                expensesTotal={expensesTotal}
              />

              <div className="preview-note">
                <span className="note-icon">
                  <CircleDollarSign />
                </span>
                <span>
                  <strong>A little more clarity</strong>
                  <small>Business at a glance</small>
                </span>
                <ArrowUpRight />
              </div>
            </div>
          </section>

          <section className="feature-section" id="features">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">A calmer business day</span>
                <h2>Everything in its place.</h2>
              </div>

              <p>Less guesswork, more time for the work that matters.</p>
            </div>

            <div className="feature-grid">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <button
                    key={feature.title}
                    className="feature-item"
                    onClick={() =>
                      setPage(
                        feature.title === "Sales tracking"
                          ? "sales"
                          : feature.title === "Expense management"
                            ? "expenses"
                            : feature.title === "Profit overview"
                              ? "profit"
                              : feature.title === "Customer debts"
                                ? "debts"
                                : "reports",
                      )
                    }
                  >
                    <span className={`feature-icon ${feature.tone}`}>
                      <Icon />
                    </span>

                    <span className="feature-title">
                      {feature.title}
                      <ArrowRight />
                    </span>

                    <span className="feature-detail">{feature.detail}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="closing-band">
            <div>
              <span className="eyebrow">
                Your next business day starts here
              </span>
              <h2>Start small. Manage smart. Grow bigger.</h2>
            </div>

            <Button
              variant="secondary"
              onClick={() => setPage("dashboard")}
            >
              Explore the workspace <ArrowRight />
            </Button>
          </section>
        </main>

        <footer className="landing-footer">
          <a className="brand-lockup" href="#top">
            <BrandMark />
            <span>BizStarter</span>
          </a>

          <span>Created by Ayanfe Innovation Labs Limited.</span>
          <span>Start Small. Manage Smart. Grow Bigger.</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      <aside className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}>
        <a
          className="brand-lockup sidebar-brand"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            setPage("home");
          }}
        >
          <BrandMark />
          <span>BizStarter</span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Workspace">
          {pageLinks.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => {
                setPage(id);
                setMenuOpen(false);
              }}
            >
              <Icon />
              {label}

              {id === "debts" && openDebtCount > 0 && (
                <span className="nav-count">{openDebtCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-help">
            <span className="help-mark">?</span>
            <span>
              <strong>Need a hand?</strong>
              <small>We’re here to help</small>
            </span>
            <ArrowRight />
          </div>

          <div className="sidebar-credit">
            Ayanfe Innovation Labs Limited
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="workspace-main">
        <header className="workspace-topbar">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {pageLinks.find((item) => item.id === page)?.label}
            </strong>
          </div>

          <div className="topbar-actions">
            <span className="sample-badge">
              <span />
              Saved locally
            </span>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            >
              <Bell />
            </Button>

            <button className="profile-chip" aria-label="Business profile">
              <span className="profile-avatar">B</span>
              <span className="profile-name">My business</span>
              <ChevronDown />
            </button>
          </div>
        </header>

        <main className="workspace-content">
          {!storageLoaded && (
            <div className="sample-notice">
              <Sparkles />
              <span>Loading your saved business records…</span>
            </div>
          )}

          {storageError && (
            <div className="sample-notice" role="alert">
              <Sparkles />
              <span>{storageError}</span>
            </div>
          )}

          {page === "dashboard" && (
            <DashboardPage
              salesTotal={salesTotal}
              expensesTotal={expensesTotal}
              debtsTotal={debtsTotal}
              transactions={transactions}
              onAddSale={() => setDialogKind("sale")}
              onAddExpense={() => setDialogKind("expense")}
              onNavigate={setPage}
            />
          )}

          {page === "sales" && (
            <TransactionsPage
              kind="sale"
              transactions={filteredTransactions.filter(
                (item) => item.kind === "sale",
              )}
              query={query}
              onQuery={setQuery}
              categoryFilter={categoryFilter}
              onCategory={setCategoryFilter}
              onAdd={() => setDialogKind("sale")}
            />
          )}

          {page === "expenses" && (
            <TransactionsPage
              kind="expense"
              transactions={filteredTransactions.filter(
                (item) => item.kind === "expense",
              )}
              query={query}
              onQuery={setQuery}
              categoryFilter={categoryFilter}
              onCategory={setCategoryFilter}
              onAdd={() => setDialogKind("expense")}
            />
          )}

          {page === "profit" && (
            <ProfitPage
              salesTotal={salesTotal}
              expensesTotal={expensesTotal}
            />
          )}

          {page === "debts" && (
  <DebtsPage
    debts={debts}
    onPayment={() => setDialogKind("payment")}
    onAddDebt={() => setDialogKind("debt")}
  />
)}

{page === "inventory" && (
  <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your products, prices, and stock levels.
        </p>
      </div>

      <Button onClick={() => setDialogKind("product")}>
        <Plus className="mr-2 h-4 w-4" />
        Add Product
      </Button>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border p-5">
        <p className="text-sm text-muted-foreground">
          Total Products
        </p>
        <p className="mt-2 text-2xl font-bold">
          {products.length}
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <p className="text-sm text-muted-foreground">
          Total Items in Stock
        </p>
        <p className="mt-2 text-2xl font-bold">
          {products.reduce(
            (total, product) =>
              total + product.quantityInStock,
            0,
          )}
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <p className="text-sm text-muted-foreground">
          Low-Stock Products
        </p>
        <p className="mt-2 text-2xl font-bold">
          {products.filter(
            (product) =>
              product.quantityInStock <=
              product.lowStockThreshold,
          ).length}
        </p>
      </div>
    </div>

    <div className="overflow-hidden rounded-xl border">
      <div className="border-b p-5">
        <h2 className="font-semibold">Your Products</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View your prices and monitor available stock.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 font-semibold">
            No products yet
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Add your first product to start tracking your inventory.
          </p>

          <Button
            className="mt-5"
            onClick={() => setDialogKind("product")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {products.map((product) => {
            const isLowStock =
              product.quantityInStock <=
              product.lowStockThreshold;

            return (
              <div
                key={product.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.category || "Uncategorized"}
                    {product.sku
                      ? ` · SKU: ${product.sku}`
                      : ""}
                  </p>

                  <p className="mt-2 text-sm">
                    Cost: {formatMoney(product.costPrice)}
                    {" · "}
                    Selling: {formatMoney(product.sellingPrice)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Quantity
                    </p>

                    <p className="font-semibold">
                      {product.quantityInStock}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isLowStock
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isLowStock ? "Low stock" : "In stock"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </section>
)}
          {page === "reports" && (
  <ReportsPage transactions={transactions} />
)}

        {page === "settings" && (
  <SettingsPage
    onSignOut={async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setStorageError("Could not sign out. Please try again.");
      }
    }}
  />
)}
        </main>    <footer className="workspace-footer">
      <span>
        BizStarter{" "}
        <span className="footer-separator">·</span>{" "}
        Business workspace
      </span>
      <span>Created by Ayanfe Innovation Labs Limited</span>
    </footer>
  </div>
      
      <Dialog
        open={dialogKind !== null}
        onOpenChange={(open) => {
          if (!open) setDialogKind(null);
        }}
      >
        <DialogContent className="entry-dialog">
          {dialogKind === "sale" || dialogKind === "expense" ? (
            <>
              <DialogHeader>
                <span className="dialog-icon">
                  <Plus />
                </span>
                <DialogTitle>
                  {dialogKind === "sale"
                    ? "Record a sale"
                    : "Record an expense"}
                </DialogTitle>
                <DialogDescription>
                  Your records are saved in this browser on this device. They
                  are not yet synced across devices.
                </DialogDescription>
              </DialogHeader>

              <form className="entry-form" onSubmit={addTransaction}>
                <label>
                  Description
                  <input
                    name="description"
                    placeholder={
                      dialogKind === "sale"
                        ? "e.g. Customer order"
                        : "e.g. Market supplies"
                    }
                    required
                    maxLength={80}
                  />
                </label>
              {dialogKind === "sale" && (
  <label>
    Customer name (optional)
    <input
      name="customerName"
      type="text"
      placeholder="e.g. Adebayo John"
      maxLength={80}
    />
  </label>
)}
                <label>
                  Amount (₦)
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="0"
                    required
                  />
                </label>

                {dialogKind === "expense" && (
                  <label>
                    Category
                    <select name="category" defaultValue="Inventory">
                      {expenseCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={getToday()}
                    required
                  />
                </label>

                <Button type="submit" className="form-submit">
                  Save {dialogKind === "sale" ? "sale" : "expense"}
                </Button>
              </form>
            </>
          ) : dialogKind === "payment" ? (
            <>
              <DialogHeader>
                <span className="dialog-icon">
                  <HandCoins />
                </span>
                <DialogTitle>Record a payment</DialogTitle>
                <DialogDescription>
                  Apply a payment to an existing customer balance.
                </DialogDescription>
              </DialogHeader>

              <form className="entry-form" onSubmit={recordPayment}>
                <label>
                  Customer
                  <select name="debtId" required>
                    {debts
                      .filter((debt) => debt.amountOwed > debt.amountPaid)
                      .map((debt) => (
                        <option key={debt.id} value={debt.id}>
                          {debt.name} ·{" "}
                          {formatMoney(debt.amountOwed - debt.amountPaid)}{" "}
                          remaining
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Payment received (₦)
                  <input
                    name="payment"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="0"
                    required
                  />
                </label>

                <Button type="submit" className="form-submit">
                  Record payment
                </Button>
              </form>
            </>
          ) : dialogKind === "debt" ? (
<>
<DialogHeader>
<span className="dialog-icon">
<Plus />
</span>
<DialogTitle>Add customer debt</DialogTitle>
<DialogDescription>
Record how much a customer owes your business.
</DialogDescription>
</DialogHeader>

          <form className="entry-form" onSubmit={addDebt}>
            <label>
              Customer name
              <input
                name="name"
                type="text"
                placeholder="Enter customer name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Total amount owed (₦)
              <input
                name="amountOwed"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                required
              />
            </label>

            <label>
              Amount already paid (₦)
              <input
                name="amountPaid"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                required
              />
            </label>

            <label>
              Due date (optional)
              <input
                name="dueDate"
                type="date"
              />
            </label>

            <Button type="submit" className="form-submit">
              Save customer debt
            </Button>
          </form>
        </>
            ) : dialogKind === "product" ? (
        <>
          <DialogHeader>
            <span className="dialog-icon">
              <ClipboardList />
            </span>
            <DialogTitle>Add a product</DialogTitle>
            <DialogDescription>
              Enter the product details and current stock.
            </DialogDescription>
          </DialogHeader>

          <form className="entry-form" onSubmit={addProduct}>
            <label>
              Product name
              <input
                name="name"
                type="text"
                placeholder="e.g. Rice"
                maxLength={100}
                required
              />
            </label>

            <label>
              Product code / SKU (optional)
              <input
                name="sku"
                type="text"
                placeholder="e.g. RICE001"
                maxLength={50}
              />
            </label>

            <label>
              Category (optional)
              <input
                name="category"
                type="text"
                placeholder="e.g. Food"
                maxLength={50}
              />
            </label>

            <label>
              Cost price per item (₦)
              <input
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
            </label>

            <label>
              Selling price per item (₦)
              <input
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
            </label>

            <label>
              Quantity in stock
              <input
                name="quantityInStock"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                required
              />
            </label>

            <label>
              Low-stock warning at quantity
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                defaultValue="5"
                required
              />
            </label>

            <Button type="submit" className="form-submit">
              Save product
            </Button>
          </form>
        </>
      ) : null}
        </DialogContent>
      </Dialog>  <Dialog
    open={receiptTransaction !== null}
    onOpenChange={(open) => {
      if (!open) setReceiptTransaction(null);
    }}
  >
    <DialogContent className="receipt-dialog">
      <div className="receipt-paper" id="bizstarter-print-receipt">
        <div className="receipt-brand">
          <span className="receipt-brand-mark">
            <BrandMark />
          </span>
          <span>BizStarter</span>
        </div>

        <p className="receipt-kicker">SALES RECEIPT</p>
        <h2>Thank you for your purchase</h2>
        <p className="receipt-business">My business</p>

        <div className="receipt-number">
          <span>Receipt number</span>
          <strong>
            BS-{receiptTransaction?.id.slice(-8).toUpperCase()}
          </strong>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-row">
          <span>Date</span>
          <strong>
            {receiptTransaction
              ? formatDate(receiptTransaction.date)
              : ""}
          </strong>
        </div>

        <div className="receipt-row">
          <span>Description</span>
          <strong className="receipt-description">
            {receiptTransaction?.description}
          </strong>
        </div>

        <div className="receipt-row">
          <span>Status</span>
          <strong>Sale recorded</strong>
        </div>
        <div className="receipt-row">
  <span>Customer</span>
  <strong>
    {receiptTransaction?.customerName?.trim() || "Walk-in customer"}
  </strong>
</div>
        <div className="receipt-total">
          <span>Total</span>
          <strong>
            {formatMoney(receiptTransaction?.amount ?? 0)}
          </strong>
        </div>

        <p className="receipt-thanks">
          Thank you for supporting our business.
        </p>

        <p className="receipt-powered">
          Created with BizStarter · Ayanfe Innovation Labs Limited
        </p>
      </div>

      <div className="receipt-actions">
        <Button
          variant="outline"
          onClick={() => setReceiptTransaction(null)}
        >
          Close
        </Button>

        <Button
  onClick={() => {
    if (receiptTransaction) {
      downloadReceiptPdf(receiptTransaction);
    }
  }}
>
  <Download /> Download Receipt PDF
</Button>
      </div>
    </DialogContent>
  </Dialog>
</div>

);
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
    }

function DashboardPreview({
  salesTotal,
  expensesTotal,
}: {
  salesTotal: number;
  expensesTotal: number;
}) {
  return (
    <div className="dashboard-preview">
      <div className="preview-top">
        <div className="preview-brand">
          <BrandMark />
          <span>BizStarter</span>
        </div>
        <span className="preview-window-dots">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="preview-greeting">
        <span>BUSINESS OVERVIEW</span>
        <strong>Your business, at a glance</strong>
      </div>

      <div className="preview-metrics">
        <PreviewMetric
          label="Total sales"
          value={formatMoney(salesTotal)}
          icon={<ArrowUpRight />}
          variant="green"
        />
        <PreviewMetric
          label="Expenses"
          value={formatMoney(expensesTotal)}
          icon={<ArrowDownLeft />}
          variant="orange"
        />
      </div>

      <div className="preview-chart-wrap">
        <div className="preview-chart-heading">
          <span>Sales overview</span>
          <span>
            Illustrative chart <ChevronDown />
          </span>
        </div>
        <MiniChart compact />
      </div>

      <div className="preview-latest">
        <span>Example transaction preview</span>
        <span className="preview-order">
          <span className="order-dot" /> Example cake order{" "}
          <strong>+₦185,000</strong>
        </span>
      </div>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  variant: string;
}) {
  return (
    <div className="preview-metric">
      <span className={`metric-icon ${variant}`}>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Illustrative preview</small>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function DashboardPage({
  salesTotal,
  expensesTotal,
  debtsTotal,
  transactions,
  onAddSale,
  onAddExpense,
  onNavigate,
}: {
  salesTotal: number;
  expensesTotal: number;
  debtsTotal: number;
  transactions: Transaction[];
  onAddSale: () => void;
  onAddExpense: () => void;
  onNavigate: (page: WorkspacePage) => void;
}) {
  const recent = transactions.slice(0, 5);
  const profit = salesTotal - expensesTotal;

  const metrics = [
    {
      title: "Total sales",
      amount: salesTotal,
      icon: ShoppingBag,
      color: "bg-emerald-100 text-emerald-800",
      detail: "Money received from sales",
    },
    {
      title: "Total expenses",
      amount: expensesTotal,
      icon: Wallet,
      color: "bg-orange-100 text-orange-800",
      detail: "Recorded business costs",
    },
    {
      title: "Estimated profit",
      amount: profit,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-800",
      detail: "Sales minus expenses",
    },
    {
      title: "Customer debts",
      amount: debtsTotal,
      icon: HandCoins,
      color: "bg-amber-100 text-amber-800",
      detail: "Outstanding balances",
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      <section className="overflow-hidden rounded-3xl bg-[#075E45] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-50">
              <Sparkles size={15} />
              YOUR BUSINESS AT A GLANCE
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Welcome to your business
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50 sm:text-base">
              Keep track of your money, understand your performance, and make
              confident decisions as your business grows.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              onClick={onAddExpense}
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Plus size={17} />
              Add expense
            </Button>

            <Button
              onClick={onAddSale}
              className="bg-[#D6AD55] text-[#172B3A] hover:bg-[#e5c477]"
            >
              <Plus size={17} />
              Record sale
            </Button>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-emerald-50 sm:text-sm">
          <ShieldCheck size={17} />
          Your business workspace
          <span className="text-white/50">•</span>
          Sales, expenses, debts and inventory
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#172B3A] sm:text-xl">
              Financial overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A summary of your recorded business activity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    {metric.title}
                  </span>

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.color}`}
                  >
                    <Icon size={21} />
                  </span>
                </div>

                <p className="mt-5 break-words text-2xl font-bold tracking-tight text-[#172B3A] sm:text-3xl">
                  {formatMoney(metric.amount)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {metric.detail}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#172B3A] sm:text-xl">
            Manage your business
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open a workspace or complete a common task.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={onAddSale}
            className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShoppingBag size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-[#172B3A]">
                Record a sale
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Add money received
              </span>
            </span>
            <ArrowRight size={18} className="text-emerald-700" />
          </button>

          <button
            type="button"
            onClick={onAddExpense}
            className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
              <Wallet size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-[#172B3A]">
                Record an expense
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Track business spending
              </span>
            </span>
            <ArrowRight size={18} className="text-emerald-700" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate("debts")}
            className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <HandCoins size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-[#172B3A]">
                Customer debts
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Review unpaid balances
              </span>
            </span>
            <ArrowRight size={18} className="text-emerald-700" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate("inventory")}
            className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <ClipboardList size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-[#172B3A]">
                Inventory
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                Manage products and stock
              </span>
            </span>
            <ArrowRight size={18} className="text-emerald-700" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#172B3A]">
                Sales overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visual preview of weekly sales activity.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Preview
            </span>
          </div>

          <MiniChart />
          <p className="mt-3 text-xs leading-5 text-slate-500">
            The chart is illustrative and is not yet calculated from your
            individual daily sales.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#172B3A]">
              Recent transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest recorded sales and expenses.
            </p>
          </div>

          {recent.length > 0 ? (
            <div className="space-y-1">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      item.kind === "sale"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item.kind === "sale" ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#172B3A]">
                      {item.description}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {item.category} · {formatDate(item.date)}
                    </span>
                  </span>

                  <strong
                    className={`shrink-0 text-sm font-bold ${
                      item.kind === "sale"
                        ? "text-emerald-700"
                        : "text-orange-700"
                    }`}
                  >
                    {item.kind === "sale" ? "+" : "−"}
                    {formatMoney(item.amount)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[#F8FAF7] px-4 py-8 text-center">
              <Receipt className="mx-auto text-slate-400" size={30} />
              <p className="mt-3 font-semibold text-[#172B3A]">
                No transactions yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your sales and expenses will appear here when recorded.
              </p>

              <Button onClick={onAddSale} className="mt-4">
                <Plus size={17} />
                Record your first sale
              </Button>
            </div>
          )}

          {recent.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("sales")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-600"
            >
              View transactions
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">
        BizStarter by Ayanfe Innovation Labs Limited
      </p>
    </div>
  );
}      

function MetricCard({
  title,
  amount,
  icon,
  detail,
  color,
}: {
  title: string;
  amount: number;
  icon: ReactNode;
  detail: string;
  color: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span>{title}</span>
        <span className={`metric-card-icon ${color}`}>{icon}</span>
      </div>
      <strong className="metric-value">{formatMoney(amount)}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  );
}

function MiniChart({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mini-chart ${compact ? "compact" : ""}`}
      aria-label="Illustrative sales chart, Monday to Sunday"
    >
      <div className="chart-scale">
        <span>₦200k</span>
        <span>₦150k</span>
        <span>₦100k</span>
        <span>₦50k</span>
      </div>

      <div className="chart-plot">
        <div className="chart-guides">
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="chart-columns">
          {chartData.map((item, index) => (
            <div className="chart-day" key={item.label}>
              <div className="chart-bar-track">
                <span className={`chart-bar bar-${index + 1}`} />
              </div>
              <span className="chart-day-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon={<FileText />}
        title="No transactions yet"
        detail="Your sales and expenses will appear here after you record them."
      />
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={`transaction-icon ${item.kind}`}>
                  {item.kind === "sale" ? (
                    <ArrowDownLeft />
                  ) : (
                    <ArrowUpRight />
                  )}
                </span>
                <strong>{item.description}</strong>
              </td>
              <td>{item.category}</td>
              <td>{formatDate(item.date)}</td>
              <td
                className={
                  item.kind === "sale" ? "amount-positive" : "amount-negative"
                }
              >
                {item.kind === "sale" ? "+" : "−"}
                {formatMoney(item.amount)}
              </td>
              <td>
                <span className={`status-pill ${item.kind}`}>
                  {item.kind === "sale" ? "Sale" : "Expense"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsPage({
  kind,
  transactions,
  query,
  onQuery,
  categoryFilter,
  onCategory,
  onAdd,
}: {
  kind: TransactionKind;
  transactions: Transaction[];
  query: string;
  onQuery: (value: string) => void;
  categoryFilter: string;
  onCategory: (value: string) => void;
  onAdd: () => void;
}) {
  const isSale = kind === "sale";

  return (
    <>
      <PageHeading
        eyebrow={isSale ? "MONEY COMING IN" : "MONEY GOING OUT"}
        title={isSale ? "Sales" : "Expenses"}
        description={
          isSale
            ? "Review and manage your recorded sales."
            : "Review and manage your recorded business expenses."
        }
        action={
          <Button onClick={onAdd}>
            <Plus /> Add {isSale ? "sale" : "expense"}
          </Button>
        }
      />

      <div className="sample-notice">
        <Sparkles />
        <span>
          <strong>Data storage:</strong> These records are saved in this browser
          on this device and are not yet synced across devices.
        </span>
      </div>

      <div className="content-panel listing-panel">
        <div className="listing-toolbar">
          <div className="search-control">
            <Search />
            <input
              aria-label="Search transactions"
              placeholder={`Search ${isSale ? "sales" : "expenses"}`}
              value={query}
              onChange={(event) => onQuery(event.target.value)}
            />
          </div>

          <label className="category-filter">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => onCategory(event.target.value)}
            >
              <option>All categories</option>
              {(isSale ? ["Product sales"] : expenseCategories).map(
                (category) => (
                  <option key={category}>{category}</option>
                ),
              )}
            </select>
            <ChevronDown />
          </label>

          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
        </div>

        {transactions.length ? (
          <TransactionTable transactions={transactions} />
        ) : (
          <EmptyState
            icon={isSale ? <ShoppingBag /> : <Wallet />}
            title={
              query || categoryFilter !== "All categories"
                ? "No matching records"
                : `No ${isSale ? "sales" : "expenses"} yet`
            }
            detail={
              query || categoryFilter !== "All categories"
                ? "Try a different search or category."
                : `Add your first ${isSale ? "sale" : "expense"} to see it listed here.`
            }
          />
        )}
      </div>
    </>
  );
}

function ProfitPage({
  salesTotal,
  expensesTotal,
}: {
  salesTotal: number;
  expensesTotal: number;
}) {
  const profit = salesTotal - expensesTotal;

  return (
        <div className="page-content">
      <PageHeading
        eyebrow="A SIMPLE SNAPSHOT"
        title="Profit overview"
        description="Understand the difference between recorded sales and operating expenses."
      />

      <div className="sample-notice">
        <Sparkles />
        <span>
          <strong>Estimated only:</strong> This is a basic calculation, not a
          complete accounting of business profit.
        </span>
      </div>

      <div className="profit-layout">
        <div className="content-panel profit-summary">
          <span className="profit-summary-label">Estimated profit</span>
          <strong>{formatMoney(profit)}</strong>
          <span className="estimate-tag">
            <TrendingUp /> Sales less recorded expenses
          </span>
          <div className="profit-divider" />

          <div className="profit-line">
            <span>
              <i className="legend-dot sales-dot" /> Total sales
            </span>
            <strong>{formatMoney(salesTotal)}</strong>
          </div>

          <div className="profit-line">
            <span>
              <i className="legend-dot expenses-dot" /> Total recorded expenses
            </span>
            <strong>− {formatMoney(expensesTotal)}</strong>
          </div>
        </div>

        <aside className="profit-note">
          <span className="note-bulb">i</span>
          <div>
            <h2>A useful estimate, not the whole picture.</h2>
            <p>
              This figure subtracts recorded operating expenses from sales. A
              complete business profit calculation may also need cost of goods
              sold, inventory changes, taxes, loan repayments, and other costs.
            </p>
            <p>
              Use it as a simple overview—not as a replacement for accounting
              advice or formal financial statements.
            </p>
          </div>
        </aside>
      </div>

      <div className="content-panel profit-breakdown">
        <div className="panel-heading">
          <div>
            <h2>How the estimate adds up</h2>
            <p>Based on your recorded sales and expenses</p>
          </div>
        </div>

        <div className="breakdown-row">
          <span>Sales recorded</span>
          <strong>{formatMoney(salesTotal)}</strong>
        </div>

        <div className="breakdown-row">
          <span>Expenses recorded</span>
          <strong>− {formatMoney(expensesTotal)}</strong>
        </div>

                <div className="breakdown-row total">
          <span>Estimated profit</span>
          <strong>{formatMoney(profit)}</strong>
        </div>
      </div>
    </div>
  );
}

function DebtsPage({
  debts,
  onPayment,
  onAddDebt,
}: {
  debts: CustomerDebt[];
  onPayment: () => void;
  onAddDebt: () => void;
}) {
  const outstandingDebts = debts.filter(
    (debt) => debt.amountOwed > debt.amountPaid,
  );

  const totalOutstanding = outstandingDebts.reduce(
    (total, debt) => total + debt.amountOwed - debt.amountPaid,
    0,
  );

  const totalPaid = debts.reduce(
    (total, debt) => total + debt.amountPaid,
    0,
  );

  return (
    <div className="page-content">
      <div className="content-panel">
        <div className="panel-heading">
          <div>
            <h2>Customer debts</h2>
            <p>
              Track money customers owe your business and payments received.
            </p>
          </div>
          <button
  className="primary-button"
  type="button"
  onClick={onAddDebt}
>
  <Plus size={17} />
  Add customer debt
</button>
          <button
            className="primary-button"
            type="button"
            onClick={onPayment}
            disabled={outstandingDebts.length === 0}
          >
            <HandCoins size={17} />
            Record payment
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span>Outstanding balance</span>
            <h3>{formatMoney(totalOutstanding)}</h3>
            <p>{outstandingDebts.length} unpaid account(s)</p>
          </div>

          <div className="metric-card">
            <span>Total payments received</span>
            <h3>{formatMoney(totalPaid)}</h3>
            <p>Payments recorded against debts</p>
          </div>

          <div className="metric-card">
            <span>Total customer accounts</span>
            <h3>{debts.length}</h3>
            <p>Recorded debt accounts</p>
          </div>
        </div>

        {debts.length === 0 ? (
          <div className="empty-state">
            <HandCoins size={30} />
            <h3>No customer debts yet</h3>
            <p>
              Customer debts will appear here when you add debt-recording
              functionality.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount owed</th>
                  <th>Amount paid</th>
                  <th>Balance remaining</th>
                  <th>Due date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {debts.map((debt) => {
                  const remaining = Math.max(
                    0,
                    debt.amountOwed - debt.amountPaid,
                  );

                  return (
                    <tr key={debt.id}>
                      <td>
                        <strong>{debt.name}</strong>
                      </td>

                      <td>{formatMoney(debt.amountOwed)}</td>

                      <td>{formatMoney(debt.amountPaid)}</td>

                      <td>
                        <strong>{formatMoney(remaining)}</strong>
                      </td>

                      <td>
                        {debt.dueDate
                          ? formatDate(debt.dueDate)
                          : "Not set"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            remaining === 0
                              ? "status-paid"
                              : "status-pending"
                          }`}
                        >
                          {remaining === 0 ? "Paid" : "Outstanding"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
      
function ReportsPage({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [period, setPeriod] = useState("month");

  const now = new Date();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (Number.isNaN(transactionDate.getTime())) return false;

    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      return transactionDate >= startOfWeek && transactionDate <= now;
    }

    if (period === "year") {
      return transactionDate.getFullYear() === now.getFullYear();
    }

    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  });

  const sales = filteredTransactions
    .filter((transaction) => transaction.kind === "sale")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = filteredTransactions
    .filter((transaction) => transaction.kind === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const profit = sales - expenses;

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="BUSINESS PERFORMANCE"
        title="Reports"
        description="Review your business figures using the records you have entered."
        action={
          <label className="select-field">
            <span className="sr-only">Report period</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Report period"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Current month</option>
              <option value="year">Current year</option>
            </select>
          </label>
        }
      />

      <div className="notice-banner">
        <Info size={18} />
        <span>
          <strong>Report information</strong> — figures reflect the sales
          and expenses you have recorded. Any illustrative chart data is
          provided for visual guidance and does not represent your actual
          transactions.
        </span>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Recorded sales"
          value={formatMoney(sales)}
          detail="Based on entries for the selected period"
          icon={<TrendingUp size={19} />}
          tone="green"
        />

        <MetricCard
          label="Recorded expenses"
          value={formatMoney(expenses)}
          detail="Based on entries for the selected period"
          icon={<Receipt size={19} />}
          tone="amber"
        />

        <MetricCard
          label="Estimated profit"
          value={formatMoney(profit)}
          detail="Sales minus recorded expenses"
          icon={<Wallet size={19} />}
          tone={profit >= 0 ? "blue" : "amber"}
        />
      </div>

      <div className="content-panel">
        <div className="panel-heading">
          <div>
            <h2>Performance summary</h2>
            <p>Based on entries in your business workspace</p>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={24} />}
            title="No records for this period"
            description="Record sales and expenses to build a report for the selected period."
          />
        ) : (
          <div className="report-summary">
            <div className="report-summary-row">
              <span>Number of recorded transactions</span>
              <strong>{filteredTransactions.length}</strong>
            </div>

            <div className="report-summary-row">
              <span>Total recorded sales</span>
              <strong>{formatMoney(sales)}</strong>
            </div>

            <div className="report-summary-row">
              <span>Total recorded expenses</span>
              <strong>{formatMoney(expenses)}</strong>
            </div>

            <div className="report-summary-row total">
              <span>Estimated profit</span>
              <strong>{formatMoney(profit)}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="content-panel">
        <div className="panel-heading">
          <div>
            <h2>Recorded entries</h2>
            <p>Transactions included in this report.</p>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title="No recorded entries"
            description="Your transactions for this period will appear here."
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {[...filteredTransactions]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() -
                      new Date(a.date).getTime(),
                  )
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <strong>{transaction.description}</strong>
                      </td>
                      <td>{transaction.category}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            transaction.kind === "sale"
                              ? "status-paid"
                              : "status-pending"
                          }`}
                        >
                          {transaction.kind === "sale" ? "Sale" : "Expense"}
                        </span>
                      </td>
                      <td>{formatMoney(transaction.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage({
  onSignOut,
}: {
  onSignOut: () => Promise<void>;
}) {
  const [profile, setProfile] = useState<BusinessProfile>(
    getBusinessProfile,
  );

  const [savedMessage, setSavedMessage] = useState("");

  function updateProfile(
    field: keyof BusinessProfile,
    value: string,
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSavedMessage("");
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      localStorage.setItem(
        BUSINESS_PROFILE_STORAGE_KEY,
        JSON.stringify(profile),
      );

      setSavedMessage("Business profile saved successfully.");
    } catch {
      setSavedMessage(
        "Could not save your profile. Please check your browser storage.",
      );
    }
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="PREFERENCES"
        title="Settings"
        description="Manage your business identity and workspace."
      />

      <div className="content-panel" style={{ padding: 20 }}>
        <div className="panel-heading">
          <div>
            <h2>Business Profile</h2>
            <p>
              These details can identify your business on your sales
              receipts.
            </p>
          </div>
          <Building2 size={24} />
        </div>

        <form onSubmit={saveProfile}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <label style={{ display: "grid", gap: 7 }}>
              <span>Business name *</span>
              <input
                type="text"
                required
                maxLength={100}
                value={profile.businessName}
                onChange={(event) =>
                  updateProfile("businessName", event.target.value)
                }
                placeholder="e.g. Ayanfe Fashion Store"
                style={{
                  width: "100%",
                  minHeight: 42,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 7 }}>
              <span>Business phone number</span>
              <input
                type="tel"
                maxLength={30}
                value={profile.phone}
                onChange={(event) =>
                  updateProfile("phone", event.target.value)
                }
                placeholder="e.g. 08012345678"
                style={{
                  width: "100%",
                  minHeight: 42,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 7 }}>
              <span>Business email</span>
              <input
                type="email"
                maxLength={150}
                value={profile.email}
                onChange={(event) =>
                  updateProfile("email", event.target.value)
                }
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  minHeight: 42,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 7 }}>
              <span>Business address</span>
              <textarea
                maxLength={250}
                rows={3}
                value={profile.address}
                onChange={(event) =>
                  updateProfile("address", event.target.value)
                }
                placeholder="Enter your business address"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  resize: "vertical",
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button type="submit">
              Save Business Profile
            </Button>
          </div>

          {savedMessage && (
            <p
              role="status"
              style={{
                marginTop: 12,
                color: savedMessage.startsWith("Could not")
                  ? "var(--destructive)"
                  : "var(--primary)",
              }}
            >
              {savedMessage}
            </p>
          )}
        </form>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => void onSignOut()}
        >
          Sign Out
        </Button>
      </div>

      <div className="content-panel settings-panel">
        <div className="settings-item">
          <div className="settings-icon">
            <Database size={20} />
          </div>

          <div className="settings-copy">
            <h3>Local storage</h3>
            <p>
              Your business profile is saved in this browser on this
              device. It is not yet synchronised across devices.
            </p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <ShieldCheck size={20} />
          </div>

          <div className="settings-copy">
            <h3>Data and privacy</h3>
            <p>
              Avoid entering passwords, bank card details or other
              sensitive information into business notes.
            </p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <Info size={20} />
          </div>

          <div className="settings-copy">
            <h3>About BizStarter</h3>
            <p>
              BizStarter is a business management project created by
              Ayanfe Innovation Labs Limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
   
