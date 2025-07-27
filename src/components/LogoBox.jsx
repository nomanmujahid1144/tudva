import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import logoLight from '@/assets/images/logo-light.svg';
const LogoBox = ({
  height,
  width
}) => {
  return <Link className="navbar-brand" href="/">
      <Image height={height} width={width} className="light-mode-item navbar-brand-item w-auto" src={logo} alt="logo" />
      <Image height={height} width={width} className="dark-mode-item navbar-brand-item w-auto" src={logo} alt="logo" />
    </Link>;
};
export default LogoBox;
