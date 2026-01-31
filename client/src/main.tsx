import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Provider wraps the app and gives Redux data access.Redux store must be shared with all components.
import { Provider } from "react-redux";
// React Query manages API calls, caching, loading states.QueryClient stores fetched data in memory.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider} from "@react-oauth/google"

import { store } from "./store/store";
import App from "./App";


import "./index.css";


const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* it just means Google tools are available everywhere. */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right"/>
      </QueryClientProvider>
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);