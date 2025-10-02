"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ml'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionary
const translations = {
  en: {
    // Navigation
    'nav.title': 'KMRL-SIH 2025',
    'nav.home': 'Home',
    'nav.overview': 'Overview',
    'nav.analytics': 'Analytics',

    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.aiChat': 'AI Chat',
    'nav.archive': 'Archive',
    'nav.workflow': 'Workflow',
    'nav.mobile': 'Mobile',
    'nav.search': 'Search trains...',
    'nav.inductionPlan': 'Induction Plan',
    'nav.simulationPlan': 'Simulation Panel',
    'nav.trainsetDetails': 'Trainset Details',
    'nav.details': 'Details',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.confirmation': 'Confirmation',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.clear': 'Clear',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.search': 'Search',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.update': 'Update',
    'common.create': 'Create',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',

    // Dashboard
    'dashboard.welcome': 'Welcome to KMRL-SIH 2025',
    'dashboard.overview': 'System Overview',
    'dashboard.stats': 'Statistics',
    'dashboard.alerts': 'Recent Alerts',
    'dashboard.trainsets': 'Active Trainsets',
    'dashboard.notifications': 'Notifications',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.reports': 'Reports',
    'dashboard.maintenance': 'Maintenance',
    'dashboard.operations': 'Operations',

    // Train Management
    'trains.title': 'Train Management',
    'trains.operations': 'Train Operations',
    'trains.status': 'Status',
    'trains.schedule': 'Schedule',
    'trains.maintenance': 'Maintenance',
    'trains.route': 'Route',
    'trains.passengers': 'Passengers',
    'trains.speed': 'Speed',

    // Users
    'users.title': 'User Management',
    'users.addUser': 'Add User',
    'users.editUser': 'Edit User',
    'users.deleteUser': 'Delete User',
    'users.userDetails': 'User Details',
    'users.permissions': 'Permissions',
    'users.roles': 'Roles',
    'users.status': 'Status',
    'users.lastLogin': 'Last Login',
    'users.dateCreated': 'Date Created',
    'users.email': 'Email',
    'users.phone': 'Phone',
    'users.department': 'Department',
    'users.position': 'Position',
    'users.active': 'Active',
    'users.inactive': 'Inactive',
    'users.suspended': 'Suspended',
    'users.admin': 'Administrator',
    'users.operator': 'Operator',
    'users.viewer': 'Viewer',
    'users.searchUsers': 'Search Users',
    'users.filterByRole': 'Filter by Role',
    'users.filterByStatus': 'Filter by Status',
    'users.exportUsers': 'Export Users',
    'users.importUsers': 'Import Users',
    'users.bulkActions': 'Bulk Actions',
    'users.selectAll': 'Select All',
    'users.selectedUsers': 'Selected Users',
    'users.deleteConfirm': 'Are you sure you want to delete selected users?',
    'users.activateUsers': 'Activate Users',
    'users.deactivateUsers': 'Deactivate Users',
    'users.sendInvitation': 'Send Invitation',
    'users.resetPassword': 'Reset Password',
    'users.changeRole': 'Change Role',
    'users.userCreated': 'User created successfully',
    'users.userUpdated': 'User updated successfully',
    'users.userDeleted': 'User deleted successfully',
    'users.invitationSent': 'Invitation sent successfully',
    'users.passwordReset': 'Password reset successfully',

    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.overview': 'Overview',
    'analytics.reports': 'Reports',
    'analytics.insights': 'Insights',
    'analytics.trends': 'Trends',
    'analytics.performance': 'Performance',
    'analytics.usage': 'Usage Statistics',
    'analytics.efficiency': 'Efficiency Metrics',
    'analytics.alerts': 'Alert Analysis',
    'analytics.maintenance': 'Maintenance Analytics',
    'analytics.operational': 'Operational Metrics',
    'analytics.safety': 'Safety Indicators',
    'analytics.compliance': 'Compliance Status',
    'analytics.dateRange': 'Date Range',
    'analytics.exportReport': 'Export Report',
    'analytics.scheduleReport': 'Schedule Report',
    'analytics.shareReport': 'Share Report',
    'analytics.printReport': 'Print Report',
    'analytics.customReport': 'Custom Report',
    'analytics.quickStats': 'Quick Statistics',
    'analytics.detailView': 'Detailed View',
    'analytics.chartView': 'Chart View',
    'analytics.tableView': 'Table View',
    'analytics.comparison': 'Comparison',
    'analytics.forecast': 'Forecast',

    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.account': 'Account Settings',
    'settings.security': 'Security Settings',
    'settings.notifications': 'Notification Settings',
    'settings.privacy': 'Privacy Settings',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'settings.dateFormat': 'Date Format',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.autoMode': 'Auto Mode',
    'settings.systemDefault': 'System Default',
    'settings.saveChanges': 'Save Changes',
    'settings.discardChanges': 'Discard Changes',
    'settings.resetToDefault': 'Reset to Default',
    'settings.changePassword': 'Change Password',
    'settings.twoFactor': 'Two-Factor Authentication',
    'settings.sessionTimeout': 'Session Timeout',
    'settings.loginHistory': 'Login History',
    'settings.deviceManagement': 'Device Management',
    'settings.apiKeys': 'API Keys',
    'settings.integrations': 'Integrations',
    'settings.backupRestore': 'Backup & Restore',
    'settings.exportData': 'Export Data',
    'settings.importData': 'Import Data',
    'settings.systemMaintenance': 'System Maintenance',

    // Footer
    'footer.copyright': '© 2025 KMRL-SIH. All rights reserved.',
    'footer.version': 'Version 1.0.0',
    'footer.support': 'Support',
    'footer.documentation': 'Documentation',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    'footer.smartHub': 'KMRL-SIH 2025',

    // Errors
    'error.generic': 'An unexpected error occurred',
    'error.network': 'Network connection error',
    'error.timeout': 'Request timeout',
    'error.unauthorized': 'Unauthorized access',
    'error.forbidden': 'Access forbidden',
    'error.notFound': 'Resource not found',
    'error.serverError': 'Internal server error',
    'error.validationFailed': 'Validation failed',
    'error.systemError': 'System error occurred',
    'error.fileTooLarge': 'File size too large',
    'error.fileTypeNotSupported': 'File type not supported',
    'error.sessionExpired': 'Session expired. Please login again.',
    'error.invalidCredentials': 'Invalid username or password',
    'error.accountLocked': 'Account locked. Please contact administrator.',
    'error.emailAlreadyExists': 'Email address already exists',
    'error.usernameAlreadyExists': 'Username already exists',
    'error.weakPassword': 'Password is too weak',
    'error.passwordMismatch': 'Passwords do not match',
    'error.requiredField': 'This field is required',
    'error.invalidEmail': 'Invalid email address',
    'error.invalidPhone': 'Invalid phone number',
    'error.minLength': 'Minimum length required',
    'error.maxLength': 'Maximum length exceeded',
  },

  ml: {
    // Navigation (Malayalam)
    'nav.title': 'KMRL-SIH 2025',
    'nav.home': 'ഹോം',
    'nav.overview': 'അവലോകനം',
    'nav.analytics': 'വിശകലനം',


    'nav.users': 'ഉപയോക്താക്കൾ',
    'nav.settings': 'ക്രമീകരണങ്ങൾ',
    'nav.notifications': 'അറിയിപ്പുകൾ',
    'nav.profile': 'പ്രൊഫൈൽ',
    'nav.logout': 'ലോഗൗട്ട്',
    'nav.aiChat': 'AI ചാറ്റ്',
    'nav.archive': 'ആർക്കൈവ്',
    'nav.workflow': 'വർക്ക്ഫ്ലോ',
    'nav.mobile': 'മൊബൈൽ',
    'nav.search': 'ട്രെയിനുകൾ തിരയുക...',
    'nav.inductionPlan': 'ഇൻഡക്ഷൻ പ്ലാൻ',
    'nav.simulationPlan': 'സിമുലേഷൻ പാനൽ',
    'nav.trainsetDetails': 'ട്രെയിൻസെറ്റ് വിശദാംശങ്ങൾ',
    'nav.details': 'വിശദാംശങ്ങൾ',

    // Common (Malayalam)
    'common.loading': 'ലോഡിംഗ്...',
    'common.save': 'സംരക്ഷിക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.edit': 'എഡിറ്റ്',
    'common.view': 'കാണുക',
    'common.close': 'അടയ്ക്കുക',
    'common.open': 'തുറക്കുക',
    'common.yes': 'അതെ',
    'common.no': 'ഇല്ല',
    'common.ok': 'ശരി',
    'common.error': 'പിശക്',
    'common.success': 'വിജയം',
    'common.warning': 'മുന്നറിയിപ്പ്',
    'common.info': 'വിവരം',
    'common.confirmation': 'സ്ഥിരീകരണം',
    'common.submit': 'സമർപ്പിക്കുക',
    'common.reset': 'പുനഃസജ്ജമാക്കുക',
    'common.clear': 'മായ്ക്കുക',
    'common.filter': 'ഫിൽട്ടർ',
    'common.sort': 'അടുക്കുക',
    'common.search': 'തിരയുക',
    'common.add': 'ചേർക്കുക',
    'common.remove': 'നീക്കം ചെയ്യുക',
    'common.update': 'അപ്ഡേറ്റ്',
    'common.create': 'സൃഷ്ടിക്കുക',
    'common.back': 'തിരിച്ച്',
    'common.next': 'അടുത്തത്',
    'common.previous': 'മുമ്പത്തെ',
    'common.finish': 'പൂർത്തിയാക്കുക',

    // Dashboard (Malayalam)
    'dashboard.welcome': 'KMRL-SIH 2025-ൽ സ്വാഗതം',
    'dashboard.overview': 'സിസ്റ്റം അവലോകനം',
    'dashboard.stats': 'സ്ഥിതിവിവരക്കണക്കുകൾ',
    'dashboard.alerts': 'സമീപകാല അലേർട്ടുകൾ',
    'dashboard.trainsets': 'സജീവ ട്രെയിൻസെറ്റുകൾ',
    'dashboard.notifications': 'അറിയിപ്പുകൾ',
    'dashboard.quickActions': 'ദ്രുത പ്രവർത്തനങ്ങൾ',
    'dashboard.reports': 'റിപ്പോർട്ടുകൾ',
    'dashboard.maintenance': 'അറ്റകുറ്റപ്പണി',
    'dashboard.operations': 'പ്രവർത്തനങ്ങൾ',

    // Train Management (Malayalam)
    'trains.title': 'ട്രെയിൻ മാനേജ്മെന്റ്',
    'trains.operations': 'ട്രെയിൻ പ്രവർത്തനങ്ങൾ',
    'trains.status': 'സ്ഥിതി',
    'trains.schedule': 'ഷെഡ്യൂൾ',
    'trains.maintenance': 'അറ്റകുറ്റപ്പണി',
    'trains.route': 'റൂട്ട്',
    'trains.passengers': 'യാത്രക്കാർ',
    'trains.speed': 'വേഗത',

    // Footer (Malayalam)
    'footer.copyright': '© 2025 KMRL-SIH. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.',
    'footer.version': 'പതിപ്പ് 1.0.0',
    'footer.support': 'പിന്തുണ',
    'footer.documentation': 'ഡോക്യുമെന്റേഷൻ',
    'footer.privacy': 'സ്വകാര്യതാ നയം',
    'footer.terms': 'സേവന നിബന്ധനകൾ',
    'footer.contact': 'ഞങ്ങളെ ബന്ധപ്പെടുക',
    'footer.smartHub': 'KMRL-SIH 2025',

    // Additional Malayalam translations for completeness...
    'error.generic': 'അപ്രതീക്ഷിത പിശക് സംഭവിച്ചു',
    'error.network': 'നെറ്റ്‌വർക്ക് കണക്ഷൻ പിശക്',
    'error.sessionExpired': 'സെഷൻ കാലഹരണപ്പെട്ടു. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.',
  }
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('kmrl-language') as Language
    if (stored && (stored === 'en' || stored === 'ml')) {
      setLanguage(stored)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kmrl-language', lang)
  }

  const t = (key: string, fallback?: string): string => {
    const translation = (translations[language] as any)?.[key] || (translations['en'] as any)?.[key] || fallback || key
    return translation
  }

  return {
    language,
    setLanguage: handleSetLanguage,
    t
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguage()

  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider')
  }
  return context
}