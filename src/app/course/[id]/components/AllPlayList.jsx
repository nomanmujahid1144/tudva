"use client";

import { Card, CardBody } from "react-bootstrap";
import Playlist from "./Playlist";
import { FaBookOpen } from "react-icons/fa";

const AllPlayList = ({ course, onVideoSelect, selectedVideo }) => {
  // Ensure course and modules exist
  const modules = course?.modules || {};

  // If no modules exist, create a default empty module
  if (Object.keys(modules).length === 0) {
    console.log('No modules found in AllPlayList, creating default empty module');
    modules['Module 1'] = [];
  }

  // Count total lectures across all modules
  const totalLectures = Object.values(modules).reduce(
    (total, lectures) => total + (Array.isArray(lectures) ? lectures.length : 0),
    0
  );

  // Create a modified course object with the updated modules
  const modifiedCourse = {
    ...course,
    modules: modules
  };

  console.log('Modified course in AllPlayList:', modifiedCourse);

  return (
    <Card className="shadow p-0 mb-4">
      <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 border-bottom">
        <h4 className="mb-0 text-primary">
          <FaBookOpen className="me-2" />
          Course Content
        </h4>
        <span className="badge bg-primary">{totalLectures} lectures</span>
      </div>
      <CardBody className="p-3">
        <Playlist course={modifiedCourse} onVideoSelect={onVideoSelect} selectedVideo={selectedVideo} />
      </CardBody>
    </Card>
  );
};

export default AllPlayList;
