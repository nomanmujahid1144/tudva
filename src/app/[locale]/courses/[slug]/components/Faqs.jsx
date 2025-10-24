"use client";

import { Fragment } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";
import clsx from "clsx";

const Faqs = ({ faqs }) => {
  // Use provided FAQs or fallback to empty array
  const faqList = faqs || [];
  
  if (faqList.length === 0) {
    return (
      <div className="alert alert-info">
        <h6 className="mb-0">No FAQs available for this course yet.</h6>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <FaQuestionCircle className="text-primary me-2" />
        <h5 className="mb-0">Frequently Asked Questions</h5>
      </div>
      
      <Accordion defaultActiveKey="0" className="accordion-icon accordion-bg-light" id="faqAccordion">
        {faqList.map((faq, idx) => (
          <AccordionItem 
            key={idx} 
            eventKey={`${idx}`} 
            className={clsx({
              "mb-3": faqList.length - 1 != idx
            })}
          >
            <AccordionHeader as="h6" className="font-base" id={`faq-heading-${idx}`}>
              <div className="fw-bold rounded d-sm-flex d-inline-block collapsed">
                <span className="text-secondary fw-bold me-2">0{idx + 1}.</span>
                {faq.question}
              </div>
            </AccordionHeader>
            
            <AccordionBody className="mt-2">
              {typeof faq.answer === 'string' && faq.answer.includes('<') ? (
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              ) : (
                <p className="mb-0">{faq.answer}</p>
              )}
            </AccordionBody>
          </AccordionItem>
        ))}
      </Accordion>
      
      <style jsx>{`
        :global(.accordion-item) {
          background-color: var(--bs-accordion-bg);
          border: var(--bs-accordion-border-width) solid var(--bs-accordion-border-color);
          border-radius: var(--bs-accordion-border-radius);
        }
        
        :global(.accordion-bg-light .accordion-item) {
          background-color: var(--bs-light);
        }
        
        :global(.accordion-icon .accordion-button::after) {
          background-image: none;
          content: "+";
          font-size: 1.5rem;
          line-height: 0.7;
          font-weight: 500;
          height: auto;
          width: auto;
          color: var(--bs-body-color);
        }
        
        :global(.accordion-icon .accordion-button:not(.collapsed)::after) {
          content: "-";
        }
      `}</style>
    </>
  );
};

export default Faqs;