import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin, { AdminAnalytics, AdminAttributes, AdminCategories, AdminDashboard, AdminGrowth, AdminPayments, AdminProductEditor, AdminProducts, AdminShipping, AdminStoreSettings, AdminTeam } from "./pages/Admin";
import TrackOrder from "./pages/TrackOrder";
import Favorites from "./pages/Favorites";
import Account from "./pages/Account";
import Products from "./pages/Products";
import StorePolicies from "./pages/StorePolicies";
import TeamInvite from "./pages/TeamInvite";
import Lookbook from "./pages/Lookbook";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import MobileBottomNav from "./components/MobileBottomNav";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/product/:slug"} component={ProductDetails} />
      <Route path={"/products"} component={Products} />
      <Route path={"/lookbook"} component={Lookbook} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/products/new"} component={AdminProductEditor} />
      <Route path={"/admin/products/:id"} component={AdminProductEditor} />
      <Route path={"/admin/products"} component={AdminProducts} />
      <Route path={"/admin/categories"} component={AdminCategories} />
      <Route path={"/admin/attributes"} component={AdminAttributes} />
      <Route path={"/admin/shipping"} component={AdminShipping} />
      <Route path={"/admin/payments"} component={AdminPayments} />
      <Route path={"/admin/analytics"} component={AdminAnalytics} />
      <Route path={"/admin/growth"} component={AdminGrowth} />
      <Route path={"/admin/team"} component={AdminTeam} />
      <Route path={"/admin/settings"} component={AdminStoreSettings} />
      <Route path={"/admin/orders"} component={Admin} />
      <Route path={"/track-order"} component={TrackOrder} />
      <Route path={"/favorites"} component={Favorites} />
      <Route path={"/account"} component={Account} />
      <Route path={"/policies"} component={StorePolicies} />
      <Route path={"/team/join"} component={TeamInvite} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Router />
              <MobileBottomNav />
            </WishlistProvider>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
