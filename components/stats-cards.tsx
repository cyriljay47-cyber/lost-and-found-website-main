"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, CheckCircle2, AlertCircle } from "lucide-react"

interface Stats {
  total: number
  lost_count: number
  found_count: number
  active_count: number
  claimed_count: number
  returned_count: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error))
  }, [])

  if (!stats) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">All reported items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Lost Items</CardTitle>
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.lost_count}</div>
          <p className="text-xs text-muted-foreground mt-1">Items people are looking for</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Found Items</CardTitle>
          <Search className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.found_count}</div>
          <p className="text-xs text-muted-foreground mt-1">Items waiting to be claimed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Reunited</CardTitle>
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.returned_count}</div>
          <p className="text-xs text-muted-foreground mt-1">Successfully returned items</p>
        </CardContent>
      </Card>
    </div>
  )
}
