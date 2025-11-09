import MasterLayout from './MasterLayout'
import DashboardPage from './DashboardPage'
import BestDealsPage from './BestDealsPage'
import PricingMatrixPage from './PricingMatrixPage'
import SSCustomers from './SSCustomers'
import SSSales from './SSSales'

const Dashboard = () => {
  const renderPage = ({ activePage, setActivePage }) => {
    switch (activePage) {
      case 'pricing':
        return <DashboardPage />
      case 'upload':
        return <PricingMatrixPage />
      case 'deals':
        return <BestDealsPage />
      case 'ss_customers':
        return <SSCustomers />
      case 'ss_sales':
        return <SSSales />
      case 'analytics':
        return (
          <div className="pt-8 px-7">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">📊 Analytics</h2>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )
      case 'providers':
        return (
          <div className="pt-8 px-7">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">🏢 Providers</h2>
              <p className="text-muted-foreground">Provider management coming soon...</p>
            </div>
          </div>
        )
      default:
        return <DashboardPage />
    }
  }

  return <MasterLayout currentPage="pricing">{renderPage}</MasterLayout>
}

export default Dashboard
