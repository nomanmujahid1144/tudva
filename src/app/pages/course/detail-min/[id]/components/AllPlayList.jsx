"use client";

import { Col } from "react-bootstrap";
import Playlist from "./Playlist";
import useViewPort from "@/hooks/useViewPort";

const AllPlayList = ({ course, onVideoSelect }) => {
  const { width } = useViewPort();
  
  return (
    <>
      {width >= 992 && (
        <Col xs={12}>
          <Playlist course={course} onVideoSelect={onVideoSelect} />
        </Col>
      )}
    </>
  );
};

export default AllPlayList;