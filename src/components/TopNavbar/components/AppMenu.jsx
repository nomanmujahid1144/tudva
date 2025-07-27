"use client";

import { findAllParent, findMenuItem, getAppMenuItems, getMegaMenuItems, getMenuItemFromURL } from "@/helpers/menu";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Col, Collapse, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle, FormControl, Row } from "react-bootstrap";
import { BsCloudDownloadFill, BsLifePreserver, BsPuzzleFill } from "react-icons/bs";
import { FaChevronDown, FaEllipsisH, FaSearch } from "react-icons/fa";
import Image from "next/image";
import { FaEllipsis } from "react-icons/fa6";
import { buyLink } from '@/context/constants';
import avatar9 from '@/assets/images/avatar/09.jpg';
import element14 from '@/assets/images/element/14.svg';
import googlePlay from '@/assets/images/client/google-play.svg';
import appStore from '@/assets/images/client/app-store.svg';
import { CATEGORY_MENU_ITEMS } from "@/assets/data/menu-items";
import CategoryMegaMenu from "./CategoryMegaMenu";
export const MenuItemWithChildren = ({
  item,
  activeMenuItems,
  itemClassName,
  linkClassName,
  level
}) => {
  const level1 = level === 1;
  const Icon = item.icon;
  return <Dropdown as="li" className={itemClassName} drop={level >= 2 ? 'end' : undefined}>
      <DropdownToggle as={'a'} className={linkClassName} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <div className="icons-center">
          {Icon && <Icon className="me-1 fa-fw me-1" />}
          {item.label}
        </div>
        {!Icon && level1 ? <FaChevronDown size={12} /> : !level1 ? <FaEllipsis size={14} /> : ""}
      </DropdownToggle>
      <DropdownMenu as='ul' renderOnMount className="custom-navbar-dropdown-menu">
        {(item.children ?? []).map((child, idx) => <Fragment key={idx + child.key + idx}>
            {child.children ? <MenuItemWithChildren item={child} level={level + 1} activeMenuItems={activeMenuItems} itemClassName="dropdown-submenu" linkClassName={clsx('dropdown-item dropdown-toggle arrow-none d-flex align-items-center justify-content-between', {
          active: activeMenuItems?.includes(child.key)
        })} /> : <>
                <MenuItem item={child} level={level + 1} linkClassName={clsx(activeMenuItems?.includes(child.key) && 'active')} />
                {child.isMegaMenu && <CategoryMegaMenu />}
              </>}
          </Fragment>)}
      </DropdownMenu>
    </Dropdown>;
};
export const MenuItem = ({
  item,
  linkClassName,
  level
}) => {
  return <>
      <li>
        <MenuItemLink item={item} linkClassName={linkClassName} level={level + 1} />
      </li>
      {item.divider && <li>
          <DropdownDivider />
        </li>}
    </>;
};
const MenuItemLink = ({
  item,
  linkClassName
}) => {
  const Icon = item.icon;
  return <DropdownItem as={Link} href={item.url ?? ''} target={item.target} className={clsx(linkClassName, "icons-center")}>
      {Icon && <Icon className="me-1 fa-fw me-1" />}
      {item.label}
    </DropdownItem>;
};
const AppMenu = ({
  mobileMenuOpen,
  menuClassName,
  showExtraPages,
  showCategories,
  searchInput,
  showMegaMenu,
  startSearchInput
}) => {
  const [activeMenuItems, setActiveMenuItems] = useState([]);
  const menuItems = getAppMenuItems();
  const pathname = usePathname();

  /**
   * activate the menuitems
   */
  const activeMenu = useCallback(() => {
    const trimmedURL = pathname?.replaceAll('', '');
    const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL);
    if (matchingMenuItem) {
      const activeMt = findMenuItem(menuItems, matchingMenuItem.key);
      if (activeMt) {
        setActiveMenuItems([activeMt.key, ...findAllParent(menuItems, activeMt)]);
      }
    }
  }, [pathname, menuItems]);
  useEffect(() => {
    activeMenu();
  }, [activeMenu, menuItems]);
  const MegamenuData = getMegaMenuItems();
  return <Collapse in={mobileMenuOpen} className="navbar-collapse collapse">
      <div>
        {startSearchInput && <Col xl={7}>
            <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
              <div className="nav-item w-100">
                <form className="rounded position-relative">
                  <FormControl className="pe-5 bg-secondary bg-opacity-10 border-0" type="search" placeholder="Search" aria-label="Search" />
                  <button className="btn btn-link bg-transparent px-2 py-0 position-absolute top-50 end-0 translate-middle-y" type="button"><FaSearch className="fs-6 text-primary" /></button>
                </form>
              </div>
            </div>
          </Col>}
        {showCategories && <ul className="navbar-nav navbar-nav-scroll me-auto">
            {CATEGORY_MENU_ITEMS.map((item, idx) => {
          return <Fragment key={item.key + idx}>
                    {item.children ? <MenuItemWithChildren item={item} activeMenuItems={activeMenuItems} level={1} itemClassName="nav-item dropdown-menu-shadow-stacked cursor-pointer" linkClassName={clsx('arrow-none nav-link bg-primary bg-opacity-10 rounded-3 text-primary px-3 py-3 py-xl-0', {
              active: activeMenuItems.includes(item.key)
            })} /> : <MenuItem item={item} level={1} linkClassName={clsx(activeMenuItems.includes(item.key) && 'active')} />}

                  </Fragment>;
        })}
          </ul>}
        <ul className={clsx('navbar-nav navbar-nav-scroll', menuClassName)}>
          {(menuItems ?? []).map((item, idx) => {
          return <Fragment key={item.key + idx}>
                {item.children ? <MenuItemWithChildren item={item} activeMenuItems={activeMenuItems} level={1} itemClassName="nav-item cursor-pointer" linkClassName={clsx('nav-link arrow-none d-flex align-items-center gap-1 justify-content-between', {
              active: activeMenuItems.includes(item.key)
            })} /> : <MenuItem item={item} level={1} linkClassName={clsx(activeMenuItems.includes(item.key) && 'active')} />}
              </Fragment>;
        })}
          {showMegaMenu && <Dropdown className="nav-item  dropdown-fullwidth">
            <DropdownToggle as={Link} className="nav-link" href="" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Megamenu</DropdownToggle>
            <div className="dropdown-menu dropdown-menu-end" data-bs-popper="none">
              <Row className="p-4">
                <Col xl={6} xxl={3} className=" mb-3">
                  <h6 className="mb-0">Get started</h6>
                  <hr />
                  <ul className="list-unstyled">
                    {MegamenuData.getStarted.map((item, idx) => <li key={idx}> <a className="dropdown-item" href="#">{item.label}</a> </li>)}
                  </ul>

                </Col>
                <Col xl={6} xxl={3} className=" mb-3">
                  <h6 className="mb-0">Degree</h6>
                  <hr />
                  {MegamenuData.degree.map((degree, idx) => <div className="mb-2 position-relative bg-primary-soft-hover rounded-2 transition-base p-3" key={idx}>
                      <Link className="stretched-link h6 mb-0" href="#">{degree.label}</Link>
                      <p className="mb-0 small text-truncate-2">{degree.description}</p>
                    </div>)}

                </Col>
                <Col xl={6} xxl={3} className=" mb-3">
                  <h6 className="mb-0">Certificate</h6>
                  <hr />
                  {MegamenuData.certificate.map((certificate, idx) => {
                  const Icon = certificate.icon;
                  return <div className="d-flex mb-4 position-relative" key={idx}>
                        {Icon && <h2 className="mb-0"><Icon className={clsx("fa-fw", certificate.iconClass)} /></h2>}
                        <div className="ms-2">
                          <a className="stretched-link h6 mb-0" href="#">{certificate.label}</a>
                          <p className="mb-0 small">{certificate.description}</p>
                        </div>
                      </div>;
                })}

                </Col>
                <Col xl={6} xxl={3} className="mb-3">
                  <h6 className="mb-0">Download Eduport</h6>
                  <hr />
                  <Image src={element14} alt="element" />
                  <Row className="g-2 justify-content-center mt-3">
                    <Col xs={6} sm={4} xxl={6}>
                      <a href="#"> <Image src={googlePlay} className="btn-transition" alt="google-store" /> </a>
                    </Col>
                    <Col xs={6} sm={4} xxl={6}>
                      <a href="#"> <Image src={appStore} className="btn-transition" alt="app-store" /> </a>
                    </Col>
                  </Row>
                </Col>

                <Col xs={12}>
                  <div className="alert alert-success alert-dismissible fade show mt-2 mb-0 rounded-3" role="alert">
                    <div className="avatar avatar-xs me-2">
                      <Image className="avatar-img rounded-circle" src={avatar9} alt="avatar" />
                    </div>
                    The personality development class starts at 2:00 pm, click to <a href="#" className="alert-link">Join Now</a>
                  </div>
                </Col>
              </Row>
            </div>
          </Dropdown>}
          {showExtraPages && <Dropdown className="nav-item">
              <DropdownToggle as={Link} className="nav-link arrow-none" href="" id="advanceMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <FaEllipsisH />
              </DropdownToggle>
              <ul className="dropdown-menu min-w-auto" data-bs-popper="none">
                <li>
                  <DropdownItem as={Link} href="https://themes.stackbros.com/eduport-next" target="_blank">
                    <BsLifePreserver className="text-warning fa-fw me-2" />Support
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem as={Link} href={buyLink} target="_blank">
                    <BsCloudDownloadFill className="text-success fa-fw  me-2" />Buy Eduport!
                  </DropdownItem>
                </li>
                <li> <DropdownDivider /></li>
                <li>
                  <DropdownItem as={Link} href="" target="_blank">
                    <BsPuzzleFill className="text-orange fa-fw me-2" />Components
                  </DropdownItem>
                </li>
              </ul>
            </Dropdown>}
        </ul>

        {searchInput && <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
            <div className="nav-item w-100">
              <form className="position-relative">
                <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
                <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="button">
                  <FaSearch className="fs-6 " />
                </button>
              </form>
            </div>
          </div>}
      </div>
    </Collapse>;
};
export default AppMenu;
