import { useLayoutContext } from "@/context/useLayoutContext";
import { useAuth } from "@/context/AuthContext";
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";
import { BsGear, BsInfoCircle, BsPerson, BsPower } from "react-icons/bs";
import { useLocale, useTranslations } from "next-intl";
import avatar1 from '@/assets/images/avatar/01.jpg';
import { toSentenceCase } from "@/utils/change-casing";
import clsx from "clsx";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ProfileDropdown = ({ className }) => {
  const t = useTranslations('navbar.profile');
  const { changeTheme, theme } = useLayoutContext();
  const { user, logout, isAuthenticated } = useAuth();
  const locale = useLocale();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Toast is now handled in AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('logoutError'));
    }
  }

  // Default placeholder and avatar images
  const defaultAvatar = avatar1.src;
  const placeholderImage = '/assets/images/avatar/placeholder.svg';

  // Use state to track profile picture
  const [profilePicture, setProfilePicture] = useState('');

  // Handle image loading error
  const handleImageError = () => {
    // Silent fail - placeholder will be shown via state
  };

  // Update profile picture when user changes - guard against invalid values
  useEffect(() => {
    if (user?.profilePicture && typeof user.profilePicture === 'string') {
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  // Determine profile link based on user role
  const getProfileLink = () => {
    if (!user) return `${locale}/auth/sign-in`;

    switch (user.role) {
      case 'instructor':
        return `${locale}/instructor/profile`;
      case 'admin':
        return `${locale}/admin/profile`;
      default:
        return `${locale}/student/profile`;
    }
  };

  return (
    <Dropdown drop="start" className={`profile-dropdown ${className}`}>
      <DropdownToggle 
        as='a' 
        className="avatar avatar-sm p-0 arrow-none" 
        id="profileDropdown" 
        role="button" 
        data-bs-auto-close="outside" 
        data-bs-display="static" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        {profilePicture ? (
          <img
            className="avatar-img border rounded-circle"
            src={profilePicture}
            alt="avatar"
            width={40}
            height={40}
            onError={handleImageError}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="avatar-img rounded-circle border border-white shadow bg-light d-flex align-items-center justify-content-center mx-auto"
            style={{ fontSize: '1rem', border: '4px solid #f8f9fa' }}
          >
            {(user?.fullName || 'User').charAt(0).toUpperCase()}
          </div>
        )}
      </DropdownToggle>
      <DropdownMenu 
        as='ul' 
        className="dropdown-animation dropdown-menu-end shadow pt-3" 
        aria-labelledby="profileDropdown"
      >
        <li className="px-3 mb-3">
          <div className="d-flex align-items-center">
            <div className="avatar me-3">
              {profilePicture ? (
                <img
                  className="avatar-img border rounded-circle shadow"
                  src={profilePicture}
                  alt="avatar"
                  width={40}
                  height={40}
                  onError={handleImageError}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="avatar-img rounded-circle border border-white shadow bg-light d-flex align-items-center justify-content-center mx-auto"
                  style={{ fontSize: '1rem', border: '4px solid #f8f9fa' }}
                >
                  {(user?.fullName || 'User').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <a className="h6" href="#">{user?.fullName || user?.name || 'User'}</a>
              <p className="small m-0">{user?.email || ''}</p>
            </div>
          </div>
        </li>
        <li> <DropdownDivider /></li>
        <li>
          <DropdownItem href={getProfileLink()}>
            <BsPerson className="fa-fw me-2" />
            {t('profileAndAccount')}
          </DropdownItem>
        </li>
        {isAuthenticated && user?.role === 'learner' ? (
          <>
            <li>
              <DropdownItem href="/favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="fa-fw me-2 bi bi-heart-fill" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                </svg>
                {t('favoriteCourses')}
              </DropdownItem>
            </li>
          </>
        ) : null}
        <li>
          <DropdownItem href={`${locale}/help/center`}>
            <BsInfoCircle className="fa-fw me-2" />
            {t('help')}
          </DropdownItem>
        </li>
        <li>
          <p className="dropdown-item bg-danger-soft-hover cursor-pointer" onClick={handleLogout}>
            <BsPower className="fa-fw me-2" />
            {t('signOut')}
          </p>
        </li>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;