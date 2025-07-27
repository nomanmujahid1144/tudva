import { currency } from "@/context/constants";
import { getAllCourses } from "@/helpers/data";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardTitle, Col, Container, Row } from "react-bootstrap";
import { FaRegBookmark, FaRegClock, FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from "react-icons/fa";


const SearchCourses = async () => {

    return <section className="pt-0 pt-lg-5">
        <Container>
            <Row className="mb-4 align-items-center text-center justify-content-center">
                <Col sm={12}>
                    <p className="my-md-0 my-3 merienda-text xxx-large">Dive into 300 Lessons with 2528 individual modules.</p>
                    <p className="mb-3 xx-large text-center text-md-end">Learn anything you want – it&apos;s always free!</p>
                    <div className="d-flex justify-content-center w-100">
                    <form className="border rounded p-2 mb-4 w-100 w-md-50">
                        <div className="input-group">
                            <input className="form-control border-0 me-1" type="search" placeholder="Find your course (by course name or topic)" />
                            <button type="button" className="btn btn-danger mb-0 rounded"><FaSearch /></button>
                        </div>
                    </form>
                    </div>
                </Col>
            </Row>
        </Container>
    </section>;
};
export default SearchCourses;
