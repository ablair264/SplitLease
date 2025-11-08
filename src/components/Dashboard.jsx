import MasterLayout from './MasterLayout'
import DashboardPage from './DashboardPage'
import BestDealsPage from './BestDealsPage'
import UploadPage from './UploadPage'

const Dashboard = () => {
  const renderPage = ({ activePage, setActivePage }) => {
    switch (activePage) {
      case 'pricing':
        return <DashboardPage />
      case 'upload':
        return <UploadPage />
      case 'deals':
        return <BestDealsPage />
      case 'analytics':
        return (
          <div className="pt-24 px-7">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">📊 Analytics</h2>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )
      case 'providers':
        return (
          <div className="pt-24 px-7">
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