import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
  return (
    <main className="min-h-screen bg-[#F8FAF7] px-5 py-10 text-[#172B3A] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075E45]"
        >
          <ArrowLeft size={16} />
          Back to BizStarter
        </Link>

        <header className="mt-8 rounded-3xl bg-[#075E45] p-7 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#D6AD55]">
            We're here to help
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            BizStarter Support
          </h1>
          <p className="mt-3 leading-7 text-green-100">
            Have a question, found a problem, or want to suggest an improvement?
            Contact our support team by email.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#075E45]">
            <Mail size={24} />
          </div>

          <h2 className="mt-5 text-2xl font-black">Email support</h2>

          <p className="mt-3 leading-7 text-gray-600">
            Send us a message describing your question or problem. If you
            encounter a technical issue, tell us which page you were using
            and what happened. Never email us your password or verification
            codes.
          </p>

          <a
            href="mailto:bizstarter.support@gmail.com?subject=BizStarter%20Support%20Request"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#075E45] px-5 py-4 font-bold text-white sm:w-auto"
          >
            <MessageCircle size={18} />
            Contact Support
          </a>

          <p className="mt-3 break-all text-sm text-gray-500">
            bizstarter.support@gmail.com
          </p>
        </section>

        <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-1 shrink-0 text-[#075E45]"
              size={22}
            />
            <div>
              <h2 className="font-extrabold">Protect your account</h2>
              <p className="mt-2 leading-7 text-gray-600">
                Support will never need your password or one-time verification
                code. Avoid sending confidential customer or financial
                information in support messages.
              </p>
            </div>
          </div>
        </section>

        <nav className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[#075E45]">
          <Link to="/terms" className="underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="/privacy" className="underline underline-offset-4">
            Privacy Notice
          </Link>
        </nav>

        <footer className="py-8 text-center text-sm text-gray-500">
          BizStarter · Ayanfe Innovation Labs Limited
        </footer>
      </div>
    </main>
  );
      }
