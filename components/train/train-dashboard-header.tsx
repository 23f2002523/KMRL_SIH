"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TrainDashboardHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  supervisorName?: string
}

export function TrainDashboardHeader({ 
  selectedDate, 
  onDateChange, 
  supervisorName = "Train Supervisor" 
}: TrainDashboardHeaderProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left side - Project Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🚆</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              AI-Driven Train Induction Planning
            </h1>
            <p className="text-sm text-gray-500">KMRL - Kochi Metro Rail Limited</p>
          </div>
        </div>
      </div>

      {/* Right side - Date Selector and Profile */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Planning Date:</span>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date)
                    setIsCalendarOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={supervisorName} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{supervisorName}</span>
            <span className="text-xs text-gray-500">Train Planner</span>
          </div>
        </div>
      </div>
    </div>
  )
}