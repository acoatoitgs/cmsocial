import Link from "next/link";

import { Trans } from "@lingui/macro";
import { Home } from "lucide-react";

export default function Page() {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="text-xl font-bold">
        <Trans>Questa pagina non è stata trovata 😢</Trans>
      </div>
      <Link href="/" className="btn btn-primary">
        <Home size={22} /> <Trans>Torna alla home</Trans>
      </Link>
    </div>
  );
}
