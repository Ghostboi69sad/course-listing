import React from 'react';
import CourseListing from "../components/course-listing";
import Navbar from '../../../src/component/Navbar/Navbar';
import Footer from '../../../src/component/footer/Footer';

const CourseListingPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <h1 className="mb-4">Course Listing</h1>
        <CourseListing />
      </div>
      <Footer />
    </div>
  );
};

export default CourseListingPage;
