import Link from "next/link";
import { ROUTES } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-primary/10">404</p>
      <h1 className="text-2xl font-bold text-gray-900 -mt-4">Η σελίδα δεν βρέθηκε</h1>
      <p className="mt-3 text-sm text-gray-500 max-w-sm">
        Η σελίδα που ζητήσατε δεν υπάρχει ή έχει μετακινηθεί.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={ROUTES.home}
          className="bg-primary text-white font-medium px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          Αρχική Σελίδα
        </Link>
        <Link
          href={ROUTES.erga}
          className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Λίστα Έργων
        </Link>
      </div>
    </div>
  );
}
