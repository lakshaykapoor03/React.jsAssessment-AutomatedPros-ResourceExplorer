import { Suspense } from "react";
import HomeClient from "./home.client";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}> 
      <HomeClient />
    </Suspense>
  );
}
