import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Menu } from "lucide-react";

export default function Header() {
  const { user, logout } = useUser();
  const [location, setLocation] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Button variant="link" className="text-2xl font-bold p-0" onClick={() => setLocation("/")}>
          CloudCart
        </Button>

        <nav className="hidden md:flex items-center gap-6">
          <Button variant="link" className="text-sm font-medium p-0" onClick={() => setLocation("/products")}>
            Products
          </Button>
          <Button variant="link" className="text-sm font-medium p-0" onClick={() => setLocation("/subscription")}>
            Subscription
          </Button>
          {user ? (
            <>
              <Button variant="link" className="text-sm font-medium p-0" onClick={() => setLocation("/orders")}>
                Orders
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="default">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
