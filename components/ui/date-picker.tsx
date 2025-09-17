"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, X } from "lucide-react"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Sélectionner une date", className }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : "12:00"
  )

  const today = new Date()
  const currentMonth = selectedDate || today
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Générer les jours du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  
  // Jours vides au début
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  const handleDateSelect = (day: number) => {
    const newDate = new Date(year, month, day)
    
    // Ajouter l'heure sélectionnée
    const [hours, minutes] = selectedTime.split(':').map(Number)
    newDate.setHours(hours, minutes)
    
    setSelectedDate(newDate)
    // Ne pas fermer le modal automatiquement pour permettre de choisir l'heure
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(month - 1)
    } else {
      newDate.setMonth(month + 1)
    }
    setSelectedDate(newDate)
  }

  const clearDate = () => {
    setSelectedDate(undefined)
    onChange(undefined)
    setShowPicker(false)
  }

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative">
      <div className="flex">
        <Input
          value={selectedDate ? formatDisplayDate(selectedDate) : ""}
          placeholder={placeholder}
          className={`cursor-pointer pr-20 ${className}`}
          onClick={() => setShowPicker(true)}
          readOnly
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={clearDate}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => setShowPicker(true)}
          >
            <Calendar className="w-3 h-3 text-[#E40046]" />
          </Button>
        </div>
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            {/* En-tête du modal */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Sélectionner une date</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(false)}
                className="hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation du calendrier */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="hover:bg-gray-100"
              >
                ←
              </Button>
              <h4 className="font-semibold text-gray-800">
                {monthNames[month]} {year}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="hover:bg-gray-100"
              >
                →
              </Button>
            </div>

            {/* Noms des jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(dayName => (
                <div key={dayName} className="text-center text-xs font-medium text-gray-500 py-2">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`w-full h-full text-sm hover:bg-[#E40046] hover:text-white ${
                        selectedDate && 
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year
                          ? 'bg-[#E40046] text-white'
                          : day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                          ? 'bg-[#E40046]/10 text-[#E40046] font-semibold'
                          : 'hover:bg-[#E40046]/5'
                      }`}
                      onClick={() => handleDateSelect(day)}
                    >
                      {day}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Sélecteur d'heure personnalisé */}
            <div className="border-t pt-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#E40046]" />
                <span className="text-sm font-medium text-gray-700">Heure</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sélecteur d'heures */}
                <div className="flex-1">
                  <select
                    value={selectedTime.split(':')[0]}
                    onChange={(e) => {
                      const minutes = selectedTime.split(':')[1]
                      setSelectedTime(`${e.target.value}:${minutes}`)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E40046] focus:border-[#E40046] bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1 text-center">Heures</div>
                </div>
                
                <div className="text-xl font-bold text-gray-400">:</div>
                
                {/* Sélecteur de minutes */}
                <div className="flex-1">
                  <select
                    value={selectedTime.split(':')[1]}
                    onChange={(e) => {
                      const hours = selectedTime.split(':')[0]
                      setSelectedTime(`${hours}:${e.target.value}`)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E40046] focus:border-[#E40046] bg-white"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1 text-center">Minutes</div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPicker(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="bg-[#E40046] hover:bg-pink-700"
                onClick={() => {
                  if (selectedDate) {
                    const [hours, minutes] = selectedTime.split(':').map(Number)
                    const newDate = new Date(selectedDate)
                    newDate.setHours(hours, minutes)
                    onChange(newDate)
                  }
                  setShowPicker(false)
                }}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
