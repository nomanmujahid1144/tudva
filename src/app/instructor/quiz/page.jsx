import React from 'react';
import Inner from './components/Inner';
import Student from './components/Student';
export const metadata = {
  title: 'Quiz'
};
const QuizPage = () => {
  return <>
    <Inner />
    <Student />
    </>;
};
export default QuizPage;
