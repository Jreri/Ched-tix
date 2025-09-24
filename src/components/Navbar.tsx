import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
// import { Customer } from "@/types/Customer";


interface NavbarProps {
  isAdmin?: boolean;
}

const Navbar = ({ isAdmin = false }: NavbarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isLoggedIn = true; // For demonstration

  // Mock user object
const mockUser = {
  firstName: "Customer",
  lastName: "User",
};



  const userRole = isAdmin ? "admin" : "Customer";
  const userData = {
    name: isAdmin 
      ? `${mockUser.firstName} ${mockUser.lastName} (Admin)` 
      : `${mockUser.firstName} ${mockUser.lastName} (Customer)`,
    initials: `${mockUser.firstName[0]}${mockUser.lastName[0]}`
  };

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogoClick = () => {
    navigate(isAdmin ? "/admin/dashboard" : "/home");
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
          <Ticket className="h-6 w-6" />
          <span className="text-xl font-bold">ChedTix</span>
          {isAdmin && (
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Admin
            </span>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {isMenuOpen && (
              <div className="fixed inset-0 top-16 z-50 bg-background p-4">
                <nav className="flex flex-col space-y-4">
                  {!isAdmin ? (
                    <>
                      <Link to="/home" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Home</Link>
                      <Link to="/events" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Events</Link>
                      {isLoggedIn && (
                        <>
                          <Link to="/tickets" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>My Tickets</Link>
                          <Link to="/customer/profile" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Profile</Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Link to="/admin/dashboard" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Dashboard</Link>
                      <Link to="/admin/events" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Events</Link>
                      <Link to="/admin/users" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Users</Link>
                      <Link to="/admin/analytics" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Analytics</Link>
                      <Link to="/admin/scan" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Scan QR</Link>
                      <Link to="/admin/payments" className="text-lg font-medium hover:text-primary" onClick={toggleMenu}>Payments</Link>
                    </>
                  )}
                  {isLoggedIn && (
                    <Button variant="destructive" className="mt-4" onClick={() => { handleLogout(); toggleMenu(); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6">
              {!isAdmin ? (
                <>
                  <Link to="/home" className="text-sm font-medium hover:text-primary">Home</Link>
                  <Link to="/events" className="text-sm font-medium hover:text-primary">Events</Link>
                  {isLoggedIn && (
                    <>
                      <Link to="/tickets" className="text-sm font-medium hover:text-primary">My Tickets</Link>
                      <Link to="/customer/profile" className="text-sm font-medium hover:text-primary">Profile</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
                  <Link to="/admin/events" className="text-sm font-medium hover:text-primary">Events</Link>
                  <Link to="/admin/users" className="text-sm font-medium hover:text-primary">Users</Link>
                  <Link to="/admin/analytics" className="text-sm font-medium hover:text-primary">Analytics</Link>
                  <Link to="/admin/scan" className="text-sm font-medium hover:text-primary">Scan QR</Link>
                  <Link to="/admin/payments" className="text-sm font-medium hover:text-primary">Payments</Link>
                </>
              )}
            </nav>

            {/* User Dropdown */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{userData.name}</p>
                      <p className="text-xs text-muted-foreground">Logged in as {userRole}</p>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to={`/customer/profile`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to={`/customer/settings`} className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
