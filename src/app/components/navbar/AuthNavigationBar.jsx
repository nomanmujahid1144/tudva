"use client";

import clsx from "clsx";
import { Button, Container} from "react-bootstrap";
import LogoBox from "@/components/LogoBox";
import useScrollEvent from "@/hooks/useScrollEvent";
import LanguageSwitcher from "./components/LanguageSwitcher";

const AuthNavigationBar = () => {
  const { scrollY } = useScrollEvent();


  return (
    <>
      <style>{`
        .navbar-light.navbar-sticky {
          transition: box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .navbar-light.navbar-sticky.navbar-sticky-on {
          position: sticky;
          top: 0;
          z-index: 1030;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <header className={clsx("navbar-light navbar-sticky bg-white", { 'navbar-sticky-on': scrollY >= 400 || '' })}>
        <nav className="navbar navbar-expand-xl">
          <Container>
            <LogoBox height={36} width={170} />
            <ul className="nav flex-row justify-content-center align-items-center list-unstyled ms-xl-auto">
              <LanguageSwitcher className="me-2" />
            </ul>
          </Container>
        </nav>
      </header>
    </>
  );
};

export default AuthNavigationBar;