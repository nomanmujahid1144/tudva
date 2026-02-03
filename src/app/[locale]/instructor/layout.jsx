// src/app/[locale]/instructor/layout.jsx
"use client";

import { INSTRUCTOR_MENU_ITEMS } from '@/assets/data/menu-items';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import Banner from './components/Banner';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

const InstructorLayout = ({ children }) => {
  const pathname = usePathname();
  const { width } = useViewPort();
  const {} = useLayoutContext();
  const { isTrue: isOffCanvasMenuOpen, toggle: toggleOffCanvasMenu } = useToggle();
  const t = useTranslations('instructor.menu');

  // Check if current route is live-session (should be full screen)
  const isLiveSessionRoute = pathname.includes('/live-session/');

  // If live session route, render children only (no layout)
  if (isLiveSessionRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Banner toggleOffCanvas={toggleOffCanvasMenu} />
      <section className="pt-0">
        <Container>
          <Row>
            <Col xl={3}>
              {width >= 1200 ? (
                <>
                <VerticalMenu />
                </>
              ) : (
                <Offcanvas show={isOffCanvasMenuOpen} placement='end' onHide={toggleOffCanvasMenu}>
                  <OffcanvasHeader className='bg-light' closeButton>
                    <OffcanvasTitle>{t('myProfile')}</OffcanvasTitle>
                  </OffcanvasHeader>
                  <OffcanvasBody className='p-3 p-xl-0'>
                    <VerticalMenu />
                  </OffcanvasBody>
                </Offcanvas>
              )}
            </Col>
            <Col xl={9}>
              {children}
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

const VerticalMenu = () => {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en';
  const t = useTranslations();
  const { logout } = useAuth();

  const handleSignOut = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless">
        {INSTRUCTOR_MENU_ITEMS.map(({ labelKey, url, icon }, idx) => {
          const Icon = icon;
          const fullUrl = `/${locale}${url}`;
          
          return (
            <Link 
              className={clsx("list-group-item icons-center", {
                'active': pathname === fullUrl
              })} 
              href={fullUrl} 
              key={idx}
            >
              {Icon && <Icon className="me-2" />}
              {t(labelKey)}
            </Link>
          );
        })}
        <a 
          className="list-group-item text-danger bg-danger-soft-hover" 
          href="#"
          onClick={handleSignOut}
          style={{ cursor: 'pointer' }}
        >
          <FaSignOutAlt className="fa-fw me-2" />
          {t('instructor.menu.signOut')}
        </a>
      </div>
    </div>
  );
};

export default InstructorLayout;