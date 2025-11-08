import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { Card } from './ui/card'

const DashboardPage = () => {
  const metrics = [
    {
      title: 'Current Q Ratesheets',
      value: '4',
      change: '+11.01%',
      isPositive: true,
      bgColor: 'bg-amber-400'
    },
    {
      title: 'Vehicle Models',
      value: '9954',
      change: '-0.03%',
      isPositive: false,
      bgColor: 'bg-background-4'
    },
    {
      title: 'Deals above 90%',
      value: '256',
      change: '+15.03%',
      isPositive: true,
      bgColor: 'bg-background-5'
    },
    {
      title: 'Top Funder',
      value: 'Novuna',
      change: '+6.08%',
      isPositive: true,
      bgColor: 'bg-background-4',
      isText: true
    }
  ]

  return (
    <div className="pt-8 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-black-100% text-sm font-semibold font-inter leading-5">Overview</div>
        <div className="px-2 py-1 rounded-lg flex justify-center items-center gap-1">
          <div className="text-black-100% text-xs font-normal font-inter leading-4">Today</div>
          <ChevronDown className="w-4 h-4 text-black-40%/40" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="flex justify-start items-start gap-7 flex-wrap mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className={`flex-1 min-w-48 p-6 ${metric.bgColor} rounded-[20px] border-none shadow-none`}>
            <div className="flex flex-col justify-start items-start gap-2">
              <div className="self-stretch text-sm font-normal font-inter leading-5" 
                   style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                {metric.title}
              </div>
              <div className="self-stretch flex justify-between items-center">
                <div className={`text-2xl font-semibold font-inter leading-8 ${metric.isText ? 'text-lg font-medium leading-7' : ''}`}
                     style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                  {metric.value}
                </div>
                <div className="flex justify-end items-center gap-2">
                  <div className="text-xs font-normal font-inter leading-4"
                       style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                    {metric.change}
                  </div>
                  {metric.isPositive ? (
                    <TrendingUp className="w-4 h-4" style={{ color: metric.bgColor === 'bg-amber-400' ? '#04DE71' : 'black' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-black" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-6 bg-muted rounded-2xl border border-input">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-Contents-Primary">📈 Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New ratebook processed', provider: 'Lex Autolease', time: '2 hours ago', status: 'success' },
                { action: 'Price update detected', provider: 'Arval', time: '5 hours ago', status: 'info' },
                { action: 'Best deals refreshed', provider: 'Multiple', time: '1 day ago', status: 'success' },
                { action: 'System maintenance', provider: 'System', time: '2 days ago', status: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-Contents-Primary">{activity.action}</div>
                    <div className="text-xs text-Contents-Tertiary">{activity.provider} • {activity.time}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'info' ? 'bg-blue-500' :
                    activity.status === 'warning' ? 'bg-amber-500' : 'bg-gray-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 bg-muted rounded-2xl border border-input">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-Contents-Primary">⚡ Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-amber-400">£285</div>
                <div className="text-xs text-Contents-Tertiary">Avg Monthly Payment</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-500">87</div>
                <div className="text-xs text-Contents-Tertiary">Avg Deal Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-500">36</div>
                <div className="text-xs text-Contents-Tertiary">Avg Term (months)</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-500">12K</div>
                <div className="text-xs text-Contents-Tertiary">Avg Mileage</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 p-6 bg-muted rounded-2xl border border-input">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-Contents-Primary">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📤</div>
                <div className="font-medium text-sm">Upload New Ratebook</div>
                <div className="text-xs text-Contents-Tertiary">Add pricing from providers</div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-medium text-sm">View Best Deals</div>
                <div className="text-xs text-Contents-Tertiary">Browse top offers</div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-sm">Analytics</div>
                <div className="text-xs text-Contents-Tertiary">View detailed reports</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
