"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { AnimatedCard, AnimatedMetric, PulseIndicator } from "@/components/ui/animated-card"
// import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  Eye,
  Activity,
  Zap
} from "lucide-react"

interface RealTimeMetricsProps {
  responses: any[]
  serverStats?: { views: number; submissions: number; completionRate: number } | null
  timeRange: string
  lastRefresh: Date
}

export function RealTimeMetrics({ responses, serverStats, timeRange, lastRefresh }: RealTimeMetricsProps) {
  const [previousMetrics, setPreviousMetrics] = useState({
    responses: 0,
    views: 0,
    completionRate: 0
  })

  const totalResponses = responses.length
  const totalViews = serverStats?.views ?? totalResponses * 3
  const completionRate = serverStats?.completionRate ?? (totalViews > 0 ? (totalResponses / totalViews) * 100 : 0)
  
  // Calculer les tendances
  const responseTrend = totalResponses > previousMetrics.responses ? 'up' : 'down'
  const viewTrend = totalViews > previousMetrics.views ? 'up' : 'down'
  const completionTrend = completionRate > previousMetrics.completionRate ? 'up' : 'down'

  // Mettre à jour les métriques précédentes
  useEffect(() => {
    setPreviousMetrics({
      responses: totalResponses,
      views: totalViews,
      completionRate: completionRate
    })
  }, [totalResponses, totalViews, completionRate])

  // Calculer les métriques de performance
  const avgResponseTime = "2m 34s" // Simulé
  const peakHour = "14h-16h" // Simulé
  const responseRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : 0

  // Calculer les réponses par heure (simulé)
  const responsesByHour = responses.reduce((acc, response) => {
    const hour = new Date(response.submittedAt).getHours()
    const hourKey = `${hour}h`
    acc[hourKey] = (acc[hourKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const peakHourData = Object.entries(responsesByHour).reduce((max, [hour, count]) => {
    return count > max.count ? { hour, count } : max
  }, { hour: "14h", count: 0 })

  const metrics = [
    {
      title: "Réponses totales",
      value: totalResponses.toLocaleString(),
      trend: responseTrend,
      change: Math.abs(totalResponses - previousMetrics.responses),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Vues totales",
      value: totalViews.toLocaleString(),
      trend: viewTrend,
      change: Math.abs(totalViews - previousMetrics.views),
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Taux de conversion",
      value: `${responseRate}%`,
      trend: completionTrend,
      change: Math.abs(completionRate - previousMetrics.completionRate).toFixed(1),
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Temps moyen",
      value: avgResponseTime,
      trend: 'stable',
      change: 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${metric.bgColor} transition-transform duration-200 hover:scale-110 hover:rotate-5`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              {metric.change > 0 && (
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.change > 0 ? `+${metric.change}` : metric.change}
                  </span>
                </div>
              )}
            </div>
            
            {/* Indicateur de performance en temps réel */}
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Temps réel</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Métriques avancées */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Métriques de performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="text-2xl font-bold text-blue-600">{peakHourData.hour}</div>
              <div className="text-sm text-gray-600">Heure de pointe</div>
              <div className="text-xs text-gray-500 mt-1">
                {peakHourData.count} réponse{peakHourData.count > 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600">
                {responses.length > 0 ? Math.round(responses.length / 7) : 0}
              </div>
              <div className="text-sm text-gray-600">Réponses/jour (moy.)</div>
              <div className="text-xs text-gray-500 mt-1">7 derniers jours</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="text-2xl font-bold text-orange-600">
                {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">Dernière MAJ</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((Date.now() - lastRefresh.getTime()) / 1000)}s ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
