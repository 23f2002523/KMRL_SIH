"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Database, Palette, Globe } from "lucide-react"

export default function SettingsPage() {
  const [language, setLanguage] = useState<"en" | "ml">("en")

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === "en" ? "Settings" : "ക്രമീകരണങ്ങൾ"}</h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Manage your account and application preferences"
              : "നിങ്ങളുടെ അക്കൗണ്ടും ആപ്ലിക്കേഷൻ മുൻഗണനകളും കൈകാര്യം ചെയ്യുക"}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {language === "en" ? "Profile" : "പ്രൊഫൈൽ"}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {language === "en" ? "Notifications" : "അറിയിപ്പുകൾ"}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {language === "en" ? "Security" : "സുരക്ഷ"}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {language === "en" ? "Appearance" : "രൂപം"}
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {language === "en" ? "Language" : "ഭാഷ"}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {language === "en" ? "System" : "സിസ്റ്റം"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Profile Information" : "പ്രൊഫൈൽ വിവരങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "First Name" : "പേര്"}</Label>
                    <Input defaultValue="Rajesh" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Last Name" : "കുടുംബപ്പേര്"}</Label>
                    <Input defaultValue="Kumar" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Email" : "ഇമെയിൽ"}</Label>
                    <Input defaultValue="rajesh.kumar@kmrl.gov.in" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Phone" : "ഫോൺ"}</Label>
                    <Input defaultValue="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Department" : "വകുപ്പ്"}</Label>
                    <Select defaultValue="operations">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">{language === "en" ? "Operations" : "പ്രവർത്തനങ്ങൾ"}</SelectItem>
                        <SelectItem value="safety">{language === "en" ? "Safety" : "സുരക്ഷ"}</SelectItem>
                        <SelectItem value="hr">{language === "en" ? "Human Resources" : "മാനവ വിഭവശേഷി"}</SelectItem>
                        <SelectItem value="engineering">{language === "en" ? "Engineering" : "എഞ്ചിനീയറിംഗ്"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Role" : "റോൾ"}</Label>
                    <Select defaultValue="manager">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{language === "en" ? "Administrator" : "അഡ്മിനിസ്ട്രേറ്റർ"}</SelectItem>
                        <SelectItem value="manager">{language === "en" ? "Manager" : "മാനേജർ"}</SelectItem>
                        <SelectItem value="user">{language === "en" ? "User" : "ഉപയോക്താവ്"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>{language === "en" ? "Save Changes" : "മാറ്റങ്ങൾ സേവ് ചെയ്യുക"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Notification Preferences" : "അറിയിപ്പ് മുൻഗണനകൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Email Notifications" : "ഇമെയിൽ അറിയിപ്പുകൾ"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Receive notifications via email" : "ഇമെയിൽ വഴി അറിയിപ്പുകൾ സ്വീകരിക്കുക"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Push Notifications" : "പുഷ് അറിയിപ്പുകൾ"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en"
                        ? "Receive push notifications on your device"
                        : "നിങ്ങളുടെ ഉപകരണത്തിൽ പുഷ് അറിയിപ്പുകൾ സ്വീകരിക്കുക"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "SMS Notifications" : "SMS അറിയിപ്പുകൾ"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en"
                        ? "Receive important notifications via SMS"
                        : "SMS വഴി പ്രധാന അറിയിപ്പുകൾ സ്വീകരിക്കുക"}
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Document Approval Alerts" : "രേഖ അംഗീകാര അലേർട്ടുകൾ"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en"
                        ? "Get notified when documents need approval"
                        : "രേഖകൾക്ക് അംഗീകാരം ആവശ്യമുള്ളപ്പോൾ അറിയിപ്പ് ലഭിക്കുക"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Security Settings" : "സുരക്ഷാ ക്രമീകരണങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Current Password" : "നിലവിലെ പാസ്‌വേഡ്"}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "New Password" : "പുതിയ പാസ്‌വേഡ്"}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Confirm New Password" : "പുതിയ പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക"}</Label>
                  <Input type="password" />
                </div>
                <Button>{language === "en" ? "Update Password" : "പാസ്‌വേഡ് അപ്ഡേറ്റ് ചെയ്യുക"}</Button>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Two-Factor Authentication" : "ടു-ഫാക്ടർ ഓതന്റിക്കേഷൻ"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en"
                        ? "Add an extra layer of security to your account"
                        : "നിങ്ങളുടെ അക്കൗണ്ടിന് അധിക സുരക്ഷാ പാളി ചേർക്കുക"}
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Appearance Settings" : "രൂപ ക്രമീകരണങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Theme" : "തീം"}</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{language === "en" ? "Light" : "ലൈറ്റ്"}</SelectItem>
                      <SelectItem value="dark">{language === "en" ? "Dark" : "ഡാർക്ക്"}</SelectItem>
                      <SelectItem value="system">{language === "en" ? "System" : "സിസ്റ്റം"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Font Size" : "ഫോണ്ട് സൈസ്"}</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{language === "en" ? "Small" : "ചെറുത്"}</SelectItem>
                      <SelectItem value="medium">{language === "en" ? "Medium" : "ഇടത്തരം"}</SelectItem>
                      <SelectItem value="large">{language === "en" ? "Large" : "വലുത്"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Language Settings" : "ഭാഷാ ക്രമീകരണങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Interface Language" : "ഇന്റർഫേസ് ഭാഷ"}</Label>
                  <Select value={language} onValueChange={(value: "en" | "ml") => setLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ml">മലയാളം</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Document Language Preference" : "രേഖ ഭാഷാ മുൻഗണന"}</Label>
                  <Select defaultValue="both">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English Only</SelectItem>
                      <SelectItem value="ml">Malayalam Only</SelectItem>
                      <SelectItem value="both">{language === "en" ? "Both Languages" : "രണ്ട് ഭാഷകളും"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "System Settings" : "സിസ്റ്റം ക്രമീകരണങ്ങൾ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Auto-save Documents" : "രേഖകൾ ഓട്ടോ-സേവ്"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Automatically save document changes" : "രേഖ മാറ്റങ്ങൾ സ്വയമേവ സേവ് ചെയ്യുക"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{language === "en" ? "Offline Mode" : "ഓഫ്‌ലൈൻ മോഡ്"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Enable offline document access" : "ഓഫ്‌ലൈൻ രേഖ ആക്സസ് പ്രാപ്തമാക്കുക"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{language === "en" ? "Data Retention Period" : "ഡാറ്റ നിലനിർത്തൽ കാലയളവ്"}</Label>
                  <Select defaultValue="5years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">{language === "en" ? "1 Year" : "1 വർഷം"}</SelectItem>
                      <SelectItem value="3years">{language === "en" ? "3 Years" : "3 വർഷം"}</SelectItem>
                      <SelectItem value="5years">{language === "en" ? "5 Years" : "5 വർഷം"}</SelectItem>
                      <SelectItem value="10years">{language === "en" ? "10 Years" : "10 വർഷം"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
