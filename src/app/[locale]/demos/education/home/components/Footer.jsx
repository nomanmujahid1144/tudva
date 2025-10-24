import Image from "next/image";
import { Col, Container, Row } from "react-bootstrap";
import Link from "next/link";
import { developedBy, developedByLink } from "@/context/constants";
import { footerLinks2, socialMediaLinks } from "@/assets/data/footer-items";
import logoLight from '@/assets/images/logo-light.svg';
import clsx from "clsx";
const Footer = () => {
  return <footer className="pt-0 bg-blue rounded-4 position-relative mx-2 mx-md-4 mb-3">
      <figure className="mb-0">
        <svg className="fill-body rotate-180" width="100%" height={150} viewBox="0 0 500 150" preserveAspectRatio="none">
          <path d="M0,150 L0,40 Q250,150 500,40 L580,150 Z" />
        </svg>
      </figure>
      <Container>
        <Row className="mx-auto">
          <Col lg={6} className="mx-auto text-center my-5">
            <Image className="mx-auto h-40px" src={logoLight} alt="logo" />
            <p className="mt-3 text-white">Eduport education theme, built specifically for the education centers which is dedicated to teaching and involving learners.</p>
            <ul className="nav justify-content-center text-primary-hover mt-3 mt-md-0">
              {footerLinks2.map((item, idx) => <li className="nav-item" key={idx}><Link className="nav-link text-white" href={item.link ?? ""}>{item.name}</Link></li>)}
            </ul>
            <ul className="list-inline mt-3 mb-0 items-center gap-1">
              {socialMediaLinks.map((item, idx) => {
              const Icon = item.icon;
              return <li className="list-inline-item" key={idx}>
                    <span className={clsx("btn btn-white btn-sm shadow px-2", item.variant)} role="button">
                      <Icon className="fa-fw" />
                    </span>
                  </li>;
            })}
            </ul>
            <div className="mt-3 text-white">Copyrights ©2024 Eduport. Build by <Link href={developedByLink} className="text-reset btn-link text-primary-hover" target="_blank">{developedBy}</Link></div>
          </Col>
        </Row>
      </Container>
    </footer>;
};
export default Footer;
