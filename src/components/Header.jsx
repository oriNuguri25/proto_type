import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Package, Tag, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticated, logout } from "@/utils/auth";

const Header = ({ navigate }) => {
  const isLoggedIn = isAuthenticated();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">Jeogi</span>
        </Link>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/products/register">
                <Button size="sm" className="btn-primary">
                  <Tag className="mr-2 h-4 w-4" />
                  Bán hàng
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2"
                  >
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="ml-2 hidden sm:inline">Thông tin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* 유저 프로필 관리는 나중에... */}
                  {/* <DropdownMenuItem asChild>
                    <Link
                      to="/my-profile"
                      className="flex-cursor-pointer items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/my-products"
                      className="flex cursor-pointer items-center"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      <span>Xem sản phẩm đã đăng</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
