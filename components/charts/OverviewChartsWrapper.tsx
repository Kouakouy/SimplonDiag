"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OverviewChartsWrapperProps {
  form: any
  responses: any[]
  analyzeQuestionResponses: (questionId: string) => {
    totalResponses: number
    responseCounts: Record<string, number>
    uniqueResponses: number
  }
}

// Composant de chargement
const ChartLoading = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des graphiques...</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export function OverviewCharts(props: OverviewChartsWrapperProps) {
  const [OverviewChartsComponent, setOverviewChartsComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger le composant seulement côté client
    import('./OverviewCharts').then(module => {
      setOverviewChartsComponent(() => module.OverviewCharts)
      setIsLoading(false)
    }).catch(error => {
      console.error('Erreur lors du chargement d\'OverviewCharts:', error)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return <ChartLoading />
  }

  if (!OverviewChartsComponent) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des graphiques
          </div>
        </CardContent>
      </Card>
    )
  }

  return <OverviewChartsComponent {...props} />
}
