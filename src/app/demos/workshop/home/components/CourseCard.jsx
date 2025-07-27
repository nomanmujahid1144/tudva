import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardTitle } from "react-bootstrap";
import { BsArrowRight } from "react-icons/bs";
const CourseCard = ({
  course
}) => {
  const {
    image,
    name,
    title
  } = course;
  return <Card className="border bg-transparent h-100">
      <Image src={image} className="card-img-top" alt="course image" />
      <CardBody>
        <CardTitle className="fw-normal"><Link href="/course/detail" className="stretched-link">{title}</Link></CardTitle>
        <div className="d-sm-flex justify-content-between align-items-center">
          <h6 className="mb-0">{name}</h6>
          <a href="#" className="btn btn-link p-0 mb-0">View detail<BsArrowRight className="ms-2" /></a>
        </div>
      </CardBody>
    </Card>;
};
export default CourseCard;
