"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface OverviewChartsProps {
  form: any
  responses: any[]
  analyzeQuestionResponses: (questionId: string) => {
    totalResponses: number
    responseCounts: Record<string, number>
    uniqueResponses: number
  }
}

const COLORS = [
  '#E40046', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#FF9F43', '#6C5CE7', '#A29BFE', '#FD79A8'
]

export function OverviewCharts({ form, responses, analyzeQuestionResponses }: OverviewChartsProps) {
  
  // Graphique de réponses par jour
  const getResponsesByDay = () => {
    const responsesByDay: Record<string, number> = {}
    
    responses.forEach(response => {
      const date = response.submittedAt.toISOString().split('T')[0]
      responsesByDay[date] = (responsesByDay[date] || 0) + 1
    })
    
    const sortedDays = Object.keys(responsesByDay).sort()
    
    return {
      labels: sortedDays.map(day => new Date(day).toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      data: sortedDays.map(day => responsesByDay[day])
    }
  }

  // Graphique des types de questions
  const getQuestionTypes = () => {
    const questionTypes: Record<string, number> = {}
    
    form.questions.forEach((question: any) => {
      questionTypes[question.type] = (questionTypes[question.type] || 0) + 1
    })
    
    return {
      labels: Object.keys(questionTypes),
      data: Object.values(questionTypes)
    }
  }

  // Graphique de taux de réponse par question
  const getResponseRates = () => {
    const questionRates = form.questions.map((question: any, index: number) => {
      const analysis = analyzeQuestionResponses(question.id)
      return {
        question: `Q${index + 1}`,
        rate: analysis.totalResponses
      }
    })
    
    return {
      labels: questionRates.map(q => q.question),
      data: questionRates.map(q => q.rate)
    }
  }

  const responsesByDay = getResponsesByDay()
  const questionTypes = getQuestionTypes()
  const responseRates = getResponseRates()

  const dayChartData = {
    labels: responsesByDay.labels,
    datasets: [
      {
        label: 'Réponses par jour',
        data: responsesByDay.data,
        backgroundColor: '#E40046',
        borderColor: '#E40046',
        borderWidth: 1,
      },
    ],
  }

  const typeChartData = {
    labels: questionTypes.labels,
    datasets: [
      {
        label: 'Nombre de questions',
        data: questionTypes.data,
        backgroundColor: COLORS.slice(0, questionTypes.labels.length),
        borderColor: COLORS.slice(0, questionTypes.labels.length).map(color => color + '80'),
        borderWidth: 1,
      },
    ],
  }

  const rateChartData = {
    labels: responseRates.labels,
    datasets: [
      {
        label: 'Nombre de réponses',
        data: responseRates.data,
        backgroundColor: '#4ECDC4',
        borderColor: '#4ECDC4',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Réponses par jour */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des réponses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={dayChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Réponses reçues par jour',
                },
              },
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Types de questions */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des types de questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Pie data={typeChartData} options={{
              ...pieOptions,
              plugins: {
                ...pieOptions.plugins,
                title: {
                  ...pieOptions.plugins.title,
                  text: 'Types de questions utilisées',
                },
              },
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Taux de réponse par question */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Nombre de réponses par question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={rateChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Réponses reçues par question',
                },
              },
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

