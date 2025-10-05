"use client"

import { useAuth } from '@/hooks/use-auth'
import { RoleGuard } from '@/hooks/use-role-access'
import { OperatorSidebar } from '@/components/operator/operator-sidebar'
import { OperatorHeader } from '@/components/operator/operator-header'

export default function HamburgerDemoPage() {
  const { user } = useAuth()

  return (
    <RoleGuard role="Operator">
      <div className="min-h-screen bg-gray-50">
        {/* Hamburger Sidebar */}
        <OperatorSidebar />
        
        {/* Main Content */}
        <div className="lg:pl-16 transition-all duration-300">
          {/* Header */}
          <OperatorHeader user={user} />
          
          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Hamburger Sidebar Demo
                </h1>
                <p className="text-gray-600">
                  This page demonstrates the new hamburger-style sidebar. The sidebar:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li>• Starts collapsed at 16px width showing only icons</li>
                  <li>• Expands to 256px width on hover showing full labels</li>
                  <li>• Shows tooltips when collapsed for better UX</li>
                  <li>• Has a mobile-responsive overlay menu for small screens</li>
                  <li>• Includes user profile section at the bottom</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  How to Use
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Desktop:</strong> Hover over the sidebar on the left to expand it and see all menu options.
                  </p>
                  <p>
                    <strong>Mobile:</strong> Tap the hamburger menu button (☰) in the top-left corner to open the sidebar.
                  </p>
                  <p>
                    <strong>Navigation:</strong> Click on any icon or menu item to navigate between different sections.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">Features</h3>
                <div className="text-green-700">
                  ✓ Responsive design for all screen sizes<br/>
                  ✓ Smooth hover animations<br/>
                  ✓ Icon-only collapsed state saves space<br/>
                  ✓ Full-width expanded state on hover<br/>
                  ✓ Active page highlighting<br/>
                  ✓ KMRL branding integration
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}