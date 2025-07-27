"use client";

import { Col } from "react-bootstrap";
import EnhancedPlaylist from "./EnhancedPlaylist";
import useViewPort from "@/hooks/useViewPort";

const EnhancedAllPlayList = ({ course, onVideoSelect }) => {
  const { width } = useViewPort();
  
  return (
    <>
      {width >= 992 && (
        <Col xs={12}>
          <EnhancedPlaylist course={course} onVideoSelect={onVideoSelect} />
        </Col>
      )}
    </>
  );
};

export default EnhancedAllPlayList;
