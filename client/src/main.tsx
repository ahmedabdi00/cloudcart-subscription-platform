import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import Header from "./components/Header";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={Orders} />
            <Route path="/auth" component={Auth} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </main>
        <Toaster />
      </div>
    </SWRConfig>
  </StrictMode>
);
