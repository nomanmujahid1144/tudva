'use client';

import { STUDENT_MENU_ITEMS } from '@/assets/data/menu-items';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt, FaChalkboardTeacher, FaPlusCircle, FaBookOpen, FaVideo } from 'react-icons/fa';
import Banner from './components/Banner';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

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
  const { user, logout } = useAuth();

  const handleSignOut = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless collapse-list">

        {/* ─── Regular Student Menu ─────────────────── */}
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
              {t(labelKey.split('.').pop())}
            </Link>
          );
        })}

        {/* ─── Teaching Section (only if canTeach) ──── */}
        {user?.canTeach && (
          <>
            <div className="list-group-item bg-transparent border-top border-secondary mt-2 pt-2 pb-1">
              <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                <FaChalkboardTeacher className="me-1" size={11} />
                {t('teachingSection')}
              </small>
            </div>
            <Link
              className={clsx("list-group-item icons-center", {
                'active': pathname === `/${locale}/instructor/create-course`
              })}
              href={`/${locale}/instructor/create-course`}
            >
              <FaPlusCircle className="me-2" />
              {t('createCourse')}
            </Link>
            <Link
              className={clsx("list-group-item icons-center", {
                'active': pathname === `/${locale}/instructor/courses`
              })}
              href={`/${locale}/instructor/courses`}
            >
              <FaBookOpen className="me-2" />
              {t('myCoursesList')}
            </Link>
            <Link
              className={clsx("list-group-item icons-center", {
                'active': pathname === `/${locale}/instructor/live-sessions`
              })}
              href={`/${locale}/instructor/live-sessions`}
            >
              <FaVideo className="me-2" />
              {t('liveSessions')}
            </Link>
          </>
        )}

        {/* ─── Sign Out ─────────────────────────────── */}
        <a
          className="list-group-item text-danger bg-danger-soft-hover"
          href="#"
          onClick={handleSignOut}
          style={{ cursor: 'pointer' }}
        >
          <FaSignOutAlt className="fa-fw me-2" />
          {t('signOut')}
        </a>

      </div>
    </div>
  );
};

export default Layout;