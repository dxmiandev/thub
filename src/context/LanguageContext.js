import React, { createContext, useState, useContext, useEffect } from 'react';

// Language configuration
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

// Create the language context
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  languages: SUPPORTED_LANGUAGES,
  translate: (key) => key,
  isLoading: false
});

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    "Home": "Home",
    "Trucks": "Trucks",
    "Trailers": "Trailers",
    "Wholesale": "Wholesale",
    "Financial": "Financial",
    "Sign In": "Sign In",
    "Learn More": "Learn More",
    "Contact Us": "Contact Us",
    
    // Home Page
    "Freightliner Cascadia – 2020": "Freightliner Cascadia – 2020",
    "Premium commercial truck with excellent fuel efficiency, cutting-edge safety features, and industry-leading comfort for long-haul journeys.": 
      "Premium commercial truck with excellent fuel efficiency, cutting-edge safety features, and industry-leading comfort for long-haul journeys.",
    "Explore Now": "Explore Now",
    "Specifications": "Specifications",
    "Fuel Type": "Fuel Type",
    "Diesel": "Diesel",
    "Mileage": "Mileage",
    "250 Miles": "250 Miles",
    "Transmission": "Transmission",
    "Manual": "Manual",
    "Year": "Year",
    "2020": "2020",
    "View Details": "View Details",
    "Contact Dealer": "Contact Dealer",
    "Scroll to explore": "Scroll to explore",
    
    // Explore Section
    "Explore Premium Trucks": "Explore Premium Trucks",
    "Discover our collection of high-performance commercial trucks, designed for efficiency, comfort, and long-haul reliability.": 
      "Discover our collection of high-performance commercial trucks, designed for efficiency, comfort, and long-haul reliability.",
    "View All": "View All",
    "In Stock": "In Stock",
    "New Trucks": "New Trucks",
    "Used Trucks": "Used Trucks",
    "Financing Options": "Financing Options",
    "New": "New",
    "Hot Deal": "Hot Deal",
    "Starting at": "Starting at",
    
    // Truck Descriptions
    "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD": 
      "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD",
    "Peterbilt 379 – Heavy-duty truck with classic styling and comfort": 
      "Peterbilt 379 – Heavy-duty truck with classic styling and comfort",
    "Kenworth W990 – Long-hood conventional with premium features": 
      "Kenworth W990 – Long-hood conventional with premium features",
    "Volvo VNL 860 – Spacious sleeper cab with cutting-edge technology": 
      "Volvo VNL 860 – Spacious sleeper cab with cutting-edge technology",
    
    // Truck Specifications
    "15 Miles": "15 Miles",
    "32 Miles": "32 Miles",
    "25 Miles": "25 Miles",
    "40 Miles": "40 Miles",
    "Automatic": "Automatic",
    "$165,000": "$165,000",
    "$150,000": "$150,000",
    "$175,000": "$175,000",
    "$180,000": "$180,000",
    "2023": "2023",
    "2022": "2022",
    "4.9": "4.9",
    "4.7": "4.7",
    "4.8": "4.8",
    "4.6": "4.6"
  },
  es: {
    // Navigation
    "Home": "Inicio",
    "Trucks": "Camiones",
    "Trailers": "Remolques",
    "Wholesale": "Mayorista",
    "Financial": "Financiero",
    "Finance": "Finanzas",
    "Plans": "Planes",
    "Transit": "Tránsito",
    "Contact": "Contacto",
    "About Us": "Sobre Nosotros",
    "Sign In": "Iniciar Sesión",
    
    // Home Page
    "Freightliner Cascadia – 2020": "Freightliner Cascadia – 2020",
    "Premium commercial truck with excellent fuel efficiency, cutting-edge safety features, and industry-leading comfort for long-haul journeys.": 
      "Camión comercial premium con excelente eficiencia de combustible, características de seguridad de vanguardia y comodidad líder en la industria para viajes de larga distancia.",
    "Explore Now": "Explorar Ahora",
    "Specifications": "Especificaciones",
    "Fuel Type": "Tipo de Combustible",
    "Diesel": "Diésel",
    "Mileage": "Kilometraje",
    "250 Miles": "250 Millas",
    "Transmission": "Transmisión",
    "Manual": "Manual",
    "Year": "Año",
    "2020": "2020",
    "View Details": "Ver Detalles",
    "Contact Dealer": "Contactar Vendedor",
    "Scroll to explore": "Desplázate para explorar",
    
    // Explore Section
    "Explore Premium Trucks": "Explorar Camiones Premium",
    "Discover our collection of high-performance commercial trucks, designed for efficiency, comfort, and long-haul reliability.": 
      "Descubra nuestra colección de camiones comerciales de alto rendimiento, diseñados para la eficiencia, comodidad y fiabilidad en largas distancias.",
    "View All": "Ver Todos",
    "In Stock": "En Existencia",
    "New Trucks": "Camiones Nuevos",
    "Used Trucks": "Camiones Usados",
    "Financing Options": "Opciones de Financiamiento",
    "New": "Nuevo",
    "Hot Deal": "Oferta Especial",
    "Starting at": "Desde",
    
    // Truck Descriptions
    "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD": 
      "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD",
    "Peterbilt 379 – Heavy-duty truck with classic styling and comfort": 
      "Peterbilt 379 – Camión de servicio pesado con estilo clásico y comodidad",
    "Kenworth W990 – Long-hood conventional with premium features": 
      "Kenworth W990 – Convencional de capó largo con características premium",
    "Volvo VNL 860 – Spacious sleeper cab with cutting-edge technology": 
      "Volvo VNL 860 – Cabina dormitorio espaciosa con tecnología de vanguardia",
    
    // Truck Specifications
    "15 Miles": "15 Millas",
    "32 Miles": "32 Millas",
    "25 Miles": "25 Millas",
    "40 Miles": "40 Millas",
    "Automatic": "Automático",
    "$165,000": "$165,000",
    "$150,000": "$150,000",
    "$175,000": "$175,000",
    "$180,000": "$180,000",
    "2023": "2023",
    "2022": "2022",
    "4.9": "4.9",
    "4.7": "4.7",
    "4.8": "4.8",
    "4.6": "4.6"
  },
  ru: {
    // Navigation
    "Home": "Главная",
    "Trucks": "Грузовики",
    "Trailers": "Прицепы",
    "Wholesale": "Оптовая продажа",
    "Financial": "Финансы",
    "Finance": "Финансы",
    "Plans": "Планы",
    "Transit": "Транзит",
    "Contact": "Контакты",
    "About Us": "О нас",
    "Sign In": "Войти",
    
    // Home Page
    "Freightliner Cascadia – 2020": "Freightliner Cascadia – 2020",
    "Premium commercial truck with excellent fuel efficiency, cutting-edge safety features, and industry-leading comfort for long-haul journeys.": 
      "Премиальный коммерческий грузовик с отличной топливной эффективностью, передовыми функциями безопасности и ведущим в отрасли комфортом для дальних поездок.",
    "Explore Now": "Исследуйте сейчас",
    "Specifications": "Характеристики",
    "Fuel Type": "Тип топлива",
    "Diesel": "Дизель",
    "Mileage": "Пробег",
    "250 Miles": "250 миль",
    "Transmission": "Трансмиссия",
    "Manual": "Механическая",
    "Year": "Год",
    "2020": "2020",
    "View Details": "Посмотреть детали",
    "Contact Dealer": "Связаться с дилером",
    "Scroll to explore": "Прокрутите, чтобы исследовать",
    
    // Explore Section
    "Explore Premium Trucks": "Исследуйте премиальные грузовики",
    "Discover our collection of high-performance commercial trucks, designed for efficiency, comfort, and long-haul reliability.": 
      "Откройте для себя нашу коллекцию высокопроизводительных коммерческих грузовиков, созданных для эффективности, комфорта и надежности при дальних перевозках.",
    "View All": "Посмотреть все",
    "In Stock": "В наличии",
    "New Trucks": "Новые грузовики",
    "Used Trucks": "Подержанные грузовики",
    "Financing Options": "Варианты финансирования",
    "New": "Новый",
    "Hot Deal": "Горячее предложение",
    "Starting at": "Начиная с",
    
    // Truck Descriptions
    "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD": 
      "Freightliner Cascadia – Premium 4.0 D5 PowerPulse Momentum 5dr AWD",
    "Peterbilt 379 – Heavy-duty truck with classic styling and comfort": 
      "Peterbilt 379 – Тяжелый грузовик с классическим стилем и комфортом",
    "Kenworth W990 – Long-hood conventional with premium features": 
      "Kenworth W990 – Классический грузовик с длинным капотом и премиальными функциями",
    "Volvo VNL 860 – Spacious sleeper cab with cutting-edge technology": 
      "Volvo VNL 860 – Просторная спальная кабина с передовыми технологиями",
    
    // Truck Specifications
    "15 Miles": "15 миль",
    "32 Miles": "32 мили",
    "25 Miles": "25 миль",
    "40 Miles": "40 миль",
    "Automatic": "Автоматическая",
    "$165,000": "$165,000",
    "$150,000": "$150,000",
    "$175,000": "$175,000",
    "$180,000": "$180,000",
    "2023": "2023",
    "2022": "2022",
    "4.9": "4.9",
    "4.7": "4.7",
    "4.8": "4.8",
    "4.6": "4.6"
  }
};

