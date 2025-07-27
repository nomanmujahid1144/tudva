import Image from "next/image";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import logoLight from '@/assets/images/logo.svg';
import { developedBy, developedByLink } from "@/context/constants";
import { footerLinks2, socialMediaLinks } from "@/assets/data/footer-items";
import clsx from "clsx";
const Footer = () => {
  return <footer>
      <Container className="position-relative">
        <Row>
          <Col lg={6} className="mx-auto text-center my-5">
            <Link href="/"> <Image className="h-40px" src={logoLight} alt="logo" /> </Link>
            <p className="mt-3 ">Eduport education theme, built specifically for the education centers which is dedicated to teaching and involving learners.</p>
            <ul className="nav justify-content-center justify-content-center text-primary-hover mt-3 mt-md-0">
              {footerLinks2.map((item, idx) => <li className="nav-item" key={idx}><Link className="nav-link text-body" href={item.link ?? ""}>{item.name}</Link></li>)}
            </ul>
            <ul className="list-inline mb-0 mt-3">
              {socialMediaLinks.map((item, idx) => {
              const Icon = item.icon;
              return <li className="list-inline-item" key={idx}>
                    <span className={clsx("btn btn-white btn-sm shadow px-2", item.variant)} role="button">
                      <Icon className="fa-fw" />
                    </span>
                  </li>;
            })}
            </ul>
            <div className=" text-primary-hover mt-3"> Copyrights ©2024 Eduport. Build by <Link href={developedByLink} target="_blank" className="text-reset">{developedBy}</Link>.</div>
          </Col>
        </Row>
      </Container>
    </footer>;
};
export default Footer;
