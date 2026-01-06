import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className={`relative ${className}`}>
            <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:border-primary text-sm"
            >
                <option value="es">ES</option>
                <option value="en">EN</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};