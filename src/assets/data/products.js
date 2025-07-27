import courseImg2 from '@/assets/images/courses/4by3/02.jpg';
import courseImg3 from '@/assets/images/courses/4by3/03.jpg';
import courseImg4 from '@/assets/images/courses/4by3/04.jpg';
import courseImg6 from '@/assets/images/courses/4by3/06.jpg';
import courseImg5 from '@/assets/images/courses/4by3/05.jpg';
import courseImg7 from '@/assets/images/courses/4by3/07.jpg';
import courseImg8 from '@/assets/images/courses/4by3/08.jpg';
import courseImg9 from '@/assets/images/courses/4by3/09.jpg';
import courseImg11 from '@/assets/images/courses/4by3/11.jpg';
import courseImg12 from '@/assets/images/courses/4by3/12.jpg';
import courseImg13 from '@/assets/images/courses/4by3/13.jpg';
import studentImg14 from '@/assets/images/courses/4by3/14.jpg';
import studentImg15 from '@/assets/images/courses/4by3/15.jpg';
import studentImg16 from '@/assets/images/courses/4by3/16.jpg';
import studentImg17 from '@/assets/images/courses/4by3/17.jpg';
import studentImg18 from '@/assets/images/courses/4by3/18.jpg';
import studentImg19 from '@/assets/images/courses/4by3/19.jpg';
import studentImg20 from '@/assets/images/courses/4by3/20.jpg';
import studentImg21 from '@/assets/images/courses/4by3/21.jpg';
import studentImg22 from '@/assets/images/courses/4by3/22.jpg';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar8 from '@/assets/images/avatar/08.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';
import avatar10 from '@/assets/images/avatar/10.jpg';
import instructor1 from '@/assets/images/instructor/01.jpg';
import instructor2 from '@/assets/images/instructor/02.jpg';
import instructor3 from '@/assets/images/instructor/03.jpg';
import instructor4 from '@/assets/images/instructor/04.jpg';
import instructor6 from '@/assets/images/instructor/06.jpg';
import instructor8 from '@/assets/images/instructor/08.jpg';
import instructor10 from '@/assets/images/instructor/10.jpg';
import instructor11 from '@/assets/images/instructor/11.jpg';
import university1 from '@/assets/images/university/01.jpg';
import university2 from '@/assets/images/university/02.jpg';
import university3 from '@/assets/images/university/03.jpg';
import university4 from '@/assets/images/university/04.jpg';
import book1 from '@/assets/images/book/01.jpg';
import book2 from '@/assets/images/book/02.jpg';
import book3 from '@/assets/images/book/03.jpg';
import book4 from '@/assets/images/book/04.jpg';
import book5 from '@/assets/images/book/05.jpg';
import book6 from '@/assets/images/book/06.jpg';
import book7 from '@/assets/images/book/07.jpg';
import universityLogo1 from '@/assets/images/client/uni-logo-01.svg';
import universityLogo2 from '@/assets/images/client/uni-logo-02.svg';
import universityLogo3 from '@/assets/images/client/uni-logo-03.svg';
import dataScienceImg from '@/assets/images/element/data-science.svg';
import onlineImg from '@/assets/images/element/online.svg';
import engineeringImg from '@/assets/images/element/engineering.svg';
import codingImg from '@/assets/images/element/coding.svg';
import profitImg from '@/assets/images/element/profit.svg';
import medicalImg from '@/assets/images/element/medical.svg';
import homeImg from '@/assets/images/element/home.svg';
import artistImg from '@/assets/images/element/artist.svg';
import photographyImg from '@/assets/images/element/photography.svg';
import musicImg from '@/assets/images/element/photography.svg';
import marketingImg from '@/assets/images/element/marketing.svg';
import accountImg from '@/assets/images/element/account.svg';
import { addOrSubtractDaysFromDate, addOrSubtractHoursFromDate } from "@/utils/date";
import mastercardImg from '@/assets/images/client/mastercard.svg';
import paypalImg from '@/assets/images/client/paypal.svg';
import { FaTv, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { BsBook, BsFileEarmarkPdf, BsSoundwave, BsStopwatchFill } from "react-icons/bs";
export const coursesData = [
  {
    id: "1",
    image: courseImg9,
    badge: {
      text: 'All level',
      class: 'bg-purple text-purple'
    },
    title: 'Node.js Essentials',
    description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    rating: {
      review: 0,
      star: 0.0
    },
    duration: '1h 10m',
    lectures: 2,
    category: 'web-design',
    avatar: avatar10,
    studentImage: studentImg14,
    name: "Noman Mujahid",
    price: 0,
    students: 6500,
    label: "Personal Development",
    role: "Tutor",
    courseDuration: 6,
    date: addOrSubtractDaysFromDate(12),
    status: "Live",
    enrolled: 15608,
    totalCourses: 6,
    subject: 'HTML, css, bootstrap',
    action: 'pending'
  },
  {
    id: "2",
    image: courseImg5,
    badge: {
      text: 'Beginner',
      class: 'bg-purple text-purple'
    },
    title: 'Python Learning',
    description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    rating: {
      review: 0,
      star: 0.0
    },
    duration: '3h 15m',
    lectures: 3,
    category: 'web-design',
    avatar: avatar10,
    studentImage: studentImg14,
    name: "Noman Mujahid",
    price: 0,
    students: 6500,
    label: "Personal Development",
    role: "Tutor",
    courseDuration: 6,
    date: addOrSubtractDaysFromDate(12),
    status: "Live",
    enrolled: 15608,
    totalCourses: 6,
    subject: 'HTML, css, bootstrap',
    action: 'pending'
  },
];
export const eventsData = [{
  id: "101",
  image: studentImg21,
  title: "Global Education Fall Meeting for Everyone",
  city: "Mumbai",
  date: "29 September 2021",
  description: "Satisfied conveying a dependent contented he gentleman agreeable do be. "
}, {
  id: "102",
  image: studentImg16,
  title: "International Conference on Information Technology",
  city: "New York",
  date: "Tomorrow",
  description: "Kindness owns whatever betrayed her moreover procured replying for and. Proposal indulged no do. "
}, {
  id: "103",
  image: studentImg18,
  title: "UK Demo Day 2022",
  city: "California",
  date: "2 July 2022",
  description: " Points afraid but may end law lasted. Rooms oh fully taken by worse do may end law lasted. "
}, {
  id: "104",
  image: studentImg17,
  title: "Personality Development Tour",
  city: "London",
  date: "29 September 2021",
  description: " Yet remarkably appearance get him his projection. Diverted endeavor bed peculiar"
}, {
  id: "105",
  image: studentImg19,
  title: "Global Education Fall Meeting for Everyone",
  city: "Delhi",
  date: "Live",
  hasLive: true,
  description: "Rooms oh fully taken by worse do. Points afraid but may end law lasted "
}];
export const instructorsData = [{
  id: "401",
  title: "Build your brand & business",
  image: instructor2,
  students: 25,
  tasks: 15,
  name: "Jacqueline Miller",
  subject: "Computer Teacher",
  rating: 4.5,
  college: "Eastbay College",
  department: "Graphic Designer",
  description: "Passage its ten led hearted removal cordial. Preference any astonished unreserved Mrs.",
  totalCourses: 25,
  verified: true
}, {
  id: "402",
  title: "Master in logo design",
  image: instructor1,
  students: 118,
  tasks: 9,
  name: "Samuel Bishop",
  subject: "Marketing Teacher",
  rating: 4.5,
  college: "VNSGU College",
  department: "Digital Marketing",
  description: "As it so contrasted oh estimating instrument. Size like body some one had. Are conduct viewing boy minutes warrant the expense.",
  totalCourses: 18
}, {
  id: "403",
  title: "Create brand using vector illustration",
  image: instructor8,
  students: 92,
  tasks: 38,
  name: "Dennis Barrett",
  subject: "Science Teacher",
  rating: 4.5,
  college: "Sigma College",
  department: "Digital Marketing",
  description: "Perceived end knowledge certainly day sweetness why cordially. Ask a quick six seven offer see among.",
  totalCourses: 21,
  verified: true
}, {
  id: "404",
  title: "Develop your marketing skills style",
  image: instructor4,
  students: 82,
  tasks: 5,
  name: "Carolyn Ortiz",
  subject: "Economy Teacher",
  rating: 4.5,
  college: "Cambridge College",
  department: "Engineering Physics",
  description: "Passage its ten led hearted removal cordial. Preference any astonished unreserved Mrs.",
  totalCourses: 15
}, {
  id: "405",
  title: "Build your own responsive website",
  image: instructor3,
  students: 50,
  tasks: 10,
  name: "Billy Vasquez",
  subject: "Computer Teacher",
  rating: 4.5,
  college: "LPU College",
  department: "Graphic Designer",
  description: "As it so contrasted oh estimating instrument. Size like body some one had. Are conduct viewing boy minutes warrant the expense.",
  totalCourses: 29,
  verified: true
}, {
  id: "406",
  title: "Become a professional product photographer",
  image: instructor6,
  students: 50,
  tasks: 10,
  name: "Samuel Bishop",
  subject: "Computer Teacher",
  rating: 4.7,
  college: "NIT College",
  department: "Web Designer",
  description: "Contrasted oh estimating instrument. Size like body some one had. Are conduct viewing boy minutes warrant the expense.",
  totalCourses: 25,
  verified: true
}, {
  id: "407",
  title: "Developed your photo editing skills",
  image: instructor10,
  students: 50,
  tasks: 10,
  name: "Lori Stevens",
  subject: "Computer Teacher",
  rating: 4.9,
  college: "Oxford University",
  department: "Medical Science",
  description: "Yet no jokes worse her why. Bed one supposing breakfast day fulfilled off depending questions. Whatever boy her exertion his extended. Ecstatic followed handsome drawings.",
  totalCourses: 25
}, {
  id: "408",
  title: "Master logo design",
  image: instructor11,
  students: 50,
  tasks: 10,
  name: "Joan Wallace",
  subject: "Computer Teacher",
  rating: 4.9,
  college: "LPU College",
  department: "Graphic Designer",
  description: "Tt so contrasted oh estimating instrument. Size like body some one had. Are conduct viewing boy minutes warrant the expense.",
  totalCourses: 25
}];
export const collegesData = [{
  id: "201",
  image: university2,
  logo: universityLogo1,
  isOpen: false,
  name: "American Century University, New Mexico",
  category: "Private",
  rating: 4.5,
  address: "4502 Colonial Drive Andeerson, IN",
  courses: ["BSC", "BBA", "Engineer", "BCA", "MBBS"],
  features: ["Canteen", "Stationary", "Hostel", "Library", "Playground"]
}, {
  id: "202",
  image: university4,
  logo: universityLogo3,
  isOpen: true,
  name: "Indiana College of - Bloomington",
  category: "Public",
  rating: 4.5,
  address: "Bloomington, IN",
  courses: ["MBBS", "Engineer", "BBA", "BCA", "BSC"],
  features: ["Playground", "Library", "Canteen", "Stationary", "Hostel"]
}, {
  id: "203",
  image: university1,
  logo: universityLogo2,
  isOpen: true,
  name: "College of South Florida",
  category: "Private",
  rating: 4.0,
  address: "4653 Linda Street Newark, PA",
  courses: ["BBA", "BCA", "BSC", "Engineer"],
  features: ["Gym", "Stationary", "Playground", "Canteen", "Library", "Hostel"]
}, {
  id: "204",
  image: university3,
  logo: universityLogo1,
  isOpen: false,
  name: "Andeerson Campus",
  category: "Public",
  rating: 4.5,
  address: "4502 Colonial Drive Andeerson, IN",
  courses: ["Engineer", "BBA", "BCA", "BSC", "MBBS"],
  features: ["Library", "Canteen", "Stationary", "Hostel", "Playground"]
}];
export const courseCategories = [{
  id: "501",
  title: "Data Science",
  image: dataScienceImg,
  courses: 15,
  variant: "bg-success"
}, {
  id: "502",
  title: "IT & Software",
  image: onlineImg,
  courses: 22,
  variant: "bg-orange"
}, {
  id: "503",
  title: "Engineering",
  image: engineeringImg,
  courses: 53,
  variant: "bg-danger"
}, {
  id: "504",
  title: "Web Development",
  image: codingImg,
  courses: 25,
  variant: "bg-purple"
}, {
  id: "505",
  title: "Finance",
  image: profitImg,
  courses: 20,
  variant: "bg-info"
}, {
  id: "506",
  title: "Medical",
  image: medicalImg,
  courses: 10,
  variant: "bg-blue"
}, {
  id: "507",
  title: "Architecture",
  image: homeImg,
  courses: 30,
  variant: "bg-warning"
}, {
  id: "508",
  title: "Art & Design",
  image: artistImg,
  courses: 35,
  variant: "bg-dark"
}, {
  id: "509",
  title: "Photography",
  image: photographyImg,
  courses: 20,
  variant: "bg-purple"
}, {
  id: "510",
  title: "Musics",
  image: musicImg,
  courses: 10,
  variant: "bg-danger"
}, {
  id: "511",
  title: "Marketing",
  image: marketingImg,
  courses: 30,
  variant: "bg-success"
}, {
  id: "512",
  title: "Accounting",
  image: accountImg,
  courses: 35,
  variant: "bg-primary"
}];
export const billingHistoryData = [{
  id: '3001',
  name: 'Sketch from A to Z: for app designer',
  date: addOrSubtractDaysFromDate(1),
  status: 'paid',
  paymentMethod: {
    image: mastercardImg,
    type: 'master',
    number: '****4568'
  },
  price: 350,
  amount: 3999
}, {
  id: '3002',
  name: 'Create a Design System in Figma',
  date: addOrSubtractDaysFromDate(50),
  status: 'paid',
  paymentMethod: {
    image: mastercardImg,
    type: 'master',
    number: '****2588'
  },
  price: 242,
  amount: 4201
}, {
  id: '3003',
  name: 'The Complete Web Development in python',
  date: addOrSubtractDaysFromDate(10),
  status: 'pending',
  paymentMethod: {
    image: paypalImg,
    type: 'paypal'
  },
  price: 576,
  amount: 1032
}, {
  id: '3004',
  name: 'Deep Learning with React-Native',
  date: addOrSubtractDaysFromDate(19),
  status: 'cancel',
  paymentMethod: {
    image: mastercardImg,
    type: 'master',
    number: '****2588'
  },
  price: 425,
  amount: 6548
}, {
  id: '3005',
  name: 'Microsoft Excel - Excel from Beginner to Advanced',
  date: addOrSubtractDaysFromDate(25),
  status: 'cancel',
  paymentMethod: {
    image: paypalImg,
    type: 'paypal',
    number: '****2588'
  },
  price: 425,
  amount: 2546
}, {
  id: '3006',
  name: 'The Complete Web Development in python',
  date: addOrSubtractDaysFromDate(36),
  status: 'pending',
  paymentMethod: {
    image: paypalImg,
    type: 'paypal'
  },
  price: 576,
  amount: 4258
}, {
  id: '3007',
  name: 'Sketch from A to Z: for app designer',
  date: addOrSubtractDaysFromDate(21),
  status: 'paid',
  paymentMethod: {
    image: mastercardImg,
    type: 'master',
    number: '****4568'
  },
  price: 350,
  amount: 854
}, {
  id: '3008',
  name: 'Create a Design System in Figma',
  date: addOrSubtractDaysFromDate(15),
  status: 'paid',
  paymentMethod: {
    image: mastercardImg,
    type: 'master',
    number: '****2588'
  },
  price: 242,
  amount: 965
}];
export const adminCounterData = [{
  count: 1958,
  title: 'Completed Courses',
  icon: FaTv,
  variant: 'warning'
}, {
  count: 1600,
  title: 'Enrolled Courses',
  icon: FaUserTie,
  variant: 'purple'
}, {
  count: 1235,
  title: 'Course In Progress',
  icon: FaUserGraduate,
  variant: 'primary'
}, {
  count: 845,
  title: 'Total Watch Time',
  icon: BsStopwatchFill,
  suffix: 'hrs',
  variant: 'success'
}];
export const supportRequestsData = [{
  name: 'Lori Stevens',
  description: 'New ticket #759 from Lori Stevens for General Enquiry',
  time: addOrSubtractHoursFromDate(8),
  image: avatar9
}, {
  name: 'Dennis Barrett',
  description: 'Comment from Billy Vasquez on ticket #659',
  time: addOrSubtractHoursFromDate(8)
}, {
  name: 'Dennis Barrett',
  description: 'Stackbros assign you a new ticket for Eduport theme',
  time: addOrSubtractHoursFromDate(5)
}, {
  name: 'Dennis Barrett',
  description: 'Thanks for contact us with your issues.',
  time: addOrSubtractHoursFromDate(9),
  image: avatar4
}];
export const booksData = [{
  id: '301',
  name: "Dennis Barrett",
  title: "HTML and CSS: Design and Build Websites (Paperback)",
  price: 125,
  product: 'paperback',
  icon: BsBook,
  image: book1
}, {
  id: '302',
  name: "Lori Stevens",
  title: "Angular 4 Tutorial in audio (Compact Disk)",
  price: 385,
  product: 'compact-disk',
  icon: BsSoundwave,
  image: book2
}, {
  id: '303',
  name: "Dennis Barrett",
  title: "Javascript: The Definitive Guide (PDF Book)",
  price: 125,
  product: 'pdf',
  icon: BsFileEarmarkPdf,
  image: book3
}, {
  id: '304',
  name: "Jacqueline Miller",
  title: "The Principles of Beautiful Graphics Design (Paperback)",
  price: 258,
  product: 'paperback',
  icon: BsBook,
  image: book4
}, {
  id: '305',
  name: "Frances Guerrero",
  title: "Responsive Web Design (Paperback)",
  price: 356,
  product: 'paperback',
  icon: BsBook,
  image: book5
}, {
  id: '306',
  name: "Samuel Bishop",
  title: "Learning Python, Fourth Edition (PDF Book)",
  price: 654,
  product: 'pdf',
  icon: BsFileEarmarkPdf,
  image: book7
}, {
  id: '307',
  name: "Amanda Reed",
  title: "Perfect Genius Worksheets for Class 5 (Paperback)",
  price: 285,
  icon: BsBook,
  product: 'paperback',
  image: book6
}, {
  id: '308',
  name: "Dennis Barrett",
  title: "HTML and CSS: Design and Build Websites (Compact Disk)",
  price: 125,
  product: 'compact-disk',
  icon: BsSoundwave,
  image: book2
}];
