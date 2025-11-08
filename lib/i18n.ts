const TRANSLATIONS = {
  "en-US": {
    title: "We respect your privacy",
    description:
      "Select which categories we can use. Necessary cookies are always on to keep the site running.",
    acceptAll: "Accept all",
    rejectAll: "Reject non-essential",
    save: "Save choices",
    categories: {
      necessary: "Necessary",
      ads: "Advertising",
      other: "Other",
    },
  },
  "zh-CN": {
    title: "\u6211\u4eec\u5c0a\u91cd\u60a8\u7684\u9690\u79c1",
    description:
      "\u8bf7\u9009\u62e9\u5141\u8bb8\u7684\u7c7b\u76ee\u3002\u5fc5\u8981\u7c7b\u59cb\u7ec8\u5f00\u542f\u4ee5\u4fdd\u969c\u7ad9\u70b9\u53ef\u7528\u3002",
    acceptAll: "\u5168\u90e8\u5141\u8bb8",
    rejectAll: "\u4ec5\u5fc5\u8981\u7c7b",
    save: "\u4fdd\u5b58\u9009\u62e9",
    categories: {
      necessary: "\u5fc5\u8981",
      ads: "\u5e7f\u544a",
      other: "\u5176\u4ed6",
    },
  },
};

export function getStrings(locale: string | null | undefined) {
  if (!locale) return TRANSLATIONS["en-US"];
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("zh")) return TRANSLATIONS["zh-CN"];
  return TRANSLATIONS["en-US"];
}
