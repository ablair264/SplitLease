import { useEffect, useMemo, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Modal } from './ui/modal'
import { FileText, UserPlus, Download } from 'lucide-react'
import { api } from '../lib/api'

const initialEnquiries = []

const statuses = ['Draft', 'Contacted', 'Initial Call', 'Commitment', 'Implementation', 'Pending', 'Live', 'Lost']
const salespeople = ['Alice', 'Bob', 'Charlie']

export default function SSSales() {
  const [query, setQuery] = useState('')
  const [enquiries, setEnquiries] = useState(initialEnquiries)
  const [showNew, setShowNew] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportSalesperson, setReportSalesperson] = useState(salespeople[0])

  const [form, setForm] = useState({
    customerName: '', customerAddress: '', customerPhone: '', customerEmail: '',
    primaryName: '', primaryPhone: '', primaryEmail: '', salesperson: salespeople[0], referrer: 'Website', status: 'Draft'
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await api.getSSEnquiries({ search: query })
        if (!cancelled && r && r.success) setEnquiries(r.data || [])
      } catch (_) {}
    }
    load()
    return () => { cancelled = true }
  }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enquiries.filter(e => !q || e.customerName.toLowerCase().includes(q) || (e.email||'').toLowerCase().includes(q) || (e.phone||'').toLowerCase().includes(q))
  }, [query, enquiries])

  const addEnquiry = async () => {
    try {
      const payload = {
        customerName: form.customerName,
        customerAddress: form.customerAddress,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        primaryName: form.primaryName,
        primaryPhone: form.primaryPhone,
        primaryEmail: form.primaryEmail,
        salesperson: form.salesperson,
        referrer: form.referrer,
        status: form.status,
      }
      const r = await api.createSSEnquiry(payload)
      if (r && r.success) {
        const list = await api.getSSEnquiries({ search: '' })
        if (list && list.success) setEnquiries(list.data || [])
        setShowNew(false)
      }
    } catch (_) {}
  }

  const [reportRows, setReportRows] = useState([])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await api.getSSReport(reportSalesperson)
        if (!cancelled && r && r.success) setReportRows(r.data || [])
      } catch (_) {}
    }
    if (showReport) load()
    return () => { cancelled = true }
  }, [reportSalesperson, showReport])

  return (
    <div className="pt-8 px-7 space-y-6">
      {/* Search + Actions */}
      <Card className="p-4 bg-card border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="md:col-span-2">
            <Input placeholder="Search by customer, email or phone" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowNew(true)} className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Enquiry</Button>
            <Button onClick={() => setShowReport(true)} className="bg-amber-400 text-black hover:bg-amber-500 flex items-center gap-2"><Download className="w-4 h-4" /> Generate Report</Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Enquiry Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Salesperson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-secondary/40">
                  <td className="px-6 py-3 text-foreground">{row.customerName}</td>
                  <td className="px-6 py-3 text-foreground">{row.status}</td>
                  <td className="px-6 py-3 text-foreground">{row.salesperson}</td>
                  <td className="px-6 py-3 text-foreground">{row.email}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-right">
                    <Button variant="outline" className="mr-2">View Enquiry</Button>
                    <Button variant="outline">Update Status</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Enquiry Modal */}
      <Modal open={showNew} title="New Enquiry">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Customer Name" value={form.customerName} onChange={e=>setForm({...form, customerName:e.target.value})} />
            <Input placeholder="Customer Address" value={form.customerAddress} onChange={e=>setForm({...form, customerAddress:e.target.value})} />
            <Input placeholder="Customer Phone" value={form.customerPhone} onChange={e=>setForm({...form, customerPhone:e.target.value})} />
            <Input placeholder="Customer Email" value={form.customerEmail} onChange={e=>setForm({...form, customerEmail:e.target.value})} />
            <Input placeholder="Primary Contact Name" value={form.primaryName} onChange={e=>setForm({...form, primaryName:e.target.value})} />
            <Input placeholder="Primary Contact Phone" value={form.primaryPhone} onChange={e=>setForm({...form, primaryPhone:e.target.value})} />
            <Input placeholder="Primary Contact Email" value={form.primaryEmail} onChange={e=>setForm({...form, primaryEmail:e.target.value})} />
            <Select value={form.salesperson} onChange={e=>setForm({...form, salesperson:e.target.value})}>
              {salespeople.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={form.referrer} onChange={e=>setForm({...form, referrer:e.target.value})}>
              {['Website','Partner','Referral','Other'].map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
            <Button className="bg-amber-400 text-black hover:bg-amber-500" onClick={addEnquiry}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal open={showReport} title="Sales Report">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Salesperson:</span>
            <Select value={reportSalesperson} onChange={e=>setReportSalesperson(e.target.value)}>
              {salespeople.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="overflow-x-auto border border-border rounded">
            <table className="w-full">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">Salesperson</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">Referrer</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {reportRows.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{r.customerName}</td>
                    <td className="px-4 py-2">{r.salesperson}</td>
                    <td className="px-4 py-2">{r.referrer}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={()=>setShowReport(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
