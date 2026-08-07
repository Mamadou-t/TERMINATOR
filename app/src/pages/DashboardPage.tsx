import { useParams } from "react-router";
import Dashboard from "../components/pages/Dashboard";

export default function DashboardPage() {
    const params = useParams();
    return <Dashboard params={params as Record<string, string | undefined>} />
}