import { Welcome } from "../welcome/welcome";
import Layout from "~/src/layout/Layout";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return < Welcome/>;
}
