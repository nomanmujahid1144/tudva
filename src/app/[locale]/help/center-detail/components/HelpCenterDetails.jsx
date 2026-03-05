'use client';

import useViewPort from '@/hooks/useViewPort';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { FaRegThumbsDown, FaRegThumbsUp } from 'react-icons/fa';
import Sticky from 'react-sticky-el';
import { tabsData } from '../data';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

// Reusable helpful footer
const HelpfulFooter = ({ t, radioPrefix }) => (
  <CardFooter className="bg-transparent border-0 py-0 px-0">
    <div className="border p-3 rounded d-sm-flex align-items-center justify-content-between text-center">
      <h5 className="m-0">{t('helpful.question')}</h5>
      <small className="py-2 d-block">{t('helpful.stats')}</small>
      <div className="btn-group" role="group">
        <input type="radio" className="btn-check" name={`btnradio-${radioPrefix}`} id={`btnradio-yes-${radioPrefix}`} />
        <label className="btn btn-outline-light btn-sm mb-0" htmlFor={`btnradio-yes-${radioPrefix}`}>
          <FaRegThumbsUp className="me-1" /> {t('helpful.yes')}
        </label>
        <input type="radio" className="btn-check" name={`btnradio-${radioPrefix}`} id={`btnradio-no-${radioPrefix}`} />
        <label className="btn btn-outline-light btn-sm mb-0" htmlFor={`btnradio-no-${radioPrefix}`}>
          {t('helpful.no')} <FaRegThumbsDown className="ms-1" />
        </label>
      </div>
    </div>
  </CardFooter>
);

const HelpCenterDetails = () => {
  const t = useTranslations('help.centerDetail.content');
  const [hash, setHash] = useState();
  const { width } = useViewPort();

  useEffect(() => {
    if (!hash) setHash(window.location.hash);
    const timeout = setTimeout(() => {
      if (window.location.hash && document) {
        const element = document?.querySelector(window.location.hash);
        if (element) element.scrollIntoView();
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section>
      <Container data-sticky-container>
        <Row className="g-4">

          {/* Sticky sidebar nav */}
          <Col md={3}>
            <Sticky
              disabled={width <= 768}
              topOffset={80}
              bottomOffset={0}
              boundaryElement="div.row"
              hideOnBoundaryHit={false}
              stickyStyle={{ transition: '0.2s all linear' }}
            >
              <div id="nav-scroll" className="navbar">
                <nav className="nav nav-pills nav-pill-soft flex-column">
                  {tabsData.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        className={clsx('nav-link', hash === item.id && 'active')}
                        href={item.id}
                      >
                        <Icon className="me-2" />
                        {t(`tabs.tab${idx + 1}`)}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </Sticky>
          </Col>

          {/* Main content */}
          <Col md={9}>
            <div className="nav-scroll" data-bs-spy="scroll" data-bs-target="#nav-scroll" data-bs-smooth-scroll="true" tabIndex={0}>

              {/* ─── Section 1: Get Started ─────────────────── */}
              <div id="item-1">
                <Card className="bg-transparent">
                  <CardHeader className="bg-transparent border-bottom py-0 px-0">
                    <h2>{t('section1.title')}</h2>
                    <ul className="nav nav-divider mb-3">
                      <li className="nav-item">{t('section1.lastUpdated')}</li>
                      <li className="nav-item">{t('section1.author')}</li>
                    </ul>
                  </CardHeader>
                  <CardBody className="px-0 pb-0">
                    <p>{t('section1.p1')}</p>
                    <h5 className="mt-4">{t('section1.tableTitle')}</h5>
                    <p>{t('section1.p2')}</p>
                    <div className="alert alert-warning" role="alert">
                      <strong>{t('section1.noteLabel')} </strong>{t('section1.note')}
                    </div>
                    <p>{t('section1.p3')}</p>
                    <ul>
                      {[1,2,3,4,5].map(i => (
                        <li key={i}>{t(`section1.li${i}`)}</li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </div>

              <div className="text-center h5 my-5">. . .</div>

              {/* ─── Section 2: Account Setup ───────────────── */}
              <div id="item-2">
                <Card className="bg-transparent">
                  <CardHeader className="bg-transparent border-bottom py-0 px-0">
                    <h2>{t('section2.title')}</h2>
                  </CardHeader>
                  <CardBody className="px-0">
                    <p>{t('section2.p1')}</p>
                    <h5 className="mt-4">{t('section2.deactivateTitle')}</h5>
                    <ul>
                      {[1,2,3,4].map(i => (
                        <li key={i}>{t(`section2.li${i}`)}</li>
                      ))}
                    </ul>
                    <h5 className="mt-4">{t('section2.afterTitle')}</h5>
                    <ul>
                      {[1,2,3].map(i => (
                        <li key={i}>{t(`section2.afterLi${i}`)}</li>
                      ))}
                    </ul>
                    <h5 className="mt-4">{t('section2.relatedTitle')}</h5>
                    <ul className="list-group list-group-borderless mb-3">
                      {[1,2,3,4].map(i => (
                        <li key={i} className="list-group-item d-flex pb-0">
                          <Link href="#" className="mb-0">{t(`section2.relatedLink${i}`)}</Link>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                  <HelpfulFooter t={t} radioPrefix="2" />
                </Card>
              </div>

              <div className="text-center h5 my-5">. . .</div>

              {/* ─── Section 3: Other Topics ────────────────── */}
              <div id="item-3">
                <Card className="bg-transparent">
                  <CardHeader className="bg-transparent border-bottom py-0 px-0">
                    <h2>{t('section3.title')}</h2>
                  </CardHeader>
                  <CardBody className="px-0">
                    <p>{t('section3.p1')}</p>
                    <p>{t('section3.p2')}</p>
                    <h5 className="mt-4">{t('section3.helpTitle')}</h5>
                    <ul className="list-group list-group-borderless mb-3">
                      {[1,2,3].map(i => (
                        <li key={i} className="list-group-item d-flex pb-0">
                          <a href="#" className="mb-0">{t(`section3.helpLink${i}`)}</a>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                  <HelpfulFooter t={t} radioPrefix="3" />
                </Card>
              </div>

              <div className="text-center h5 my-5">. . .</div>

              {/* ─── Section 4: Advanced Usage ──────────────── */}
              <div id="item-4">
                <Card className="bg-transparent">
                  <CardHeader className="bg-transparent border-bottom py-0 px-0">
                    <h2>{t('section4.title')}</h2>
                  </CardHeader>
                  <CardBody className="px-0">
                    <p>{t('section4.p1')}</p>
                    <p>{t('section4.p2')}</p>
                    <p>{t('section4.p3')}</p>
                  </CardBody>
                  <HelpfulFooter t={t} radioPrefix="4" />
                </Card>
              </div>

            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HelpCenterDetails;