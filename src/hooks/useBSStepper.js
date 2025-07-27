import Stepper from 'bs-stepper';
import { useEffect, useState } from 'react';
import 'bs-stepper/dist/css/bs-stepper.min.css';
const useBSStepper = stepperRef => {
  const [stepperInstance, setStepperInstance] = useState();
  useEffect(() => {
    if (stepperRef.current && !stepperInstance) {
      setStepperInstance(new Stepper(stepperRef.current, {
        linear: false,
        animation: true
      }));
    }
    return () => stepperInstance?.destroy();
  }, []);
  return stepperInstance;
};
export default useBSStepper;
