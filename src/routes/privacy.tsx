import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <ShieldCheck size={30} className="text-[#D6AD55]" />
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Privacy Notice
          </h1>
          <p className="mt-3 text-sm text-green-100">
            Last updated: October 19, 2026
          </p>
          <p className="mt-4 leading-7 text-green-50">
            This notice explains how BizStarter may collect, use, and protect
            information when you use our service.
          </p>
        </header>

        <article className="mt-6 space-y-6 rounded-3xl border border-gray-100 bg-white p-6 leading-7 shadow-sm sm:p-9">
          <section>
            <h2 className="text-xl font-extrabold">1. Who we are</h2>
            <p className="mt-2 text-gray-600">
              BizStarter is developed by Ayanfe Innovation Labs Limited to help
              small businesses organise their records. For privacy questions,
              contact us at bizstarter.support@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">
              2. Information you provide
            </h2>
            <p className="mt-2 text-gray-600">
              Depending on how you use BizStarter, information may include your
              account email address and the business information you enter,
              such as sales, expenses, products, inventory, debts, customer
              details, and reports.
            </p>
            <p className="mt-2 text-gray-600">
              Please avoid entering sensitive personal information that the
              service does not need. Only enter customer information that you
              are authorised to record.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">
              3. How we use information
            </h2>
            <p className="mt-2 text-gray-600">
              Information is used to provide BizStarter features, display your
              business records, calculate summaries, maintain your account,
              help troubleshoot problems, protect the service, and respond to
              support requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">
              4. Storage and service providers
            </h2>
            <p className="mt-2 text-gray-600">
              BizStarter uses Supabase for account authentication and cloud
              data features. Information may be processed or stored by service
              providers involved in operating the application. Their handling
              of information is subject to their applicable terms and privacy
              practices.
            </p>
            <p className="mt-2 text-gray-600">
              Your ability to access records may depend on your internet
              connection and the availability of the service. Keep separate
              backups of important business information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">5. Sharing information</h2>
            <p className="mt-2 text-gray-600">
              We do not intend to sell your personal information. Information
              may be processed by providers needed to operate BizStarter, or
              disclosed where required by law or reasonably necessary to
              protect rights, safety, and service security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">6. Security</h2>
            <p className="mt-2 text-gray-600">
              We use the security features available in our application and
              service providers to help protect information. However, no
              internet service can guarantee absolute security. Use a strong,
              unique password, sign out on shared devices, and never share
              verification codes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">7. Retention and deletion</h2>
            <p className="mt-2 text-gray-600">
              Information may be retained for as long as needed to provide the
              service, maintain records, resolve disputes, and meet applicable
              legal obligations. To ask about accessing, correcting, or
              deleting your information, email our support team. We may need
              to verify your identity before responding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">8. Your choices</h2>
            <p className="mt-2 text-gray-600">
              You can choose what business information to enter and can contact
              us with privacy questions or requests. Some information may be
              needed for account or application features to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">9. Children's privacy</h2>
            <p className="mt-2 text-gray-600">
              BizStarter is designed for business management and is not
              intended to be directed at children. Please contact us if you
              believe a child has provided personal information through the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">10. Changes to this notice</h2>
            <p className="mt-2 text-gray-600">
              We may update this notice as BizStarter changes. The latest
              version will be published on this page with its updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold">11. Contact us</h2>
            <p className="mt-2 text-gray-600">
              For privacy questions or requests, contact:
            </p>
            <a
              href="mailto:bizstarter.support@gmail.com?subject=BizStarter%20Privacy%20Request"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-[#075E45] underline underline-offset-4"
            >
              <Mail size={17} />
              bizstarter.support@gmail.com
            </a>
          </section>

          <p className="border-t pt-5 text-sm text-gray-500">
            This notice is a general starting point and should be checked
            against BizStarter's actual data practices and applicable Nigerian
            privacy law before commercial launch.
          </p>
        </article>

        <footer className="py-8 text-center text-sm text-gray-500">
          BizStarter · Ayanfe Innovation Labs Limited
        </footer>
      </div>
    </main>
  );
      }
