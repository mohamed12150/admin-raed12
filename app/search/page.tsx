import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold">جاري تحميل نتائج البحث...</p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
