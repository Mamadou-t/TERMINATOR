import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    route("/login", "./src/pages/login/login.tsx"),
    route("/inscription", "./src/pages/inscription/inscription.tsx"),
    layout("./src/layout/RequireAuth.tsx", [
        layout("./src/layout/Layout.tsx", [
            index("./src/pages/acceuil/acceuilPage.tsx"),
            route("/projet/:projetId/Dashboard", "./src/pages/DashboardPage.tsx"),
            route("/projet/:projetId/:phase/:domaine", "./src/pages/PhaseDomainePage.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
