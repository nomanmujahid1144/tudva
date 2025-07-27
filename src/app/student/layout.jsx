'use client';

import { STUDENT_MENU_ITEMS } from '@/assets/data/menu-items';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import Banner from './components/Banner';

const Layout = ({
  children
}) => {
  const {
    width
  } = useViewPort();
  const {
    isTrue: isOffCanvasMenuOpen,
    toggle: toggleOffCanvasMenu
  } = useToggle();
  return <>
        <Banner toggleOffCanvas={toggleOffCanvasMenu} />
        <section className="pt-0">
          <Container className='pe-0 mw-100'>
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
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless collapse-list">

        {STUDENT_MENU_ITEMS.map(({
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
export default Layout;
