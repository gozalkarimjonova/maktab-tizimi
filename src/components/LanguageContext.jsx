import { createContext, useContext, useState } from 'react'
import translations from '../i18n'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')

    const switchLang = (newLang) => {
        setLang(newLang)
        localStorage.setItem('lang', newLang)
    }

    const t = (key) => translations[lang]?.[key] || translations['uz']?.[key] || key

    return (
        <LanguageContext.Provider value={{ lang, switchLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLang() {
    return useContext(LanguageContext)
}
