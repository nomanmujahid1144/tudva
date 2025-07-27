import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export const footerLinks = [
  {
    title: "Learn",
    items: [
      {
        name: "Courses",
        link: "/courses", // Replace with your actual course catalog link
      },
      {
        name: "My Schedule",
        link: "#", // Replace with your user dashboard link
      },
      {
        name: "Why use tudva",
        link: "/why-tudva", // Replace with your explanation page
      },
      {
        name: "Get Started",
        link: "/get-started", // Replace with your guide/tutorial link
      },
    ],
  },
  {
    title: "About tudva",
    items: [
      {
        name: "Our Mission",
        link: "/our-mission", // Or /philosophie, as you mentioned
      },
      {
        name: "How it Works",
        link: "/how-it-works",
      },
      {
        name: 'What means "tudva"?',
        link: "/tudva-means", //  Or a better URL
      },
      {
        name: "About us",
        link: "/about-us",
      },
      {
        name: "Transparency",
        link: "#",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        name: "Blog",
        link: "/blogs",
      },
      {
        name: "Support",
        link: "/help/center", // Or /help, /faq, /contact
      },
      {
        name: "Become teacher",
        link: "/become-teacher",
      },
      {
        name: "Learning Rooms",
        link: "/learning-room",  // Or /locations, etc.
      },
    ],
  },
  {
    title: "Help & Contact",
    items: [
      {
        name: "Helpdesk",
        link: "/help/center",  // Link to your privacy policy
      },
      {
        name: "FAQ",
        link: "/faq",   // Link to your terms of service
      },
      {
        name: "Contact Us",
        link: "/contact-us", // Or an email address link: mailto:contact@example.com
      },
      {
        name: "Imprint",  // Legal information (if required in your region)
        link: "#", // Or /legal, etc.  Only if required!
      },
    ],
  },
];
export const footerLinks2 = [{
  name: "About",
  link: "/pages/about/about-us"
}, {
  name: "Terms"
}, {
  name: "Privacy"
}, {
  name: "Career"
}, {
  name: "Contact us"
}, {
  name: "Cookies"
}];
export const socialMediaLinks = [{
  icon: FaFacebookF,
  variant: "text-facebook"
}, {
  icon: FaInstagram,
  variant: "text-instagram"
}, {
  icon: FaTwitter,
  variant: "text-twitter"
}, {
  icon: FaLinkedinIn,
  variant: "text-linkedin"
}];
