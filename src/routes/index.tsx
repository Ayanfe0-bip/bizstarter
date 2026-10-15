import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "@/features/bizstarter/AuthScreen";
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

  function AuthenticatedIndex() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

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
    return <AuthScreen onSuccess={() => {
      void supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });
    }} />;
  }
    
return <Index key={session.user.id} userId={session.user.id} />;
}
function Index({ userId }: { userId: string }) {
const [page, setPage] = useState<WorkspacePage | "home">("home");
  const transactionsStorageKey = `${TRANSACTIONS_STORAGE_KEY_PREFIX}-${userId}`;
  const debtsStorageKey = `${DEBTS_STORAGE_KEY_PREFIX}-${userId}`;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
const [debts, setDebts] = useState<CustomerDebt[]>([]);
const [products, setProducts] = useState<Product[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
const [cloudReady, setCloudReady] = useState(false);
const [storageError, setStorageError] = useState("");

  const [dialogKind, setDialogKind] = useState<
  TransactionKind | "payment" | "debt" | null
>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");

      // Restore both older records and this user's records.
  useEffect(() => {
    try {
      const savedTransactions = window.localStorage.getItem(
        transactionsStorageKey,
      );
      const savedDebts = window.localStorage.getItem(debtsStorageKey);

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
    } catch (error) {
      console.error("Could not restore BizStarter records:", error);
      setStorageError(
        "Some records could not be restored. Your saved data has not been intentionally deleted.",
      );
    } finally {
      setStorageLoaded(true);
    }
  }, [transactionsStorageKey, debtsStorageKey]);

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
    transactionsStorageKey,
    debtsStorageKey,
  ]);
  // Load cloud records and safely merge them with this user's local records.
  useEffect(() => {
    if (!storageLoaded) return;

    let cancelled = false;

    async function syncRecords() {
      try {
        const [transactionsResult, debtsResult] = await Promise.all([
          supabase
            .from("bizstarter_transactions")
            .select("*")
            .eq("user_id", userId),

          supabase
            .from("bizstarter_customer_debts")
            .select("*")
            .eq("user_id", userId),
        ]);

        if (transactionsResult.error) throw transactionsResult.error;
        if (debtsResult.error) throw debtsResult.error;

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
            amount: Number(row.amount),
            category: row.category,
            date: row.transaction_date,
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

        if (cancelled) return;

        setTransactions(mergedTransactions);
        setDebts(mergedDebts);
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
  }, [cloudReady, transactions, debts, userId]);
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
  amount,
  category,
  date,
};

setTransactions((current) => [newTransaction, ...current]);
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
    <div>
      <h1 className="text-2xl font-bold">Inventory</h1>
      <p className="text-muted-foreground">
        Manage your products, prices, and stock levels.
      </p>
    </div>

    <div className="rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-3">
          <ClipboardList className="h-6 w-6" />
        </div>

        <div>
          <h2 className="font-semibold">Product inventory</h2>
          <p className="text-sm text-muted-foreground">
            Your inventory workspace is ready for product management.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Next, we'll connect this page to your Supabase products table so you
        can add products, update prices, and track stock.
      </p>
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
      ) : null}
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

  return (
    <>
      <PageHeading
        eyebrow="BUSINESS OVERVIEW"
        title="Welcome to your business"
        description="Here’s an overview of your recorded business activity."
        action={
          <div className="heading-actions">
            <Button variant="outline" onClick={onAddExpense}>
              <Plus /> Add expense
            </Button>
            <Button onClick={onAddSale}>
              <Plus /> Add sale
            </Button>
          </div>
        }
      />

                  <div className="sample-notice">
        <Sparkles />
        <span>
          <strong>Data storage:</strong>{" "}
          Your business records are being checked for cloud synchronization.
        </span>
      </div>

      <section className="metric-grid" aria-label="Business overview">
        <MetricCard
          title="Total sales"
          amount={salesTotal}
          icon={<ShoppingBag />}
          detail="Across your recorded sales"
          color="green"
        />
        <MetricCard
          title="Total expenses"
          amount={expensesTotal}
          icon={<Wallet />}
          detail="Across your recorded expenses"
          color="orange"
        />
        <MetricCard
          title="Estimated profit"
          amount={salesTotal - expensesTotal}
          icon={<TrendingUp />}
          detail="Sales less recorded expenses"
          color="blue"
        />
        <MetricCard
          title="Customer debts"
          amount={debtsTotal}
          icon={<HandCoins />}
          detail="Outstanding customer balances"
          color="rose"
        />
      </section>

      <section className="dashboard-grid">
        <div className="content-panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Sales overview</h2>
              <p>
                Illustrative chart; recorded sales totals are shown above.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Chart preview <ChevronDown />
            </Button>
          </div>
          <MiniChart />
        </div>

        <div className="content-panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Keep your records up to date</p>
            </div>
          </div>

          <button className="quick-action" onClick={onAddSale}>
            <span className="quick-icon mint">
              <ShoppingBag />
            </span>
            <span>
              <strong>Record a sale</strong>
              <small>Add a completed order</small>
            </span>
            <ArrowRight />
          </button>

          <button className="quick-action" onClick={onAddExpense}>
            <span className="quick-icon peach">
              <Wallet />
            </span>
            <span>
              <strong>Record an expense</strong>
              <small>Log a business cost</small>
            </span>
            <ArrowRight />
          </button>

          <button className="quick-action" onClick={() => onNavigate("debts")}>
            <span className="quick-icon lilac">
              <HandCoins />
            </span>
            <span>
              <strong>Review customer debts</strong>
              <small>Check balances and payments</small>
            </span>
            <ArrowRight />
          </button>
        </div>
      </section>

      <section className="content-panel transaction-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent transactions</h2>
            <p>Your latest recorded business activity</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("sales")}
          >
            See all <ArrowRight />
          </Button>
        </div>

        <TransactionTable transactions={recent} />
      </section>
    </>
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
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="PREFERENCES"
        title="Settings"
        description="Review your workspace information and how your records are stored."
      />
        <div className="mt-6">
          <button
            type="button"
            className="primary-button"
            onClick={() => void onSignOut()}
          >
            Sign Out
          </button>
        </div>
      <div className="content-panel settings-panel">
        <div className="settings-item">
          <div className="settings-icon">
            <Building2 size={20} />
          </div>

          <div className="settings-copy">
            <h3>Business workspace</h3>
            <p>
              Use BizStarter to organise your sales, expenses, customer
              balances and business reports.
            </p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <Database size={20} />
          </div>

          <div className="settings-copy">
            <h3>Local storage</h3>
            <p>
              Your records are saved in this browser on this device.
              Clearing browser data or changing devices may make your
              records unavailable. Cloud backup and cross-device syncing
              are not available yet.
            </p>
          </div>

          <span className="settings-status">On this device</span>
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
   
