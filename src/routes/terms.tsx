import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, FileText, Mail } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
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
          <FileText size={30} className="text-[#D6AD55]" />
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-green-100">
            Last updated: October 19, 2026
          </p>
          <p className="mt-4 leading-7 text-green-50">
            Welcome to BizStarter. These terms explain the basic conditions
            for using our business-management service.
          </p>
        </header>

        <article className="mt-6 space-y-6 rounded-3xl border border-gray-100 bg-white p-6 leading-7 shadow-sm sm:p-9">
          <section>
            <h2 className="text-xl font-extrabold">1. About BizStarter</h2>
            <p className="mt-2 text-gray-600">
              BizStarter is developed by Ayanfe Innovation Labs Limited. It
              helps small businesses organise sales, expenses, profit records,
              customer debts, inventory, and business reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">2. Your account</h2>
            <p className="mt-2 text-gray-600">
              You are responsible for keeping your login details secure and
              for activity under your account. Contact support if you suspect
              unauthorised access. Never share your password or verification
              codes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">3. Business records</h2>
            <p className="mt-2 text-gray-600">
              You are responsible for the accuracy of the information you
              enter. Keep your own backups of important business records and
              verify important calculations before making business decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">4. No professional advice</h2>
            <p className="mt-2 text-gray-600">
              BizStarter provides organisational and calculation tools. It
              does not replace professional accounting, tax, legal, investment,
              or financial advice. Consult a qualified professional when
              necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">5. Acceptable use</h2>
            <p className="mt-2 text-gray-600">
              Do not use BizStarter for unlawful activities, attempt to access
              another person's account or information, disrupt the service,
              or introduce malicious code. Only enter information you are
              authorised to use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">6. Availability</h2>
            <p className="mt-2 text-gray-600">
              We aim to provide a useful service, but interruptions,
              maintenance, errors, and feature changes may occur. We will
              handle these matters subject to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">
              7. Responsibility and limitations
            </h2>
            <p className="mt-2 text-gray-600">
              To the extent permitted by law, we are not responsible for
              losses caused by inaccurate information entered by users,
              reliance on unverified calculations, or service interruptions.
              Nothing here excludes liability that cannot legally be excluded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">8. Privacy</h2>
            <p className="mt-2 text-gray-600">
              Please read our Privacy Notice to understand how information
              may be handled when you use BizStarter.
            </p>
            <Link
              to="/privacy"
              className="mt-2 inline-block font-semibold text-[#075E45] underline underline-offset-4"
            >
              Read the Privacy Notice
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">9. Contact us</h2>
            <p className="mt-2 text-gray-600">
              For questions about these terms, contact BizStarter support.
            </p>
            <a
              href="mailto:bizstarter.support@gmail.com?subject=BizStarter%20Terms%20Question"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-[#075E45] underline underline-offset-4"
            >
              <Mail size={17} />
              bizstarter.support@gmail.com
            </a>
          </section>

          <p className="border-t pt-5 text-sm text-gray-500">
            These terms are a general draft, not legal advice. They should be
            reviewed against BizStarter's actual operations and applicable
            Nigerian law before commercial launch.
          </p>
        </article>

        <footer className="py-8 text-center text-sm text-gray-500">
          BizStarter · Ayanfe Innovation Labs Limited
        </footer>
      </div>
    </main>
  );
}
