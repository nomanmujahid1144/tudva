import Image from "next/image";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import { footerLinks } from "@/assets/data/footer-items";
import logo from '@/assets/images/logo.svg';
const Footer = () => {
  return <footer className="bg-dark pt-5">
    <Container>
      <Row className="g-4">
        <Col lg={4}>
          <Link className="me-0" href="/">
            <Image width={189} height={40} className="h-40px" src={logo} alt="logo" />
          </Link>
          <p className="my-3 text-body-secondary text-uppercase w-90">
            <span className="font-semibold">Free access to high-quality education</span>
            <span className="d-block text-md font-normal mt-1">
              Together we enable lifelong learning for all - free of charge and community-based.
            </span>
          </p>
        </Col>
        <Col lg={8}>
          <Row className="g-4">
            {footerLinks.map((link, idx) =>
              <Col xs={6} md={3} key={idx}>
                <h5 className="mb-2 mb-md-4 text-white">{link.title}</h5>
                <ul className="nav flex-column text-primary-hover">
                  {link.items.map((item, idx) => <li className="nav-item" key={idx}><Link className="nav-link" href={item.link ?? ""}>{item.name}</Link></li>)}
                </ul>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      <hr className="mt-4 mb-0" />
      <div className="py-3">
        <Container className="px-0">
          <div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-md-left">
            <div className="text-body-secondary"> Copyrights ©2025 151 <span className="text-uppercase">concepts</span> </div>
            <div className="nav justify-content-center mt-3 mt-lg-0">
              <ul className="list-inline mb-0">
                <li className="list-inline-item text-primary-hover"><Link className="nav-link" href={"/terms"}>Terms of use</Link></li>
                <li className="list-inline-item text-primary-hover"><Link className="nav-link pe-0" href={"/privacy-policy"}>Privacy policy</Link></li>
                <li className="list-inline-item text-primary-hover"><a className="nav-link pe-0" href="#">Imprint</a></li>
              </ul>
            </div>
          </div>
        </Container>
      </div>
    </Container>
  </footer>;
};
export default Footer;
