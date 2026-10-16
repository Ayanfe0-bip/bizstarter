import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  HandCoins,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";

type LandingPageProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

const features = [
  {
    icon: ShoppingBag,
    title: "Sales Tracking",
    description:
      "Record your sales and keep your daily business activity organised.",
  },
  {
    icon: Wallet,
    title: "Expense Management",
    description:
      "Track your expenses and understand where your money goes.",
  },
  {
    icon: HandCoins,
    title: "Customer Debts",
    description:
      "Keep customer balances and payments organised in one place.",
  },
  {
    icon: ClipboardList,
    title: "Inventory Management",
    description:
      "Manage your products, monitor stock and identify low-stock items.",
  },
  {
    icon: BarChart3,
    title: "Business Reports",
    description:
      "Review sales, expenses and estimated profit more easily.",
  },
  {
    icon: ShieldCheck,
    title: "Your Business Workspace",
    description:
      "Sign in to manage your business records in your account.",
  },
];

export default function LandingPage({
  onGetStarted,
  onLogin,
}: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#F8FAF7] text-[#172B3A]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#075E45] text-2xl font-black text-white">
            B
          </div>

          <div>
            <h1 className="text-xl font-black">BizStarter</h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              By Ayanfe Innovation Labs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogin}
            className="rounded-xl px-3 py-2 font-semibold text-[#075E45]"
          >
            Log in
          </button>

          <button
            onClick={onGetStarted}
            className="rounded-xl bg-[#075E45] px-4 py-3 text-sm font-bold text-white"
          >
            Get started
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-[#075E45]">
            Business management made simpler
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Spend less time guessing.
            <span className="mt-2 block text-[#12A878]">
              Grow with confidence.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Manage your sales, expenses, customer debts and inventory in one
            simple workspace. Understand your business better and make more
            informed decisions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#075E45] px-6 py-4 font-bold text-white transition hover:bg-[#064B38]"
            >
              Create your account
              <ArrowRight size={19} />
            </button>

            <button
              onClick={onLogin}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-4 font-bold text-[#075E45]"
            >
              I already have an account
            </button>
          </div>

          <div className="mt-7 space-y-3 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#12A878]" />
              Keep business records organised.
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#12A878]" />
              Monitor products and customer debts.
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#12A878]" />
              Understand sales, expenses and profit.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-2xl shadow-green-900/10 sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-sm text-gray-500">Your workspace</p>
              <h3 className="mt-1 text-2xl font-black">
                Business overview
              </h3>
            </div>

            <div className="rounded-2xl bg-green-50 p-3 text-[#075E45]">
              <BarChart3 size={26} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-green-50 p-4">
              <ShoppingBag className="text-[#075E45]" size={24} />
              <h4 className="mt-4 font-bold">Sales</h4>
              <p className="mt-1 text-sm text-gray-500">
                Record transactions
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <Wallet className="text-amber-700" size={24} />
              <h4 className="mt-4 font-bold">Expenses</h4>
              <p className="mt-1 text-sm text-gray-500">
                Monitor spending
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <HandCoins className="text-[#12A878]" size={24} />
              <h4 className="mt-4 font-bold">Customer debts</h4>
              <p className="mt-1 text-sm text-gray-500">
                Follow customer balances
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <ClipboardList className="text-[#12A878]" size={24} />
              <h4 className="mt-4 font-bold">Inventory</h4>
              <p className="mt-1 text-sm text-gray-500">
                Keep track of stock
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#075E45] p-6 text-white">
            <p className="text-sm text-green-100">
              A clearer view of your business
            </p>

            <h4 className="mt-2 text-xl font-black">
              Everything in one place.
            </h4>

            <div className="mt-5 h-2 rounded-full bg-white/20">
              <div className="h-2 w-3/4 rounded-full bg-[#D6AD55]" />
            </div>

            <p className="mt-3 text-xs text-green-100">
              Illustrative preview. Your own figures will come from your
              business records.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold uppercase tracking-widest text-[#12A878]">
              Built for everyday business
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              The tools you need, together.
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Whether you sell products or provide services, BizStarter helps
              you keep your important business records organised.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-100 bg-[#FCFDFC] p-6 transition hover:border-green-200 hover:shadow-lg"
              >
                <div className="inline-flex rounded-2xl bg-green-50 p-3 text-[#075E45]">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[2rem] bg-[#075E45] p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold uppercase tracking-widest text-[#D6AD55]">
              Start today
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Build better business habits.
            </h2>

            <p className="mt-3 leading-7 text-green-100">
              Create your account and start organising your business.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-bold text-[#075E45]"
          >
            Get started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="text-[#075E45]">BizStarter</strong> by
            Ayanfe Innovation Labs Limited
          </p>

          <p>Simple tools for clearer business decisions.</p>
        </div>
      </footer>
    </main>
  );
}
