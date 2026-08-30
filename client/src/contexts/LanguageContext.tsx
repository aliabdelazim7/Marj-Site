import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { languageDirection, languageLabel, translateVisibleText, type AppLanguage } from "@/lib/i18n";

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; toggleLanguage: () => void; t: (value: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "marj-language";

function translateTree(root: Node, language: AppLanguage) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const parent = textNode.parentElement;
    if (parent && !["SCRIPT", "STYLE"].includes(parent.tagName)) {
      const translated = translateVisibleText(textNode.nodeValue ?? "", language);
      if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
    }
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) textNodes.push(node as Text);
  for (const textNode of textNodes) {
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) continue;
    const translated = translateVisibleText(textNode.nodeValue ?? "", language);
    if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
  }
  if (!(root instanceof Element)) return;
  root.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title]").forEach((element) => {
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const translated = translateVisibleText(current, language);
      if (translated !== current) element.setAttribute(attribute, translated);
    }
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "ar" || requested === "en") return requested;
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
  });

  useEffect(() => {
    const direction = languageDirection(language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    localStorage.setItem(STORAGE_KEY, language);
    translateTree(document.body, language);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData" && record.target.parentNode) translateTree(record.target.parentNode, language);
        record.addedNodes.forEach((addedNode) => translateTree(addedNode, language));
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({ language, setLanguage, toggleLanguage: () => setLanguage((current) => current === "ar" ? "en" : "ar"), t: (text) => translateVisibleText(text, language) }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();
  return <button type="button" className={`language-toggle ${className}`.trim()} onClick={toggleLanguage} aria-label={`Switch language to ${languageLabel(language)}`}><span>{language === "ar" ? "EN" : "ع"}</span></button>;
}
