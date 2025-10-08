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

export function ChartDemo() {
  // Données de démonstration
  const barData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Réponses reçues',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: '#E40046',
        borderColor: '#E40046',
        borderWidth: 1,
      },
    ],
  }

  const pieData = {
    labels: ['Très satisfait', 'Satisfait', 'Neutre', 'Mécontent', 'Très mécontent'],
    datasets: [
      {
        label: 'Satisfaction',
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
          '#E40046',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
        ],
        borderColor: [
          '#E40046',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
        ],
        borderWidth: 1,
      },
    ],
  }

  const lineData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
    datasets: [
      {
        label: 'Taux de complétion',
        data: [65, 72, 78, 85],
        borderColor: '#4ECDC4',
        backgroundColor: '#4ECDC4',
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Exemple de graphique',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Graphique en barres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={barData} options={options} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graphique circulaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Pie data={pieData} options={options} />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Graphique linéaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={lineData} options={options} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

