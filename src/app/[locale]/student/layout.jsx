'use client';

import { STUDENT_MENU_ITEMS } from '@/assets/data/menu-items';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import Banner from './components/Banner';
import { useTranslations } from 'next-intl';

const Layout = ({ children }) => {
  const { width } = useViewPort();
  const { isTrue: isOffCanvasMenuOpen, toggle: toggleOffCanvasMenu } = useToggle();
  const t = useTranslations('student.menu');

  return (
    <>
      <Banner toggleOffCanvas={toggleOffCanvasMenu} />
      <section className="pt-0">
        <Container className='pe-0 mw-100'>
          <Row>
            <Col xl={3}>
              {width >= 1200 ? (
                <VerticalMenu />
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
  const { locale } = useParams();
  const t = useTranslations('student.menu');

  return (
    <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless collapse-list">
        {STUDENT_MENU_ITEMS.map(({ labelKey, url, icon }, idx) => {
          const Icon = icon;
          const localizedUrl = `/${locale}${url}`;
          
          return (
            <Link 
              className={clsx("list-group-item icons-center", {
                'active': pathname === localizedUrl
              })} 
              href={localizedUrl} 
              key={idx}
            >
              {Icon && <Icon className="me-2" />}
              {t(labelKey.split('.').pop())} {/* Extract last part: 'profile', 'myCourses', etc */}
            </Link>
          );
        })}
        
        <Link 
          className="list-group-item text-danger bg-danger-soft-hover" 
          href={`/${locale}/auth/sign-in`}
        >
          <FaSignOutAlt className="fa-fw me-2" />
          {t('signOut')}
        </Link>
      </div>
    </div>
  );
};

export default Layout;