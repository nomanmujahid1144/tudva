import { BsAward, BsLaptop } from "react-icons/bs";
import { FaGraduationCap, FaUserGraduate } from "react-icons/fa";
export const aboutData = [{
  title: "Undergraduate",
  subTitle: "Onsite",
  icon: FaUserGraduate,
  variant: "bg-warning"
}, {
  title: "Graduate",
  subTitle: "Online + Onsite",
  icon: FaGraduationCap,
  variant: "bg-info"
}, {
  title: "Post Graduate",
  subTitle: "Online + Onsite",
  icon: BsAward,
  variant: "bg-danger"
}, {
  title: "Online education",
  subTitle: "Coming soon...",
  icon: BsLaptop,
  variant: "bg-purple"
}];
export const counterData = [{
  title: "Total Instructors",
  count: 89,
  suffix: ""
}, {
  title: "Total Campuses",
  count: 12,
  suffix: ""
}, {
  title: "Students till date",
  count: 180,
  suffix: "K"
}, {
  title: "Types of Courses",
  count: 23,
  suffix: "+"
}];
