import AppRoutes from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <>
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
