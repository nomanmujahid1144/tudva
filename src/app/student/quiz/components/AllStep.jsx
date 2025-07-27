'use client';

import useBSStepper from '@/hooks/useBSStepper';
import React, { useEffect, useRef, useState } from 'react';
import { BsClockHistory } from 'react-icons/bs';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
const Countdown = () => {
  const [timer, setTimer] = useState(90);
  const timerToString = () => {
    let hours = ('0' + Math.floor(timer / 3600)).slice(-2);
    let minutes = ('0' + Math.floor(timer / 60)).slice(-2);
    let seconds = ('0' + timer % 60).slice(-2);
    return hours + ":" + minutes + ":" + seconds;
  };
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    }
  }, [timer]);
  return <h6 className="text-danger text-end mb-0"><BsClockHistory className="bi bi-clock-history me-1" />Time Left: {timerToString()}</h6>;
};
const AllStep = () => {
  const stepperRef = useRef(null);
  const stepperInstance = useBSStepper(stepperRef);
  useEffect(() => {
    stepperInstance?.to(2);
    stepperInstance?.to(1);
  }, [stepperInstance]);
  return <CardBody>
      <Card className="bg-transparent border rounded-3 mb-1">
        <div id="stepper" ref={stepperRef} className="bs-stepper stepper-outline">
          <CardHeader className="bg-light border-bottom px-lg-5">
            <div className="bs-stepper-header" role="tablist">
              <div className="step" data-target="#step-1">
                <div className="d-grid text-center align-items-center">
                  <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger1" aria-controls="step-1">
                    <span className="bs-stepper-circle">1</span>
                  </button>
                </div>
              </div>
              <div className="line" />
              <div className="step" data-target="#step-2">
                <div className="d-grid text-center align-items-center">
                  <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger2" aria-controls="step-2">
                    <span className="bs-stepper-circle">2</span>
                  </button>
                </div>
              </div>
              <div className="line" />
              <div className="step" data-target="#step-3">
                <div className="d-grid text-center align-items-center">
                  <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger3" aria-controls="step-3">
                    <span className="bs-stepper-circle">3</span>
                  </button>
                </div>
              </div>
              <div className="line" />
              <div className="step" data-target="#step-4">
                <div className="d-grid text-center align-items-center">
                  <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger4" aria-controls="step-4">
                    <span className="bs-stepper-circle">4</span>
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Countdown />
            <div className="bs-stepper-content">
              <Step1 stepperInstance={stepperInstance} />
              <Step2 stepperInstance={stepperInstance} />
              <Step3 stepperInstance={stepperInstance} />
              <Step4 stepperInstance={stepperInstance} />
            </div>
          </CardBody>
        </div>
      </Card>
    </CardBody>;
};
export default AllStep;
