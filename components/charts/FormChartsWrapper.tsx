"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormChartsWrapperProps {
  questionId: string
  questionTitle: string
  questionType: string
  responseCounts: Record<string, number>
  totalResponses: number
}

// Composant de chargement
const ChartLoading = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du graphique...</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export function FormCharts(props: FormChartsWrapperProps) {
  const [FormChartsComponent, setFormChartsComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger le composant seulement côté client
    import('./FormCharts').then(module => {
      setFormChartsComponent(() => module.FormCharts)
      setIsLoading(false)
    }).catch(error => {
      console.error('Erreur lors du chargement de FormCharts:', error)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return <ChartLoading />
  }

  if (!FormChartsComponent) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement du graphique
          </div>
        </CardContent>
      </Card>
    )
  }

  return <FormChartsComponent {...props} />
}
