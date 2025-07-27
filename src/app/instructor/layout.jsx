"use client";

import { INSTRUCTOR_MENU_ITEMS } from '@/assets/data/menu-items';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import Banner from './components/Banner';
import Footer from './components/Footer';
import TopNavigationBar from '../components/navbar/TopNavigationBar';
import { useLayoutContext } from '@/context/useLayoutContext';
const InstructorLayout = ({
  children
}) => {
  const {
    width
  } = useViewPort();
  const {} = useLayoutContext();
  const {
    isTrue: isOffCanvasMenuOpen,
    toggle: toggleOffCanvasMenu
  } = useToggle();
  return <>
        <Banner toggleOffCanvas={toggleOffCanvasMenu} />
        <section className="pt-0">
          <Container>
            <Row>
              <Col xl={3}>
                {width >= 1200 ? <VerticalMenu /> : <Offcanvas show={isOffCanvasMenuOpen} placement='end' onHide={toggleOffCanvasMenu}>
                    <OffcanvasHeader className='bg-light' closeButton>
                      <OffcanvasTitle>My profile</OffcanvasTitle>
                    </OffcanvasHeader>
                    <OffcanvasBody className='p-3 p-xl-0'>
                      <VerticalMenu />
                    </OffcanvasBody>
                  </Offcanvas>}
              </Col>
              <Col xl={9}>
                {children}
              </Col>
            </Row>
          </Container>
        </section>
    </>;
};
const VerticalMenu = () => {
  const pathname = usePathname();
  return <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless">
        {INSTRUCTOR_MENU_ITEMS.map(({
        label,
        url,
        icon
      }, idx) => {
        const Icon = icon;
        return <Link className={clsx("list-group-item icons-center", {
          'active': pathname === url
        })} href={url || ''} key={idx}>
              {Icon && <Icon className="me-2" />}
              {label}
            </Link>;
      })}
        <Link className="list-group-item text-danger bg-danger-soft-hover" href="/auth/sign-in"><FaSignOutAlt className="fa-fw me-2" />Sign Out</Link>
      </div>
    </div>;
};
export default InstructorLayout;