// Function to load translations
const loadTranslations = async (language) => {
  // In a real app, you might fetch these from a server
  return translations[language] || {};
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => 
    localStorage.getItem('appLanguage') || 'en'
  );
  
  const [translationDict, setTranslationDict] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const changeLanguage = (newLanguage) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === newLanguage)) {
      setLanguage(newLanguage);
      localStorage.setItem('appLanguage', newLanguage);
      document.documentElement.lang = newLanguage;
    } else {
      console.warn(`Language '${newLanguage}' is not supported`);
    }
  };

  const translate = (key, placeholders = {}) => {
    const translation = translationDict[key] || key;
    
    return Object.entries(placeholders).reduce(
      (str, [placeholder, value]) => 
        str.replace(new RegExp(`{{${placeholder}}}`, 'g'), value),
      translation
    );
  };

  useEffect(() => {
    setIsLoading(true);
    
    loadTranslations(language)
      .then(dict => {
        setTranslationDict(dict);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load translations:', error);
        setIsLoading(false);
      });
      
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'he'].includes(language) ? 'rtl' : 'ltr';
    
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: changeLanguage, 
      languages: SUPPORTED_LANGUAGES,
      translate,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const T = ({ children, ...placeholders }) => {
  const { translate } = useLanguage();
  
  if (typeof children !== 'string') {
    console.warn('T component expects a string child');
    return children;
  }
  
  return <>{translate(children, placeholders)}</>;
};

export const AutoTranslate = () => {
  const { language, translate } = useLanguage();
  
  useEffect(() => {
    const translateTextNodes = () => {
    
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, span, label, li');
      
      elements.forEach(element => {
        if (element.getAttribute('data-no-translate') === 'true') return;
        
        if (element.closest('.language-selector') || element.closest('.language-dropdown')) return;
        
        if (Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
          if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', element.textContent);
          }
          
          const originalText = element.getAttribute('data-original-text');
          element.textContent = translate(originalText);
        }
      });
    };
    

    const timeoutId = setTimeout(translateTextNodes, 500);
    
    return () => clearTimeout(timeoutId);
  }, [language, translate]);
  
  return null; // This component doesn't render anything
};

export default LanguageContext;