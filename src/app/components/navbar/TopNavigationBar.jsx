"use client";

import clsx from "clsx";
import Link from "next/link";
import { Button, Col, Collapse, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavItem } from "react-bootstrap";
import { BsGridFill, BsHeart } from "react-icons/bs";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";
import LogoBox from "@/components/LogoBox";
import ProfileDropdown from "@/components/TopNavbar/components/ProfileDropdown";
import useScrollEvent from "@/hooks/useScrollEvent";
import useToggle from "@/hooks/useToggle";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homePageItems, otherPagesMenuItem } from "@/data/menuItems";
import LanguageSwitcher from "./components/LanguageSwitcher";

const TopNavigationBar = () => {
  const t = useTranslations('navbar');
  const tMenuHome = useTranslations('menuItems.home');
  const tMenuOther = useTranslations('menuItems.other');
  const locale = useLocale();

  const { scrollY } = useScrollEvent();
  const { isTrue: isOpen, toggle } = useToggle();
  const { isTrue: isOpenCategory, toggle: toggleCategory } = useToggle();

  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  // Remove locale prefix from pathname to check if it's home
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const isHomePage = pathnameWithoutLocale === '/';
  const menuItems = isHomePage ? homePageItems : otherPagesMenuItem;

  // Check if we're on the courses page to always show white background
  const isCoursesPage = pathnameWithoutLocale === '/courses';

  // Helper to translate menu items
  const translateMenuItem = (key) => {

    // Extract the actual translation path from the full key
    // e.g., 'menuItems.home.languagesCommunication.title' -> 'languagesCommunication.title'
    if (key.startsWith('menuItems.home.')) {
      const path = key.replace('menuItems.home.', '');
      const translated = tMenuHome(path);
      return translated;
    } else if (key.startsWith('menuItems.other.')) {
      const path = key.replace('menuItems.other.', '');
      const translated = tMenuOther(path);
      return translated;
    }
    return key;
  };

  return (
    <>
      <header className={clsx("navbar-light navbar-sticky bg-white", { 'navbar-sticky-on': scrollY >= 400 || isCoursesPage })}>
        <nav className="navbar navbar-expand-xl">
          <Container>
            <LogoBox height={36} width={170} />
            <button onClick={toggle} className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-animation">
                <span />
                <span />
                <span />
              </span>
            </button>
            <Collapse in={isOpen} className="navbar-collapse justify-content-center">
              <div>
                <Col md={8}>
                  <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
                    <div className="nav-item w-100">
                      <form className="rounded position-relative">
                        <input
                          className="form-control pe-5 bg-secondary bg-opacity-10 border-0"
                          type="search"
                          placeholder={t('search.placeholder')}
                          aria-label={t('search.button')}
                        />
                        <button
                          className="btn btn-link bg-transparent px-2 py-0 position-absolute top-50 end-0 translate-middle-y"
                          type="submit"
                        >
                          <FaSearch className="fs-6 text-primary" />
                        </button>
                      </form>
                    </div>
                  </div>
                </Col>
              </div>
            </Collapse>
            <ul className="nav flex-row justify-content-center align-items-center list-unstyled ms-xl-auto">
              

              {isAuthenticated && user?.role === 'learner' ? (
                <>
                  {isAuthenticated && user && (
                    <Link href={`/${locale}/my-learning`} className="nav-item d-none d-sm-block">
                      <Button size="sm" variant="danger-soft" className="mb-0 !mr-2 px-4">
                        {t('learner.myLearning')}
                      </Button>
                    </Link>
                  )}
                  {isAuthenticated && user && (
                    <div className="d-flex gap-2">
                      <li className="nav-item ms-0 ms-sm-2 d-none d-sm-block">
                        <Link
                          className="btn btn-light btn-round mb-0"
                          href="/favorites"
                          title={t('learner.favorites')}
                        >
                          <BsHeart className="fa-fw" />
                        </Link>
                      </li>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isAuthenticated && user && (
                    <Link href={`/${locale}/live-sessions`} className="nav-item d-none d-sm-block">
                      <Button size="sm" variant="danger-soft" className="mb-0 !mr-2 px-4">
                        {t('learner.myLiveSessions')}
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              <LanguageSwitcher className="me-2" />
              
              {loading ? (
                <div className="spinner-border spinner-border-sm text-primary ms-3" role="status">
                  <span className="visually-hidden">{t('auth.loading')}</span>
                </div>
              ) : isAuthenticated && user ? (
                <ProfileDropdown className="nav-item ms-3" />
              ) : (
                <Button href={`/${locale}/auth/sign-up`} size="sm" variant="primary" className="mb-0 ms-3 px-4">
                  {t('auth.joinUs')}
                </Button>
              )}
            </ul>
          </Container>
        </nav>
        <hr className="my-0" />
        <nav className="navbar navbar-expand-xl nav-category bg-white">
          <Container className="px-0">
            <button onClick={toggleCategory} className="navbar-toggler m-auto w-100" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse2" aria-controls="navbarCollapse2" aria-expanded="false" aria-label="Toggle navigation">
              <BsGridFill /> {t('category')}
            </button>
            <Collapse in={isOpenCategory} className="navbar-collapse w-100">
              <ul className="navbar-nav navbar-nav-scroll mx-auto">
                {menuItems.map((item, index) => (
                  item.submenuItems && item.submenuItems.length > 0 ? (
                    <Dropdown key={index} className="nav-item" role="button">
                      <DropdownToggle as='a' className="nav-link arrow-none active">
                        {translateMenuItem(item.menuItem)}
                        <FaChevronDown className="ms-1" size={10} />
                      </DropdownToggle>
                      <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${index}`}>
                        {item.submenuItems.map((subitem, subindex) => (
                          <li key={subindex}>
                            <DropdownItem href={subitem.menuLink || "#"}>
                              {translateMenuItem(subitem.menuItem)}
                            </DropdownItem>
                          </li>
                        ))}
                      </ul>
                    </Dropdown>
                  ) : (
                    <NavItem key={index}>
                      <a className="nav-link" href={item.menuLink || "#"}>
                        {translateMenuItem(item.menuItem)}
                      </a>
                    </NavItem>
                  )
                ))}
              </ul>
            </Collapse>
          </Container>
        </nav>
      </header>
    </>
  );
};

export default TopNavigationBar;