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
    'nav.home': 'Home',
    'nav.overview': 'അവലോകനം',
    'nav.analytics': 'Analytics',
    'nav.documents': 'Documents',
    'nav.upload': 'Upload',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.aiChat': 'AI Chat',
    'nav.archive': 'Archive',
    'nav.workflow': 'Workflow',
    'nav.mobile': 'Mobile',
    'nav.search': 'Search documents...',
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
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.refresh': 'Refresh',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.download': 'Download',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.help': 'Help',
    'common.info': 'Information',
    'common.warning': 'Warning',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.allStatus': 'All Status',
    
    // Stats
    'stats.totalDocuments': 'Total Documents',
    'stats.newToday': 'New Today',
    'stats.processingQueue': 'Processing Queue',
    'stats.storageUsed': 'Storage Used',
    'stats.activeUsers': 'Active Users',
    'stats.completedTasks': 'Completed Tasks',
    'stats.pendingReviews': 'Pending Reviews',
    'stats.systemUptime': 'System Uptime',
    'stats.totalTrainsets': 'Total Trainsets',
    'stats.readyForService': 'Ready for Service',
    'stats.standby': 'Standby',
    'stats.maintenance': 'Maintenance',
    'stats.alerts': 'Alerts',
    'stats.activeAlerts': 'Active Alerts',
    'stats.fleetSize': 'Fleet size',
    'stats.ofFleet': 'of fleet',
    'stats.reserveCapacity': 'Reserve capacity',
    'stats.underService': 'Under service',
    'stats.requiresAttention': 'Requires attention',
    'stats.service': 'Service',
    'stats.fleetStatusDistribution': 'Fleet Status Distribution',
    'stats.statusOverview': 'Status Overview',
    'stats.active': 'Active',
    'stats.reserve': 'Reserve',
    'stats.inactive': 'Inactive',
    'stats.total': 'Total',
    
    // Profile
    'profile.viewProfile': 'View Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    'profile.preferences': 'Preferences',
    'profile.accountSettings': 'Account Settings',
    'profile.notificationSettings': 'Notification Settings',
    'profile.privacySettings': 'Privacy Settings',
    'profile.securitySettings': 'Security Settings',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.systemStatus': 'System Status',
    'dashboard.alerts': 'Alerts',
    'dashboard.shortcuts': 'Shortcuts',
    'dashboard.announcements': 'Announcements',
    
    // Documents
    'documents.allDocuments': 'All Documents',
    'documents.myDocuments': 'My Documents',
    'documents.sharedWithMe': 'Shared with Me',
    'documents.recentDocuments': 'Recent Documents',
    'documents.favoriteDocuments': 'Favorite Documents',
    'documents.archivedDocuments': 'Archived Documents',
    'documents.uploadDocument': 'Upload Document',
    'documents.createDocument': 'Create Document',
    'documents.documentTitle': 'Document Title',
    'documents.documentType': 'Document Type',
    'documents.lastModified': 'Last Modified',
    'documents.fileSize': 'File Size',
    'documents.owner': 'Owner',
    'documents.status': 'Status',
    'documents.tags': 'Tags',
    'documents.description': 'Description',
    'documents.preview': 'Preview',
    'documents.download': 'Download',
    'documents.share': 'Share',
    'documents.noDocuments': 'No documents found',
    'documents.searchDocuments': 'Search documents...',
    
    // Upload
    'upload.uploadFiles': 'Upload Files',
    'upload.dragAndDrop': 'Drag and drop files here',
    'upload.orClickToSelect': 'or click to select files',
    'upload.supportedFormats': 'Supported formats',
    'upload.maxFileSize': 'Maximum file size',
    'upload.uploadProgress': 'Upload Progress',
    'upload.uploadComplete': 'Upload Complete',
    'upload.uploadFailed': 'Upload Failed',
    'upload.processingFiles': 'Processing files...',
    'upload.selectFiles': 'Select Files',
    'upload.removeFile': 'Remove File',
    
    // Users
    'users.allUsers': 'All Users',
    'users.activeUsers': 'Active Users',
    'users.addUser': 'Add User',
    'users.editUser': 'Edit User',
    'users.deleteUser': 'Delete User',
    'users.userProfile': 'User Profile',
    'users.firstName': 'First Name',
    'users.lastName': 'Last Name',
    'users.email': 'Email',
    'users.phone': 'Phone',
    'users.role': 'Role',
    'users.department': 'Department',
    'users.joinDate': 'Join Date',
    'users.lastLogin': 'Last Login',
    'users.userStatus': 'User Status',
    'users.permissions': 'Permissions',
    
    // Settings
    'settings.generalSettings': 'General Settings',
    'settings.accountSettings': 'Account Settings',
    'settings.securitySettings': 'Security Settings',
    'settings.notificationSettings': 'Notification Settings',
    'settings.privacySettings': 'Privacy Settings',
    'settings.systemSettings': 'System Settings',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'settings.theme': 'Theme',
    'settings.fontSize': 'Font Size',
    
    // Analytics
    'analytics.overview': 'Analytics Overview',
    'analytics.documentAnalytics': 'Document Analytics',
    'analytics.userAnalytics': 'User Analytics',
    'analytics.systemAnalytics': 'System Analytics',
    'analytics.performanceMetrics': 'Performance Metrics',
    'analytics.usageStatistics': 'Usage Statistics',
    'analytics.generateReport': 'Generate Report',
    'analytics.exportData': 'Export Data',
    
    // AI Chat
    'aiChat.startConversation': 'Start a Conversation',
    'aiChat.typeMessage': 'Type your message...',
    'aiChat.sendMessage': 'Send Message',
    'aiChat.clearChat': 'Clear Chat',
    'aiChat.chatHistory': 'Chat History',
    'aiChat.aiAssistant': 'AI Assistant',
    'aiChat.thinking': 'AI is thinking...',
    'aiChat.noMessages': 'No messages yet',
    'aiChat.errorMessage': 'Sorry, something went wrong',
    
    // Mobile
    'mobile.mobileView': 'Mobile View',
    'mobile.cameraCapture': 'Camera Capture',
    'mobile.takePhoto': 'Take Photo',
    'mobile.retakePhoto': 'Retake Photo',
    'mobile.usePhoto': 'Use Photo',
    'mobile.gallery': 'Gallery',
    'mobile.uploadFromGallery': 'Upload from Gallery',
    'mobile.scanDocument': 'Scan Document',
    
    // Messages
    'messages.saveSuccess': 'Saved successfully',
    'messages.saveError': 'Failed to save',
    'messages.deleteSuccess': 'Deleted successfully',
    'messages.deleteError': 'Failed to delete',
    'messages.uploadSuccess': 'Uploaded successfully',
    'messages.uploadError': 'Failed to upload',
    'messages.connectionError': 'Connection error',
    'messages.serverError': 'Server error',
    'messages.permissionDenied': 'Permission denied',
    'messages.fileNotFound': 'File not found',
    'messages.updateSuccess': 'Data refreshed successfully',
    'messages.updateError': 'Failed to refresh data',
    'messages.trainsetUpdated': 'Trainset information has been updated',
    'messages.tryAgain': 'Please try again in a moment',
    
    // Accessibility
    'accessibility.enableHighContrast': 'Enable High Contrast Mode',
    'accessibility.disableHighContrast': 'Disable High Contrast Mode',
    'accessibility.skipToContent': 'Skip to main content',
    'accessibility.openMenu': 'Open menu',
    'accessibility.closeMenu': 'Close menu',
    'accessibility.toggleSidebar': 'Toggle sidebar',
    
    // Footer
    'footer.poweredBy': 'Powered by',
    'footer.smartHub': 'KMRL-SIH 2025',
  },
  ml: {
    // Navigation
    'nav.home': 'ഹോം',
    'nav.overview': 'അവലോകനം',
    'nav.analytics': 'വിശകലനം',
    'nav.documents': 'രേഖകൾ',
    'nav.upload': 'അപ്‌ലോഡ്',
    'nav.users': 'ഉപയോക്താക്കൾ',
    'nav.settings': 'ക്രമീകരണങ്ങൾ',
    'nav.notifications': 'അറിയിപ്പുകൾ',
    'nav.profile': 'പ്രൊഫൈൽ',
    'nav.logout': 'ലോഗ് ഔട്ട്',
    'nav.aiChat': 'AI ചാറ്റ്',
    'nav.archive': 'ആർക്കൈവ്',
    'nav.workflow': 'വർക്ക്ഫ്ലോ',
    'nav.mobile': 'മൊബൈൽ',
    'nav.search': 'രേഖകൾ തിരയുക...',
    'nav.inductionPlan': 'ഇൻഡക്ഷൻ പ്ലാൻ',
    'nav.simulationPlan': 'സിമുലേഷൻ പാനൽ',
    'nav.trainsetDetails': 'ട്രെയിൻസെറ്റ് വിവരങ്ങൾ',
    'nav.details': 'വിവരങ്ങൾ',
    
    // Common
    'common.loading': 'ലോഡിംഗ്...',
    'common.save': 'സേവ്',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.edit': 'എഡിറ്റ്',
    'common.view': 'കാണുക',
    'common.close': 'അടയ്ക്കുക',
    'common.open': 'തുറക്കുക',
    'common.yes': 'അതെ',
    'common.no': 'ഇല്ല',
    'common.ok': 'ശരി',
    'common.back': 'തിരികെ',
    'common.next': 'അടുത്തത്',
    'common.previous': 'മുമ്പത്തേത്',
    'common.submit': 'സമർപ്പിക്കുക',
    'common.refresh': 'പുതുക്കുക',
    'common.search': 'തിരയുക',
    'common.filter': 'ഫിൽട്ടർ',
    'common.sort': 'ക്രമീകരിക്കുക',
    'common.export': 'എക്സ്പോർട്ട്',
    'common.import': 'ഇമ്പോർട്ട്',
    'common.download': 'ഡൗൺലോഡ്',
    'common.share': 'പങ്കിടുക',
    'common.copy': 'കോപ്പി',
    'common.help': 'സഹായം',
    'common.info': 'വിവരങ്ങൾ',
    'common.warning': 'മുന്നറിയിപ്പ്',
    'common.error': 'പിശക്',
    'common.success': 'വിജയം',
    'common.allStatus': 'എല്ലാ സ്റ്റാറ്റസും',
    
    // Stats
    'stats.totalDocuments': 'മൊത്തം രേഖകൾ',
    'stats.newToday': 'ഇന്ന് പുതിയത്',
    'stats.processingQueue': 'പ്രോസസിംഗ് ക്യൂ',
    'stats.storageUsed': 'ഉപയോഗിച്ച സ്റ്റോറേജ്',
    'stats.activeUsers': 'സജീവ ഉപയോക്താക്കൾ',
    'stats.completedTasks': 'പൂർത്തിയായ ജോലികൾ',
    'stats.pendingReviews': 'അവശേഷിക്കുന്ന അവലോകനങ്ങൾ',
    'stats.systemUptime': 'സിസ്റ്റം അപ്ടൈം',
    'stats.totalTrainsets': 'മൊത്തം ട്രെയിൻസെറ്റുകൾ',
    'stats.readyForService': 'സേവനത്തിന് തയ്യാർ',
    'stats.standby': 'സ്റ്റാൻഡ്ബൈ',
    'stats.maintenance': 'അറ്റകുറ്റപ്പണി',
    'stats.alerts': 'അലേർട്ടുകൾ',
    'stats.activeAlerts': 'സജീവ അലേർട്ടുകൾ',
    'stats.fleetSize': 'ഫ്ലീറ്റ് വലുപ്പം',
    'stats.ofFleet': 'ഫ്ലീറ്റിന്റെ',
    'stats.reserveCapacity': 'കരുതൽ ശേഷി',
    'stats.underService': 'സേവനത്തിൽ',
    'stats.requiresAttention': 'ശ്രദ്ധ ആവശ്യമാണ്',
    'stats.service': 'സേവനം',
    'stats.fleetStatusDistribution': 'ഫ്ലീറ്റ് സ്റ്റാറ്റസ് വിതരണം',
    'stats.statusOverview': 'സ്റ്റാറ്റസ് അവലോകനം',
    'stats.active': 'സജീവം',
    'stats.reserve': 'കരുതൽ',
    'stats.inactive': 'നിഷ്ക്രിയം',
    'stats.total': 'മൊത്തം',
    
    // Profile
    'profile.viewProfile': 'പ്രൊഫൈൽ കാണുക',
    'profile.editProfile': 'പ്രൊഫൈൽ എഡിറ്റ്',
    'profile.changePassword': 'പാസ്‌വേഡ് മാറ്റുക',
    'profile.preferences': 'മുൻഗണനകൾ',
    'profile.accountSettings': 'അക്കൗണ്ട് ക്രമീകരണങ്ങൾ',
    'profile.notificationSettings': 'അറിയിപ്പ് ക്രമീകരണങ്ങൾ',
    'profile.privacySettings': 'സ്വകാര്യത ക്രമീകരണങ്ങൾ',
    'profile.securitySettings': 'സുരക്ഷാ ക്രമീകരണങ്ങൾ',
    
    // Dashboard
    'dashboard.welcome': 'തിരികെ സ്വാഗതം',
    'dashboard.quickActions': 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ',
    'dashboard.recentActivity': 'സമീപകാല പ്രവർത്തനം',
    'dashboard.systemStatus': 'സിസ്റ്റം സ്റ്റാറ്റസ്',
    'dashboard.alerts': 'അലേർട്ടുകൾ',
    'dashboard.shortcuts': 'കുറുക്കുവഴികൾ',
    'dashboard.announcements': 'പ്രഖ്യാപനങ്ങൾ',
    
    // Documents
    'documents.allDocuments': 'എല്ലാ രേഖകളും',
    'documents.myDocuments': 'എന്റെ രേഖകൾ',
    'documents.sharedWithMe': 'എന്നോട് പങ്കിട്ടത്',
    'documents.recentDocuments': 'സമീപകാല രേഖകൾ',
    'documents.favoriteDocuments': 'പ്രിയപ്പെട്ട രേഖകൾ',
    'documents.archivedDocuments': 'ആർക്കൈവ് ചെയ്ത രേഖകൾ',
    'documents.uploadDocument': 'രേഖ അപ്‌ലോഡ് ചെയ്യുക',
    'documents.createDocument': 'രേഖ സൃഷ്ടിക്കുക',
    'documents.documentTitle': 'രേഖയുടെ ശീർഷകം',
    'documents.documentType': 'രേഖയുടെ തരം',
    'documents.lastModified': 'അവസാനം മാറ്റിയത്',
    'documents.fileSize': 'ഫയൽ വലുപ്പം',
    'documents.owner': 'ഉടമ',
    'documents.status': 'സ്ഥിതി',
    'documents.tags': 'ടാഗുകൾ',
    'documents.description': 'വിവരണം',
    'documents.preview': 'പ്രിവ്യൂ',
    'documents.download': 'ഡൗൺലോഡ്',
    'documents.share': 'പങ്കിടുക',
    'documents.noDocuments': 'രേഖകൾ കണ്ടെത്തിയില്ല',
    'documents.searchDocuments': 'രേഖകൾ തിരയുക...',
    
    // Upload
    'upload.uploadFiles': 'ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുക',
    'upload.dragAndDrop': 'ഫയലുകൾ ഇവിടെ വലിച്ചിടുക',
    'upload.orClickToSelect': 'അല്ലെങ്കിൽ ഫയലുകൾ തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക',
    'upload.supportedFormats': 'പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ',
    'upload.maxFileSize': 'പരമാവധി ഫയൽ വലുപ്പം',
    'upload.uploadProgress': 'അപ്‌ലോഡ് പുരോഗതി',
    'upload.uploadComplete': 'അപ്‌ലോഡ് പൂർത്തിയായി',
    'upload.uploadFailed': 'അപ്‌ലോഡ് പരാജയപ്പെട്ടു',
    'upload.processingFiles': 'ഫയലുകൾ പ്രോസസ്സ് ചെയ്യുന്നു...',
    'upload.selectFiles': 'ഫയലുകൾ തിരഞ്ഞെടുക്കുക',
    'upload.removeFile': 'ഫയൽ നീക്കം ചെയ്യുക',
    
    // Users
    'users.allUsers': 'എല്ലാ ഉപയോക്താക്കളും',
    'users.activeUsers': 'സജീവ ഉപയോക്താക്കൾ',
    'users.addUser': 'ഉപയോക്താവ് ചേർക്കുക',
    'users.editUser': 'ഉപയോക്താവ് എഡിറ്റ് ചെയ്യുക',
    'users.deleteUser': 'ഉപയോക്താവ് ഇല്ലാതാക്കുക',
    'users.userProfile': 'ഉപയോക്താവിന്റെ പ്രൊഫൈൽ',
    'users.firstName': 'പേരിന്റെ ആദ്യഭാഗം',
    'users.lastName': 'പേരിന്റെ അവസാനഭാഗം',
    'users.email': 'ഇമെയിൽ',
    'users.phone': 'ഫോൺ',
    'users.role': 'റോൾ',
    'users.department': 'വകുപ്പ്',
    'users.joinDate': 'ചേരാനുള്ള തീയതി',
    'users.lastLogin': 'അവസാന ലോഗിൻ',
    'users.userStatus': 'ഉപയോക്താവിന്റെ സ്ഥിതി',
    'users.permissions': 'അനുമതികൾ',
    
    // Settings
    'settings.generalSettings': 'പൊതു ക്രമീകരണങ്ങൾ',
    'settings.accountSettings': 'അക്കൗണ്ട് ക്രമീകരണങ്ങൾ',
    'settings.securitySettings': 'സുരക്ഷാ ക്രമീകരണങ്ങൾ',
    'settings.notificationSettings': 'അറിയിപ്പ് ക്രമീകരണങ്ങൾ',
    'settings.privacySettings': 'സ്വകാര്യത ക്രമീകരണങ്ങൾ',
    'settings.systemSettings': 'സിസ്റ്റം ക്രമീകരണങ്ങൾ',
    'settings.appearance': 'രൂപം',
    'settings.language': 'ഭാഷ',
    'settings.timezone': 'സമയമേഖല',
    'settings.theme': 'തീം',
    'settings.fontSize': 'ഫോണ്ട് വലുപ്പം',
    
    // Analytics
    'analytics.overview': 'വിശകലന അവലോകനം',
    'analytics.documentAnalytics': 'രേഖ വിശകലനം',
    'analytics.userAnalytics': 'ഉപയോക്താവ് വിശകലനം',
    'analytics.systemAnalytics': 'സിസ്റ്റം വിശകലനം',
    'analytics.performanceMetrics': 'പ്രകടന മെട്രിക്സ്',
    'analytics.usageStatistics': 'ഉപയോഗ സ്ഥിതിവിവരക്കണക്കുകൾ',
    'analytics.generateReport': 'റിപ്പോർട്ട് സൃഷ്ടിക്കുക',
    'analytics.exportData': 'ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുക',
    
    // AI Chat
    'aiChat.startConversation': 'സംഭാഷണം ആരംഭിക്കുക',
    'aiChat.typeMessage': 'നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
    'aiChat.sendMessage': 'സന്ദേശം അയയ്ക്കുക',
    'aiChat.clearChat': 'ചാറ്റ് ക്ലിയർ ചെയ്യുക',
    'aiChat.chatHistory': 'ചാറ്റ് ചരിത്രം',
    'aiChat.aiAssistant': 'AI സഹായി',
    'aiChat.thinking': 'AI ചിന്തിക്കുന്നു...',
    'aiChat.noMessages': 'ഇതുവരെ സന്ദേശങ്ങളില്ല',
    'aiChat.errorMessage': 'ക്ഷമിക്കണം, എന്തോ തെറ്റ് സംഭവിച്ചു',
    
    // Mobile
    'mobile.mobileView': 'മൊബൈൽ കാഴ്ച',
    'mobile.cameraCapture': 'ക്യാമറ ക്യാപ്ചർ',
    'mobile.takePhoto': 'ഫോട്ടോ എടുക്കുക',
    'mobile.retakePhoto': 'ഫോട്ടോ വീണ്ടും എടുക്കുക',
    'mobile.usePhoto': 'ഫോട്ടോ ഉപയോഗിക്കുക',
    'mobile.gallery': 'ഗാലറി',
    'mobile.uploadFromGallery': 'ഗാലറിയിൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക',
    'mobile.scanDocument': 'രേഖ സ്കാൻ ചെയ്യുക',
    
    // Messages
    'messages.saveSuccess': 'വിജയകരമായി സേവ് ചെയ്തു',
    'messages.saveError': 'സേവ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',
    'messages.deleteSuccess': 'വിജയകരമായി ഇല്ലാതാക്കി',
    'messages.deleteError': 'ഇല്ലാതാക്കുന്നതിൽ പരാജയപ്പെട്ടു',
    'messages.uploadSuccess': 'വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു',
    'messages.uploadError': 'അപ്‌ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',
    'messages.connectionError': 'കണക്ഷൻ പിശക്',
    'messages.serverError': 'സർവർ പിശക്',
    'messages.permissionDenied': 'അനുമതി നിഷേധിച്ചു',
    'messages.fileNotFound': 'ഫയൽ കണ്ടെത്തിയില്ല',
    'messages.updateSuccess': 'ഡാറ്റ വിജയകരമായി പുതുക്കി',
    'messages.updateError': 'ഡാറ്റ പുതുക്കുന്നതിൽ പരാജയപ്പെട്ടു',
    'messages.trainsetUpdated': 'ട്രെയിൻസെറ്റ് വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു',
    'messages.tryAgain': 'ദയവായി ഒരു നിമിഷത്തിനുശേഷം വീണ്ടും ശ്രമിക്കുക',
    
    // Dashboard specific
    'dashboard.monitorTrainsets': 'എല്ലാ ട്രെയിൻസെറ്റുകളും അവയുടെ സ്റ്റാറ്റസും പ്രവർത്തന മെട്രിക്സും നിരീക്ഷിക്കുക',
    
    // Accessibility
    'accessibility.enableHighContrast': 'ഹൈ കോൺട്രാസ്റ്റ് മോഡ് പ്രവർത്തനക്ഷമമാക്കുക',
    'accessibility.disableHighContrast': 'ഹൈ കോൺട്രാസ്റ്റ് മോഡ് നിർജ്ജീവമാക്കുക',
    'accessibility.skipToContent': 'മുഖ്യ ഉള്ളടക്കത്തിലേക്ക് പോകുക',
    'accessibility.openMenu': 'മെനു തുറക്കുക',
    'accessibility.closeMenu': 'മെനു അടയ്ക്കുക',
    'accessibility.toggleSidebar': 'സൈഡ്ബാർ ടോഗിൾ ചെയ്യുക',
    
    // Footer
    'footer.poweredBy': 'നിർമ്മിച്ചത്',
    'footer.smartHub': 'KMRL-SIH 2025',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Load language preference from localStorage
    const stored = localStorage.getItem('kmrl-language') as Language
    if (stored && (stored === 'en' || stored === 'ml')) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('kmrl-language', lang)
  }

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]]
    return translation || fallback || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}