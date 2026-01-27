"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import PersonIcon from "@mui/icons-material/Person";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut(auth);
    router.push("/login");
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: "bold",
            color: "white",
            textDecoration: "none",
            mr: 4,
            "&:hover": { color: "primary.main" },
          }}
        >
          AI Fullstack Lab
        </Typography>

        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          {user ? (
            <Button
              component={Link}
              href="/"
              color={pathname === "/" ? "primary" : "inherit"}
              sx={{
                bgcolor: pathname === "/" ? "rgba(59, 130, 246, 0.1)" : "transparent",
              }}
            >
              대시보드
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                href="/"
                color={pathname === "/" ? "primary" : "inherit"}
                sx={{
                  bgcolor: pathname === "/" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                }}
              >
                홈
              </Button>
              <Button
                component={Link}
                href="/login"
                color={pathname === "/login" ? "primary" : "inherit"}
                sx={{
                  bgcolor: pathname === "/login" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                }}
              >
                로그인
              </Button>
              <Button
                component={Link}
                href="/signup"
                color={pathname === "/signup" ? "primary" : "inherit"}
                sx={{
                  bgcolor: pathname === "/signup" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                }}
              >
                회원가입
              </Button>
            </>
          )}
        </Box>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary" }}
            >
              {user.displayName || user.email?.split("@")[0] || "사용자"}
            </Typography>
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar
                src={user.photoURL || undefined}
                sx={{ width: 32, height: 32, bgcolor: "grey.700" }}
              >
                {!user.photoURL && <PersonIcon />}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: { mt: 1, minWidth: 180 },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {user.displayName || "사용자"}
                </Typography>
                {user.email && (
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                )}
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button component={Link} href="/login" variant="contained" color="primary">
            로그인
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
