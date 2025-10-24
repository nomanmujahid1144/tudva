"use client";

import TopNavbar from "@/components/TopNavbar";
import Image from "next/image";
import Link from "next/link";
import { Container } from "react-bootstrap";
import logo from '@/assets/images/logo.svg';
import logoLight from '@/assets/images/logo-light.svg';
import AppMenu from "@/components/TopNavbar/components/AppMenu";
import { useLayoutContext } from "@/context/useLayoutContext";
import TopbarMenuToggler from "@/components/TopNavbar/components/TopbarMenuToggler";
import ProfileDropdown from "@/components/TopNavbar/components/ProfileDropdown";
import NotificationDropdown from "@/app/demos/workshop/home/components/NotificationDropdown";
const TopNavigationBar = () => {
  const {
    appMenuControl
  } = useLayoutContext();
  return <TopNavbar>
      <Container>
        <Link className="navbar-brand" href="/">
          <Image width={170} height={36} className="light-mode-item navbar-brand-item" src={logo} alt="logo" />
          <Image width={170} height={36} className="dark-mode-item navbar-brand-item" src={logoLight} alt="logo" />
        </Link>
        <TopbarMenuToggler />
        <AppMenu mobileMenuOpen={appMenuControl.open} startSearchInput menuClassName="ms-auto" />

        <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
          <NotificationDropdown />
          <ProfileDropdown className="nav-item ms-3" />
        </ul>
      </Container>

    </TopNavbar>;
};
export default TopNavigationBar;
