import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#050505]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-5 py-3 text-xs font-bold text-zinc-300">
        <LoaderCircle className="animate-spin text-aura" size={18} />
        Carregando
      </div>
    </div>
  );
}
