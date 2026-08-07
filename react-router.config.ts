import type { Config } from "@react-router/dev/config";

export default {
  // Mode SPA (statique) : l'app est rendue côté client et fetch l'API Django.
  // Idéal pour un hébergement statique type Vercel (pas de serveur Node requis).
  ssr: false,
} satisfies Config;
