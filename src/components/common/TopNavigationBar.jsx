'use client';

import LogoBox from "@/components/LogoBox";
import TopNavbar from "@/components/TopNavbar";
import AppMenu from "@/components/TopNavbar/components/AppMenu";
import ProfileDropdown from "@/components/TopNavbar/components/ProfileDropdown";
import TopbarMenuToggler from "@/components/TopNavbar/components/TopbarMenuToggler";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import { useLayoutContext } from "@/context/useLayoutContext";
import { Container } from "react-bootstrap";
import { useAuth } from "@/context/AuthContext";

const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const { user } = useAuth();

  return (
    <TopNavbar>
      <Container>
        <LogoBox height={36} width={143} />
        <TopbarMenuToggler />
        <AppMenu
          mobileMenuOpen={appMenuControl.open}
          menuClassName="mx-auto"
          showExtraPages
          searchInput
        />

        {/* Only show notification dropdown for authenticated users */}
        {user && <NotificationDropdown />}

        <ProfileDropdown className="ms-1 ms-lg-0" />
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
