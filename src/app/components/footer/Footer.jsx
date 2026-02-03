"use client";

import Image from "next/image";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslations, useLocale } from "next-intl";
import { footerLinks } from "@/assets/data/footer-items";
import logo from '@/assets/images/logo.svg';

const Footer = () => {
  const t = useTranslations('footer');
  const locale = useLocale(); // ADD THIS
  
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  // Helper to translate footer links
  const translateFooterLink = (key) => {
    // Extract the path after 'footer.'
    const path = key.replace('footer.', '');
    return t(path);
  };

  // Helper to add locale to links
  const getLocalizedLink = (link) => {
    if (!link) return "";
    
    // If link already starts with locale, return as is
    if (link.startsWith(`/${locale}/`)) {
      return link;
    }
    
    // If link is just "/", return with locale
    if (link === "/") {
      return `/${locale}`;
    }
    
    // Add locale prefix to link
    return `/${locale}${link}`;
  };

  return (
    <footer className="bg-dark pt-5">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Link className="me-0" href={getLocalizedLink("/")}>
              <Image width={189} height={40} className="h-40px" src={logo} alt="logo" />
            </Link>
            <p className="my-3 text-body-secondary text-uppercase w-90">
              <span className="font-semibold">{t('tagline.title')}</span>
              <span className="d-block text-md font-normal mt-1">
                {t('tagline.description')}
              </span>
            </p>
          </Col>
          <Col lg={8}>
            <Row className="g-4">
              {footerLinks.map((link, idx) => (
                <Col xs={6} md={3} key={idx}>
                  <h5 className="mb-2 mb-md-4 text-white">
                    {translateFooterLink(link.title)}
                  </h5>
                  <ul className="nav flex-column text-primary-hover">
                    {link.items.map((item, idx) => (
                      <li className="nav-item" key={idx}>
                        <Link className="nav-link" href={getLocalizedLink(item.link)}>
                          {translateFooterLink(item.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <hr className="mt-4 mb-0" />
        <div className="py-3">
          <Container className="px-0">
            <div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-md-left">
              <div className="text-body-secondary">
                {t('copyright', { year: currentYear })} <span className="text-uppercase">{t('company')}</span>
              </div>
              <div className="nav justify-content-center mt-3 mt-lg-0">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item text-primary-hover">
                    <Link className="nav-link" href={getLocalizedLink("/terms")}>
                      {t('legal.termsOfUse')}
                    </Link>
                  </li>
                  <li className="list-inline-item text-primary-hover">
                    <Link className="nav-link pe-0" href={getLocalizedLink("/privacy-policy")}>
                      {t('legal.privacyPolicy')}
                    </Link>
                  </li>
                  <li className="list-inline-item text-primary-hover">
                    <Link className="nav-link pe-0" href={getLocalizedLink("/imprint")}>
                      {t('legal.imprint')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;