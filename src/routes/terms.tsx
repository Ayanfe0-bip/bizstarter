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

        <header className="mt-8 rounded-3xl bg-[#075E45] p-7 text-white sm
