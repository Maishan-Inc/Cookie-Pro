export type Locale = "en" | "zh";

export type Dictionary = {
  nav: {
    home: string;
    login: string;
    register: string;
    console: string;
    theme: string;
    logout: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    cardTitle: string;
    cardBody: string;
  };
  install: {
    title: string;
    description: string;
    licenseTitle: string;
    licenseAgreement: string;
    licenseCta: string;
    instructionsTitle: string;
    instructionsDescription: string;
    instructionsList: string[];
    envTitle: string;
    envHelp: string;
    dbTitle: string;
    dbVersion: string;
    checksTitle: string;
    checksDescription: string;
    connectionHelp: string;
    schemaTitle: string;
    schemaHelp: string;
    adminTitle: string;
    adminDescription: string;
    adminPathLabel: string;
    adminNameLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    successRedirect: string;
    pgUnknown: string;
    next: string;
    back: string;
    passwordMismatch: string;
    errorDetails: string;
    checkOk: string;
    checkMissing: string;
    optionalLabel: string;
  };
  dashboard: {
    heading: string;
    subheading: string;
    siteLabel: string;
    load: string;
  };
  footer: {
    copy: string;
    github: string;
  };
  license: {
    heading: string;
    body: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    entryRequired: string;
    email: string;
    password: string;
    submit: string;
    unauthorized: string;
    registerPrompt: string;
  };
  alerts: {
    installLocked: string;
    loginSuccess: string;
    registrationStarted: string;
    verificationFailed: string;
    smtpMissing: string;
    registrationDisabled: string;
  };
  register: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    password: string;
    submit: string;
    codeTitle: string;
    codeSubtitle: string;
    verify: string;
    success: string;
  };
  smtp: {
    title: string;
    description: string;
    host: string;
    port: string;
    secure: string;
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
    save: string;
    updated: string;
  };
  templates: {
    title: string;
    description: string;
    locale: string;
    subject: string;
    body: string;
    save: string;
    updated: string;
  };
  system: {
    title: string;
    description: string;
    productName: string;
    supportEmail: string;
    defaultLocale: string;
    themePreference: string;
    themeAuto: string;
    themeLight: string;
    themeDark: string;
    allowSignup: string;
    retention: string;
    save: string;
    updated: string;
  };
  usage: {
    title: string;
    description: string;
    sites: string;
    devices: string;
    consents: string;
    events: string;
    events24: string;
    consents24: string;
    lastEvent: string;
    lastConsent: string;
    perSite: string;
    perSiteEmpty: string;
  };
  usersAdmin: {
    title: string;
    description: string;
    name: string;
    email: string;
    password: string;
    locale: string;
    create: string;
    reset: string;
    delete: string;
    empty: string;
    newUser: string;
    success: string;
    created: string;
  };
  userConsole: {
    greeting: string;
  };
  admin: {
    heading: string;
    aliasLabel: string;
    adminLabel: string;
  };
  home: {
    consentTitle: string;
    consentSubtitle: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      home: "Home",
      login: "Login",
      register: "Register",
      console: "Console",
      theme: "Theme",
      logout: "Logout",
    },
    hero: {
      eyebrow: "Maishan · Consent & Telemetry",
      title: "Privacy-first consent management and telemetry toolkit",
      subtitle:
        "Cookie-Pro bundles a Next.js + Supabase blueprint so you can deploy, observe, and evolve consent flows with minimal data collection.",
      primaryCta: "Open Install Guide",
      secondaryCta: "Go to Console",
      cardTitle: "Why Cookie-Pro?",
      cardBody:
        "Edge script, Supabase persistence, CAPTCHA guardrails, and bilingual UI are ready on day one—perfect for modern privacy teams.",
    },
    install: {
      title: "Guided Installation",
      description:
        "Walk through the license agreement, environment diagnostics, and administrator bootstrap so your deployment stays locked down.",
      licenseTitle: "1 · License Agreement",
      licenseAgreement:
        "By continuing you acknowledge the Maishan, Inc OSS Agreement (MIT License) and confirm you are authorized to configure this project.",
      licenseCta: "I agree, continue",
      instructionsTitle: "Before you continue",
      instructionsDescription:
        "Complete the tasks below so the installer can talk to Supabase and Vercel without interruptions.",
      instructionsList: [
        "Create (or reuse) a Supabase project, then copy SUPABASE_URL and SUPABASE_SERVICE_ROLE into your Vercel Production and Preview environments.",
        "Run sql/01_init.sql inside Supabase → SQL Editor once so every table, function, and policy exists ahead of time.",
        "Pick a unique admin alias (e.g. /admin-yourteam) and set ADMIN_SESSION_SECRET + USER_SESSION_SECRET before clicking Next.",
      ],
      envTitle: "2 · Environment Check",
      envHelp: "We only proceed when mandatory secrets exist in the current environment.",
      dbTitle: "3 · Database Diagnostics",
      dbVersion: "Postgres version",
      checksTitle: "Environment & database checks",
      checksDescription: "Installer tests run directly against your Supabase project. Fix any failing item and press Next again.",
      connectionHelp:
        "Need connectivity help? Ensure the Supabase URL matches the Service Role and that your IP/location is allowed under Supabase → Project Settings → API.",
      schemaTitle: "Schema verification",
      schemaHelp: "Installer checks whether sql/01_init.sql tables exist before unlocking admin setup.",
      adminTitle: "4 · Administrator Account",
      adminDescription:
        "Set the only admin alias and credentials. Anyone opening /admin-login must supply this alias to continue.",
      adminPathLabel: "Admin backend alias (e.g. /admin-max1234)",
      adminNameLabel: "Administrator name",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      submit: "Complete Installation",
      successRedirect: "Installation complete. Redirecting you to the admin login…",
      pgUnknown: "Unknown (run SQL upgrade to expose version)",
      next: "Next",
      back: "Back",
      passwordMismatch: "Passwords do not match.",
      errorDetails: "Installation failed",
      checkOk: "Configured",
      checkMissing: "Missing",
      optionalLabel: "(optional)",
    },
    dashboard: {
      heading: "User Console",
      subheading:
        "Monitor consent KPIs, review telemetry, and manage edge scripts from your personalized workspace.",
      siteLabel: "Site key",
      load: "Load",
    },
    footer: {
      copy: "Cookie-Pro Copyright © 2025 Maishan, Inc · MIT License",
      github: "GitHub Repository",
    },
    license: {
      heading: "Maishan, Inc OSS License Notice",
      body:
        "Cookie-Pro ships under the MIT License. You may use, copy, modify, merge, publish, distribute, sublicense, or sell copies provided this notice appears in all substantial portions.",
    },
    auth: {
      loginTitle: "Administrator Login",
      loginSubtitle:
        "Provide the alias configured during installation along with the password to unlock the console.",
      entryRequired: "Please supply the admin backend alias to access this page.",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      unauthorized: "Session invalid. Please re-enter your alias and password.",
      registerPrompt: "Need an account?",
    },
    alerts: {
      installLocked: "Installation is locked. Update admin settings once you are signed in.",
      loginSuccess: "Login successful. Redirecting to the admin dashboard…",
      registrationStarted: "Verification code sent to your inbox.",
      verificationFailed: "Invalid or expired verification code.",
      smtpMissing: "SMTP settings must be configured before sending emails.",
      registrationDisabled: "Self-service registration has been disabled by an administrator.",
    },
    register: {
      title: "Create your account",
      subtitle: "We will email you a six-character verification code.",
      name: "Name",
      email: "Work email",
      password: "Password",
      submit: "Send verification code",
      codeTitle: "Enter verification code",
      codeSubtitle: "Type the six characters we just sent you.",
      verify: "Verify & finish",
      success: "Welcome aboard! Redirecting you to the console…",
    },
    smtp: {
      title: "SMTP settings",
      description: "Configure the SMTP server responsible for verification emails.",
      host: "Host",
      port: "Port",
      secure: "Use TLS (secure)",
      username: "Username",
      password: "Password",
      fromName: "From name",
      fromEmail: "From email",
      save: "Save settings",
      updated: "SMTP settings saved.",
    },
    templates: {
      title: "Email templates",
      description: "Customize the verification email content per locale.",
      locale: "Locale",
      subject: "Subject",
      body: "Body",
      save: "Save template",
      updated: "Template updated.",
    },
    system: {
      title: "System settings",
      description: "Manage branding, localization defaults, and signup policy.",
      productName: "Product name",
      supportEmail: "Support email (optional)",
      defaultLocale: "Default locale",
      themePreference: "Theme preference",
      themeAuto: "Auto (follow system)",
      themeLight: "Light",
      themeDark: "Dark",
      allowSignup: "Allow self-service registration",
      retention: "Telemetry retention (days)",
      save: "Save settings",
      updated: "System settings updated.",
    },
    usage: {
      title: "Usage overview",
      description: "Monitor consent writes and telemetry ingestion at a glance.",
      sites: "Sites",
      devices: "Devices",
      consents: "Consents",
      events: "Events",
      events24: "Events (24h)",
      consents24: "Consents (24h)",
      lastEvent: "Last event",
      lastConsent: "Last consent",
      perSite: "Per-site activity (24h)",
      perSiteEmpty: "No recent activity recorded.",
    },
    usersAdmin: {
      title: "User management",
      description: "Invite teammates, reset credentials, or remove access.",
      name: "Name",
      email: "Email",
      password: "Password",
      locale: "Locale",
      create: "Add user",
      reset: "Reset password",
      delete: "Remove",
      empty: "No users found.",
      newUser: "New user",
      success: "User list updated.",
      created: "Created",
    },
    userConsole: {
      greeting: "Welcome back 👋",
    },
    admin: {
      heading: "Admin Console",
      aliasLabel: "Admin alias",
      adminLabel: "Administrator",
    },
    home: {
      consentTitle: "Consent preview",
      consentSubtitle: "Live example of the consent modal with bilingual copy.",
    },
  },
  zh: {
    nav: {
      home: "首页",
      login: "登录",
      register: "注册",
      console: "控制台",
      theme: "主题",
      logout: "退出",
    },
    hero: {
      eyebrow: "Maishan · 同意与遥测",
      title: "隐私优先的同意管理与轻量遥测套件",
      subtitle:
        "Cookie-Pro 提供 Next.js + Supabase 全栈脚手架，帮助你以最小遥测快速落地双语同意管理与观测。",
      primaryCta: "查看安装向导",
      secondaryCta: "进入控制台",
      cardTitle: "为何选择 Cookie-Pro？",
      cardBody:
        "内置 Edge 脚本、Supabase 持久化、CAPTCHA 防护与双语 UI，一次集成即可满足现代隐私合规需求。",
    },
    install: {
      title: "引导式安装",
      description: "依次完成协议确认、环境检测、数据库诊断与管理员初始化，即可锁定部署。",
      licenseTitle: "步骤一 · 协议确认",
      licenseAgreement:
        "继续操作即表示你已阅读并同意 Maishan, Inc 开源软件协议（MIT License），并确认拥有本次部署权限。",
      licenseCta: "我已阅读并同意",
      instructionsTitle: "开始之前",
      instructionsDescription: "请按照以下步骤准备好环境变量与数据库，避免安装过程中出现连接或权限问题：",
      instructionsList: [
        "在 Supabase 控制台复制 SUPABASE_URL、SUPABASE_SERVICE_ROLE，并分别写入 Vercel Production 与 Preview 环境变量。",
        "打开 Supabase → SQL Editor，执行一次 sql/01_init.sql，确保所有数据表、函数与策略已创建。",
        "规划唯一后台路径（如 /admin-yourteam），同时配置 ADMIN_SESSION_SECRET / USER_SESSION_SECRET。",
      ],
      envTitle: "步骤二 · 环境检测",
      envHelp: "系统会检测必要环境变量，确保密钥仅存在于受控环境。",
      dbTitle: "步骤三 · 数据库诊断",
      dbVersion: "Postgres 版本",
      checksTitle: "环境与数据库联合检测",
      checksDescription: "安装过程会实时连通 Supabase，如遇失败请根据提示修复后再点击“下一步”。",
      connectionHelp: "连接失败？请确认 Supabase URL 与 Service Role 配对，并在 Project Settings → API 中允许当前 IP/地区访问。",
      schemaTitle: "数据库表校验",
      schemaHelp: "系统会确认 sql/01_init.sql 中定义的核心数据表是否已创建。",
      adminTitle: "步骤四 · 管理员账户",
      adminDescription: "配置唯一后台别名与管理员凭据。今后访问 /admin-login 必须提供该别名。",
      adminPathLabel: "管理员后台地址（例：/admin-max1234）",
      adminNameLabel: "管理员名称",
      passwordLabel: "密码",
      confirmPasswordLabel: "确认密码",
      submit: "完成安装",
      successRedirect: "安装完成，系统正在跳转到管理员登录页面…",
      pgUnknown: "未知（请执行 SQL 升级以获取版本）",
      next: "下一步",
      back: "上一步",
      passwordMismatch: "两次输入的密码不一致。",
      errorDetails: "安装失败",
      checkOk: "已配置",
      checkMissing: "未配置",
      optionalLabel: "（可选）",
    },
    dashboard: {
      heading: "用户控制台",
      subheading: "在个性化工作台中查看同意指标、遥测概览与脚本状态。",
      siteLabel: "站点 Key",
      load: "加载",
    },
    footer: {
      copy: "Cookie-Pro Copyright © 2025 Maishan, Inc · MIT License",
      github: "GitHub 仓库",
    },
    license: {
      heading: "Maishan, Inc 开源许可说明",
      body: "Cookie-Pro 以 MIT 许可证发布。保留本声明即可自由使用、复制、修改、分发及商用。",
    },
    auth: {
      loginTitle: "管理员登录",
      loginSubtitle: "请输入安装时设置的别名与密码，才能开启管理员控制台。",
      entryRequired: "请先提供管理员后台地址再访问此页面。",
      email: "邮箱",
      password: "密码",
      submit: "登录",
      unauthorized: "会话失效，请重新输入管理员别名与密码。",
      registerPrompt: "还没有账号？",
    },
    alerts: {
      installLocked: "安装已锁定。登录后台后可在系统设置中更新管理员路径或凭据。",
      loginSuccess: "登录成功，正在进入管理员控制台…",
      registrationStarted: "验证码已发送到您的邮箱。",
      verificationFailed: "验证码错误或已失效。",
      smtpMissing: "请先在管理员后台配置 SMTP。",
      registrationDisabled: "管理员已关闭自助注册，请联系管理员。",
    },
    register: {
      title: "创建账号",
      subtitle: "我们会发送 6 位验证码到您的邮箱。",
      name: "姓名",
      email: "工作邮箱",
      password: "密码",
      submit: "发送验证码",
      codeTitle: "输入验证码",
      codeSubtitle: "请输入刚刚收到的 6 位验证码。",
      verify: "验证并完成",
      success: "欢迎使用！即将跳转至控制台…",
    },
    smtp: {
      title: "SMTP 设置",
      description: "配置发送验证码邮件所需的 SMTP 服务。",
      host: "主机地址",
      port: "端口",
      secure: "启用 TLS（安全）",
      username: "用户名",
      password: "密码",
      fromName: "发件人名称",
      fromEmail: "发件邮箱",
      save: "保存设置",
      updated: "SMTP 设置已保存。",
    },
    templates: {
      title: "邮件模板",
      description: "可按语言自定义验证码邮件内容。",
      locale: "语言",
      subject: "主题",
      body: "正文",
      save: "保存模板",
      updated: "模板已更新。",
    },
    system: {
      title: "系统设置",
      description: "管理品牌文案、默认语言与注册策略。",
      productName: "产品名称",
      supportEmail: "支持邮箱（可选）",
      defaultLocale: "默认语言",
      themePreference: "主题偏好",
      themeAuto: "跟随系统",
      themeLight: "浅色",
      themeDark: "深色",
      allowSignup: "允许自助注册",
      retention: "遥测保留天数",
      save: "保存设置",
      updated: "系统设置已更新。",
    },
    usage: {
      title: "调用情况",
      description: "快速掌握同意写入与遥测吞吐。",
      sites: "站点",
      devices: "设备",
      consents: "同意记录",
      events: "遥测事件",
      events24: "事件（24 小时）",
      consents24: "同意（24 小时）",
      lastEvent: "最近事件",
      lastConsent: "最近同意",
      perSite: "站点调用（近 24 小时）",
      perSiteEmpty: "暂无调用记录。",
    },
    usersAdmin: {
      title: "用户管理",
      description: "邀请成员、重置密码或移除访问权限。",
      name: "姓名",
      email: "邮箱",
      password: "密码",
      locale: "语言",
      create: "新增用户",
      reset: "重置密码",
      delete: "移除",
      empty: "暂无用户。",
      newUser: "创建新用户",
      success: "用户列表已更新。",
      created: "创建时间",
    },
    userConsole: {
      greeting: "欢迎回来 👋",
    },
    admin: {
      heading: "管理员控制台",
      aliasLabel: "管理员地址",
      adminLabel: "管理员",
    },
    home: {
      consentTitle: "同意弹窗示例",
      consentSubtitle: "实时预览双语同意弹窗的交互效果。",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}
