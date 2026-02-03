// components/TopNavbar/components/LanguageSwitcher.jsx
"use client";

import { Dropdown } from "react-bootstrap";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const languages = [
  { code: 'en', name: 'English', flag: 'gb' }, // Using GB for English
  { code: 'hu', name: 'Hungarian', flag: 'hu' },
  { code: 'de', name: 'German', flag: 'de' }
];

const LanguageSwitcher = ({ className = "" }) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale) => {
    // Remove current locale from pathname and add new locale
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <Dropdown className={`nav-item ${className}`}>
      <Dropdown.Toggle 
        as="a" 
        className="nav-link arrow-none d-flex align-items-center cursor-pointer"
        id="languageDropdown"
      >
        <span 
          className={`fi fi-${currentLanguage.flag} rounded-circle`}
          style={{
            width: '2.2rem',
            height: '2.2rem',
            display: 'inline-block',
            backgroundSize: 'cover',
            border: '2px solid #e5e7eb'
          }}
        />
        <span className="ms-2 d-none d-md-inline">{currentLanguage.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="dropdown-menu-end">
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            active={locale === lang.code}
            className="d-flex align-items-center"
          >
            <span 
              className={`fi fi-${lang.flag} rounded-circle me-2`}
              style={{
                width: '20px',
                height: '20px',
                display: 'inline-block',
                backgroundSize: 'cover'
              }}
            />
            {lang.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;