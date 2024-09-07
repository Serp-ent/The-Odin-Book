import { useEffect, useRef, useState } from "react";
import { PL, US } from 'country-flag-icons/react/3x2'
import { useTranslation } from "react-i18next";

const languages = [
  { code: 'en', name: 'English', flag: <US title="English" className="w-6 h-4" /> },
  { code: 'pl', name: 'Polski', flag: <PL title="Polish" className="w-6 h-4" /> },
];

export default function LanguageSelector({ size = 'default' }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { i18n } = useTranslation();

  const handleSelect = (lng) => {
    setSelectedLanguage(lng);
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const selectedLanguageInfo = languages.find(lang => lang.code === selectedLanguage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="border py-1 px-2 flex items-center gap-2 bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark rounded"
      >
        {selectedLanguageInfo.flag}
        {size !== 'small' && <span>{selectedLanguageInfo.name}</span>}
      </button>

      {isDropdownOpen && (
        <div className="absolute mt-2 w-full text-sm bg-background-light dark:bg-background-dark border rounded shadow-lg z-50">
          <ul className="py-1">
            {languages.map(lang => (
              <li
                key={lang.code}
                className="p-2 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleSelect(lang.code)}
              >
                {lang.flag}
                {size !== 'small' && <span>{lang.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}