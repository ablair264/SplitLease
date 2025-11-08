import { useState } from 'react'
import { DollarSign, Award, BarChart3, Building2, Upload } from 'lucide-react'

const MasterLayout = ({ children, currentPage = 'pricing' }) => {
  const [activePage, setActivePage] = useState(currentPage)

  const menuItems = [
    { id: 'pricing', label: 'Pricing', icon: DollarSign, active: true },
    { id: 'upload', label: 'Upload', icon: Upload, active: false },
    { id: 'deals', label: 'Best Deals', icon: Award, active: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
    { id: 'providers', label: 'Providers', icon: Building2, active: false }
  ]

  return (
    <div className="w-full h-screen relative bg-white overflow-hidden">
      <div className="w-full h-full bg-slate-50 rounded-3xl overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-52 h-full p-4 left-0 top-0 absolute border-r border-black-10%/20 flex flex-col justify-start items-center gap-2">
          {/* Logo */}
          <div className="self-stretch pb-3 flex flex-col justify-start items-start gap-1">
            <div className="self-stretch px-2 py-6 rounded-lg flex justify-start items-center gap-2">
              <div className="w-6 h-6 relative bg-black-4%/10 rounded-full overflow-hidden">
                {/* Logo placeholder */}
              </div>
              <div className="text-black-100% text-sm font-normal font-inter leading-5">ByeWind</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="self-stretch pb-1 flex flex-col justify-start items-start gap-1">
                <div 
                  className={`self-stretch p-2 rounded-xl flex justify-start items-center gap-1 cursor-pointer transition-colors ${
                    activePage === item.id ? 'bg-black-4%/10' : 'hover:bg-black-4%/5'
                  }`}
                  onClick={() => setActivePage(item.id)}
                >
                  <div className="flex-1 rounded-xl flex justify-start items-center gap-2">
                    <item.icon className="w-5 h-5 text-foreground" />
                    <div className="text-black-100% text-sm font-normal font-inter leading-5">{item.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom section for additional controls */}
          <div className="mt-auto mb-4 self-stretch">
            <div className="p-2 bg-black-4%/5 rounded-lg">
              <div className="text-xs text-Contents-Tertiary text-center">
                Lease Analyzer v1.0
              </div>
            </div>
          </div>
        </div>

        {/* Activities Sidebar */}
        <div className="w-72 h-full p-4 right-0 top-0 absolute border-l border-black-10%/20 flex flex-col justify-start items-start gap-4 overflow-hidden">
          {/* Activities Section */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch px-1 py-2 rounded-xl flex justify-start items-center gap-2">
              <div className="flex-1 rounded-xl flex flex-col justify-center items-start">
                <div className="self-stretch text-black-100% text-sm font-normal font-inter leading-5">Activities</div>
              </div>
            </div>
            
            {[
              { title: 'New Pricing for ALD', time: 'Just now' },
              { title: 'New Pricing for Lex', time: '59 minutes ago' },
              { title: 'New Pricing for Novuna', time: '12 hours ago' },
              { title: 'Special Offer - Cupra Leon', time: 'Today, 11:59 AM' },
              { title: 'New Pricing for Novuna', time: 'Feb 2, 2025' }
            ].map((activity, index) => (
              <div key={index} className="self-stretch p-2 rounded-xl flex justify-start items-start gap-2">
                <div className="w-6 h-6 bg-black-4%/10 rounded-full flex justify-center items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 rounded-xl flex flex-col justify-center items-start">
                  <div className="self-stretch text-black-100% text-sm font-normal font-inter leading-5 line-clamp-1">{activity.title}</div>
                  <div className="self-stretch text-black-40%/40 text-xs font-normal font-inter leading-4">{activity.time}</div>
                </div>
              </div>
            ))}

            {/* Timeline connector */}
            <div className="w-px h-48 left-5 top-20 absolute flex flex-col justify-start items-center gap-10 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-px h-4 bg-black-10%/20"></div>
              ))}
            </div>
          </div>

          {/* Top 10 Offers */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch px-1 py-2 rounded-xl flex justify-start items-center gap-2">
              <div className="flex-1 rounded-xl flex flex-col justify-center items-start">
                <div className="self-stretch text-black-100% text-sm font-normal font-inter leading-5">Top 10 Offers</div>
              </div>
            </div>
            
            {[
              'Cupra Leon',
              'Ford Capri', 
              'Omoda 5',
              'MG ZS',
              'Tesla Model Y',
              'Tesla Model 3'
            ].map((offer, index) => (
              <div key={index} className="self-stretch p-2 rounded-lg flex justify-start items-center gap-2">
                <div className="w-6 h-6 bg-black-4%/10 rounded-full flex justify-center items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
                <div className="rounded-xl flex flex-col justify-center items-start">
                  <div className="text-black-100% text-sm font-normal font-inter leading-5">{offer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="ml-52 mr-72 h-full overflow-y-auto">
          {children({ activePage, setActivePage })}
        </div>
      </div>
    </div>
  )
}

export default MasterLayout
