'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Upload, AlertCircle, CheckCircle, Eye, Grid, Table as TableIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { buildApiUrl } from '@/lib/api-config'

interface UploadResult {
  id: string
  fileName: string
  uploadedAt: string
  status: 'completed' | 'failed'
  totalRows: number
  successCount: number
  failCount: number
  parseErrors: any[]
  importErrors: any[]
  categorySummary: Record<string, number>
  branchSummary: Record<string, number>
  salesPersonSummary: Record<string, number>
  previewData: any[]
}

type ViewMode = 'table' | 'grid'

export default function AdminUploadsPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [selectedResult, setSelectedResult] = useState<UploadResult | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load results from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_sales_import_results')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUploadResults(parsed)
      }
    } catch (e) {
      console.error('Failed to load results:', e)
    }
  }, [])

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // First, read file locally to show preview
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const previewData = XLSX.utils.sheet_to_json(worksheet).slice(0, 5) // First 5 rows

      // Upload to backend
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch(buildApiUrl('/transactions/import/sales'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Import failed')
      }

      const uploadResult: UploadResult = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        totalRows: result.data.totalRows,
        successCount: result.data.successCount,
        failCount: result.data.failCount,
        parseErrors: result.data.parseErrors || [],
        importErrors: result.data.importErrors || [],
        categorySummary: result.data.categorySummary || {},
        branchSummary: result.data.branchSummary || {},
        salesPersonSummary: result.data.salesPersonSummary || {},
        previewData,
      }

      const updated = [uploadResult, ...uploadResults]
      setUploadResults(updated)
      localStorage.setItem('admin_sales_import_results', JSON.stringify(updated))
      setSelectedResult(uploadResult)

      toast.success(`✅ Successfully imported ${result.data.successCount} transactions!`)
      setUploadProgress(0)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload file'
      toast.error(errorMsg)
      setUploadProgress(0)

      const failedResult: UploadResult = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'failed',
        totalRows: 0,
        successCount: 0,
        failCount: 0,
        parseErrors: [{ error: errorMsg }],
        importErrors: [],
        categorySummary: {},
        branchSummary: {},
        salesPersonSummary: {},
        previewData: [],
      }

      const updated = [failedResult, ...uploadResults]
      setUploadResults(updated)
      localStorage.setItem('admin_sales_import_results', JSON.stringify(updated))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">📊 Bulk Import Sales (Admin)</h1>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Sales Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={() => !isUploading && setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-secondary bg-blue-50' : 'border-gray-300 hover:border-secondary'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="font-semibold mb-1">Drag and drop your Excel file here</p>
            <p className="text-sm text-gray-600 mb-4">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              disabled={isUploading}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                'Choose File'
              )}
            </Button>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading: {Math.round(uploadProgress)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-2">📋 Required Excel Columns:</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>✓ <strong>Customer Name</strong> - Customer/buyer name</li>
                <li>✓ <strong>Item Name</strong> - Product/item name (auto-categorized)</li>
                <li>✓ <strong>Quantity</strong> - Number of units sold</li>
                <li>✓ <strong>Selling Price</strong> - Price per unit</li>
                <li>✓ <strong>Sold By</strong> - Salesperson name</li>
                <li>✓ <strong>Branch</strong> - "Warehouse" or "Shop"</li>
                <li>✓ <strong>Date</strong> - Transaction date (optional)</li>
                <li>• <strong>Discount</strong>, <strong>Tax</strong>, <strong>Notes</strong> (optional)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Result Data Preview - MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0 border-b-2 border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{selectedResult.fileName}</h2>
                  <p className="text-blue-100 text-sm">
                    📊 {selectedResult.totalRows} total rows • {selectedResult.successCount} imported • {formatDate(selectedResult.uploadedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-sm px-6 py-2 ml-4 flex-shrink-0"
                >
                  ✕ Close
                </Button>
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-500/20 rounded px-3 py-2">
                  <p className="text-blue-100">By Category</p>
                  <p className="font-bold">{Object.keys(selectedResult.categorySummary).length} types</p>
                </div>
                <div className="bg-green-500/20 rounded px-3 py-2">
                  <p className="text-green-100">By Branch</p>
                  <p className="font-bold">{Object.keys(selectedResult.branchSummary).length} branches</p>
                </div>
                <div className="bg-yellow-500/20 rounded px-3 py-2">
                  <p className="text-yellow-100">By Salesperson</p>
                  <p className="font-bold">{Object.keys(selectedResult.salesPersonSummary).length} people</p>
                </div>
                <div className={`rounded px-3 py-2 ${selectedResult.failCount === 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  <p className={selectedResult.failCount === 0 ? 'text-emerald-100' : 'text-red-100'}>Status</p>
                  <p className="font-bold">{selectedResult.failCount === 0 ? '✅ Clean' : `⚠️ ${selectedResult.failCount} errors`}</p>
                </div>
              </div>

              {/* View Mode Tabs */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  <TableIcon size={18} />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  <Grid size={18} />
                  Cards
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-white">
              {viewMode === 'table' ? (
                <div className="w-full">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-800 w-10 bg-blue-100 border-r border-blue-300 text-xs">#</th>
                        {selectedResult.previewData[0] && Object.keys(selectedResult.previewData[0]).map((key) => (
                          <th
                            key={key}
                            className="px-3 py-2 text-left font-semibold text-gray-800 whitespace-nowrap bg-blue-50 border-r border-blue-200 text-xs"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResult.previewData.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-200 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition-all`}
                        >
                          <td className="px-3 py-2 font-semibold text-gray-600 text-center bg-gray-50 border-r border-gray-200 font-mono text-xs">{idx + 1}</td>
                          {Object.entries(row).map(([key, value]) => (
                            <td
                              key={`${idx}-${key}`}
                              className="px-3 py-2 text-gray-800 font-medium border-r border-gray-200 text-xs"
                              title={String(value || '')}
                            >
                              {typeof value === 'number' ? (
                                key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') 
                                  ? formatCurrency(value) 
                                  : value.toLocaleString()
                              ) : (
                                String(value || '-')
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedResult.previewData.map((row, idx) => (
                    <Card key={idx} className="border-2 border-gray-300 hover:border-blue-500 transition-all">
                      <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white pb-2 pt-3 px-4">
                        <span className="font-bold text-lg">#{idx + 1}</span>
                      </CardHeader>
                      <CardContent className="pt-3 space-y-2 pb-3 px-4 text-xs">
                        {Object.entries(row).map(([key, value]) => (
                          <div key={`${idx}-${key}`} className="pb-2 border-b border-gray-300 last:border-0">
                            <p className="font-semibold text-gray-700 text-blue-600 mb-1 uppercase">{key}</p>
                            <p className="text-gray-800 font-medium break-words">
                              {typeof value === 'number' ? (
                                key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') 
                                  ? formatCurrency(value) 
                                  : value.toLocaleString()
                              ) : (
                                String(value || '-')
                              )}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Summaries */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-600 px-4 py-3 flex-shrink-0 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.entries(selectedResult.categorySummary).length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">📦 By Category:</p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(selectedResult.categorySummary).map(([cat, count]) => (
                        <p key={cat} className="text-gray-600"><span className="font-semibold">{cat}:</span> {count}</p>
                      ))}
                    </div>
                  </div>
                )}
                {Object.entries(selectedResult.branchSummary).length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">🏢 By Branch:</p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(selectedResult.branchSummary).map(([branch, count]) => (
                        <p key={branch} className="text-gray-600"><span className="font-semibold">{branch}:</span> {count}</p>
                      ))}
                    </div>
                  </div>
                )}
                {Object.entries(selectedResult.salesPersonSummary).length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">👤 Top Salespersons:</p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(selectedResult.salesPersonSummary)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([person, count]) => (
                          <p key={person} className="text-gray-600"><span className="font-semibold">{person}:</span> {count}</p>
                        ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-700 mb-2">📈 Total Summary:</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-600"><span className="font-semibold">✅ Imported:</span> {selectedResult.successCount}</p>
                    {selectedResult.failCount > 0 && (
                      <p className="text-red-600"><span className="font-semibold">❌ Failed:</span> {selectedResult.failCount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upload History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">📋 Upload History</h2>
        {uploadResults.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No uploads yet. Upload your first file to get started!
            </CardContent>
          </Card>
        ) : (
          uploadResults.map((result: UploadResult) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px] grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">📄 File Name</p>
                      <p className="font-semibold text-sm break-words">{result.fileName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">📅 Date</p>
                      <p className="text-sm">{formatDate(result.uploadedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">✅ Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {result.status === 'completed' ? (
                          <>
                            <CheckCircle className="text-success" size={16} />
                            <Badge variant="success">Completed</Badge>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="text-danger" size={16} />
                            <Badge variant="danger">Failed</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">📊 Results</p>
                      <p className="text-sm">
                        <span className="font-semibold text-success">{result.successCount}</span> imported
                        {result.failCount > 0 && (
                          <span className="text-danger ml-1"> / {result.failCount} errors</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {result.previewData && result.previewData.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResult(result)}
                        className="flex gap-2"
                      >
                        <Eye size={16} />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


