import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("./src/pages/acceuil/acceuilPage.tsx"),
    route("/login", "./src/pages/login/login.tsx"),
    layout("./src/layout/Layout.tsx", [
        route("/projet/:projetId/Dashboard","./src/pages/DashboardPage.tsx"),
        // route("/projet/:projetId/Parties-Prenantes","./src/pages/PartiesPrenantesPage.tsx"),
        route("/projet/:projetId/Demarrage","./src/pages/demarrage/IntegrationPage.tsx"),
        route("/projet/:projetId/Planification","./src/pages/planification/PlanificationPage.tsx"),
        // route("/projet/:projetId/Execution","./src/pages/ExecutionPage.tsx"),
        // route("/projet/:projetId/Surveillance","./src/pages/SurveillancePage.tsx"),
        // route("/projet/:projetId/Cloture","./src/pages/ClotureP age.tsx"),
    ]),
] satisfies RouteConfig;
