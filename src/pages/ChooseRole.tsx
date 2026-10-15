
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, UserRound, Store } from "lucide-react";

export default function ChooseRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111316] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-sm text-white/50 hover:text-[#e5b52f]"
        >
          <ArrowLeft size={16} />
          Back to Jashan-E-Aas
        </button>

        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e5b52f] text-2xl font-bold text-black">
            ज
          </div>

          <h1 className="text-3xl font-serif font-bold">
            Welcome to{" "}
            <span className="text-[#e5b52f]">Jashan-E-Aas</span>
          </h1>

          <p className="mt-3 text-white/55">
            Choose how you want to continue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <button
            onClick={() => navigate("/signin")}
            className="group rounded-2xl border border-white/10 bg-[#1b1e23] p-7 text-left transition duration-200 hover:border-[#e5b52f]/70 hover:bg-[#22221e]"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#e5b52f]/25 bg-[#e5b52f]/10 text-[#e5b52f]">
              <UserRound size={28} />
            </div>

            <h2 className="text-xl font-semibold">I'm a Customer</h2>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Discover event vendors, explore services, and plan your
              perfect occasion with EveBuddy AI.
            </p>

            <div className="mt-7 flex items-center justify-between text-sm text-[#e5b52f]">
              Continue as Customer
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>

          <button
            onClick={() => navigate("/vendor/signin")}
            className="group rounded-2xl border border-white/10 bg-[#1b1e23] p-7 text-left transition duration-200 hover:border-[#e5b52f]/70 hover:bg-[#22221e]"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#e5b52f]/25 bg-[#e5b52f]/10 text-[#e5b52f]">
              <Store size={28} />
            </div>

            <h2 className="text-xl font-semibold">I'm a Vendor</h2>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Showcase your business, list the events you organise,
              and manage customer enquiries.
            </p>

            <div className="mt-7 flex items-center justify-between text-sm text-[#e5b52f]">
              Continue as Vendor
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>
        <p className="mt-8 text-center text-xs text-white/35">
          Your event journey starts here.
        </p>
      </div>
    </div>
  );
}
