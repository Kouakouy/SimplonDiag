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

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

interface FormChartsProps {
  questionId: string
  questionTitle: string
  questionType: string
  responseCounts: Record<string, number>
  totalResponses: number
}

const COLORS = [
  '#E40046', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#FF9F43', '#6C5CE7', '#A29BFE', '#FD79A8'
]

export function FormCharts({ 
  questionId, 
  questionTitle, 
  questionType, 
  responseCounts, 
  totalResponses 
}: FormChartsProps) {
  
  const labels = Object.keys(responseCounts)
  const data = Object.values(responseCounts)
  const colors = labels.map((_, index) => COLORS[index % COLORS.length])

  const chartData: ChartData = {
    labels,
    datasets: [
      {
        label: 'Nombre de réponses',
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: questionTitle,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y || context.parsed
            const percentage = ((value / totalResponses) * 100).toFixed(1)
            return `${context.label}: ${value} (${percentage}%)`
          }
        }
      }
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
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: questionTitle,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed
            const percentage = ((value / totalResponses) * 100).toFixed(1)
            return `${context.label}: ${value} (${percentage}%)`
          }
        }
      }
    },
  }

  // Choisir le type de graphique selon le type de question
  // - Histogrammes (barres) : checkboxes, ratings (choix multiples possibles)
  // - Graphiques en disque (circulaires) : radios, selects, booléens (choix unique)
  const renderChart = () => {
    switch (questionType) {
      case 'radio':
      case 'select':
      case 'boolean':
        // Graphiques en disque (circulaires) pour les radios, selects et booléens
        return (
          <div className="h-80">
            <Pie data={chartData} options={pieOptions} />
          </div>
        )
      
      case 'checkbox':
      case 'rating':
        // Histogrammes (graphiques en barres) pour les checkboxes et ratings
        return (
          <div className="h-80">
            <Bar data={chartData} options={options} />
          </div>
        )
      
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
      case 'date':
        // Pour les questions ouvertes, on peut faire un graphique des mots les plus fréquents
        return renderTextAnalysis()
      
      default:
        // Par défaut, utiliser des histogrammes
        return (
          <div className="h-80">
            <Bar data={chartData} options={options} />
          </div>
        )
    }
  }

  const renderTextAnalysis = () => {
    // Pour les questions ouvertes, on affiche les réponses les plus fréquentes
    const sortedResponses = Object.entries(responseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 des réponses les plus fréquentes

    if (sortedResponses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune réponse pour cette question</p>
        </div>
      )
    }

    const textChartData: ChartData = {
      labels: sortedResponses.map(([label]) => 
        label.length > 30 ? label.substring(0, 30) + '...' : label
      ),
      datasets: [
        {
          label: 'Fréquence',
          data: sortedResponses.map(([, count]) => count),
          backgroundColor: COLORS.slice(0, sortedResponses.length),
          borderColor: COLORS.slice(0, sortedResponses.length).map(color => color + '80'),
          borderWidth: 1,
        },
      ],
    }

    return (
      <div className="h-80">
        <Bar data={textChartData} options={options} />
      </div>
    )
  }

  if (totalResponses === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune réponse pour cette question</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {renderChart()}
      
      {/* Statistiques additionnelles */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-[#E40046]">{totalResponses}</div>
          <div className="text-sm text-gray-600">Total réponses</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-[#E40046]">{labels.length}</div>
          <div className="text-sm text-gray-600">Options uniques</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-[#E40046]">
            {Math.max(...data)}
          </div>
          <div className="text-sm text-gray-600">Réponse la plus fréquente</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-[#E40046]">
            {((Math.max(...data) / totalResponses) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Part de la réponse principale</div>
        </div>
      </div>
    </div>
  )
}
