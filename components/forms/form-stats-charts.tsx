"use client"

// Composant de statistiques détaillées avec Chart.js
import { useState } from "react"
import type { Form, FormResponse } from "@/types/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Calendar,
  Eye
} from "lucide-react"

interface FormStatsChartsProps {
  form: Form
  responses?: FormResponse[]
  serverStats?: { views: number; submissions: number; completionRate: number } | null
}

export function FormStatsCharts({ form, responses = [], serverStats }: FormStatsChartsProps) {
  const [timeRange, setTimeRange] = useState("7d")

  // Données simulées pour les graphiques
  const responsesByDay = [
    { date: "Lun", responses: 12, views: 45 },
    { date: "Mar", responses: 19, views: 67 },
    { date: "Mer", responses: 8, views: 34 },
    { date: "Jeu", responses: 15, views: 52 },
    { date: "Ven", responses: 22, views: 78 },
    { date: "Sam", responses: 6, views: 23 },
    { date: "Dim", responses: 4, views: 18 },
  ]

  const responsesByHour = [
    { hour: "00h", responses: 2 },
    { hour: "06h", responses: 5 },
    { hour: "09h", responses: 18 },
    { hour: "12h", responses: 25 },
    { hour: "15h", responses: 22 },
    { hour: "18h", responses: 15 },
    { hour: "21h", responses: 8 },
  ]

  const deviceStats = [
    { name: "Desktop", value: 65, color: "#3b82f6" },
    { name: "Mobile", value: 30, color: "#ec4899" },
    { name: "Tablette", value: 5, color: "#10b981" },
  ]

  // Stats question basées sur les réponses
  const questionStats = form.questions.map((question, index) => {
    let count = 0
    responses.forEach(r => {
      const v = r.answers[question.id]
      if (Array.isArray(v)) count += v.length > 0 ? 1 : 0
      else if (v !== undefined && v !== null && String(v).trim() !== "") count += 1
    })
    return {
      question: `Q${index + 1}`,
      responses: count,
      completionRate: responses.length > 0 ? Math.round((count / responses.length) * 100) : 0,
    }
  })

  const totalResponses = responses.length
  const totalViews = serverStats?.views ?? totalResponses * 3
  const responseRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : 0
  const avgCompletionTime = "2m 34s"

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalResponses}</div>
            <div className="text-sm text-gray-600 mb-2">Total réponses</div>
            <div className="text-xs text-green-600">+12% cette semaine</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalViews}</div>
            <div className="text-sm text-gray-600 mb-2">Vues totales</div>
            <div className="text-xs text-green-600">+8% cette semaine</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{responseRate}%</div>
            <div className="text-sm text-gray-600 mb-2">Taux de réponse</div>
            <div className="text-xs text-green-600">+3.2% cette semaine</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{avgCompletionTime}</div>
            <div className="text-sm text-gray-600 mb-2">Temps moyen</div>
            <div className="text-xs text-green-600">-15s cette semaine</div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">3 derniers mois</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Réponses par jour */}
        <Card>
          <CardHeader>
            <CardTitle>Réponses par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responsesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="responses" stroke="#ec4899" strokeWidth={2} name="Réponses" />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Vues" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Réponses par heure */}
        <Card>
          <CardHeader>
            <CardTitle>Réponses par heure</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responsesByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par appareil */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par appareil</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance des questions */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#f59e0b" name="Réponses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Détails des questions */}
      <Card>
        <CardHeader>
          <CardTitle>Détails des questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {form.questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {index + 1}. {question.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{question.type}</span>
                    <span>•</span>
                    <span>{question.required ? "Obligatoire" : "Optionnel"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="text-sm text-gray-500">Réponses</div>
                  </div>
                  <Badge variant="outline">
                    {Math.floor(Math.random() * 30) + 70}% complétion
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
