"use client"

import { useState, useEffect } from "react"
import { Search, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item } from "@/lib/types"
import Link from "next/link"
import { StatsCards } from "@/components/stats-cards"
import ImageLightbox from "@/components/image-lightbox"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all")
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
    // Check if user is logged in
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [activeTab, selectedCategory, searchQuery])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== "all") params.append("type", activeTab)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (searchQuery) params.append("search", searchQuery)
      params.append("status", "active")

      const response = await fetch(`/api/items?${params.toString()}`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    setUser(null)
    window.location.reload()
  }

  const categories = ["all", "Wallet", "Bag", "Electronics", "Keys", "Accessories", "Other"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L&F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lost & Found
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Reunite with your belongings</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <>
                  <div className="hidden sm:block text-right mr-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">Admin</Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
              <Link href="/report">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto animate-fadeInUp">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Find What You've Lost
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Join our community-driven platform to report lost items and help reunite people with their belongings.
              Every item returned brings a smile back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  Report Lost Item
                </Button>
              </Link>
              <Link href="#search">
                <Button variant="outline" size="lg" className="border-2 hover:bg-muted/50 transition-all duration-300">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <StatsCards />
      </div>

      {/* Main Content */}
      <main id="search" className="container mx-auto px-4 pb-12">
        {/* Filters */}
        <div className="mb-8 space-y-6 animate-slide-in-from-bottom">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Browse Items</h3>
            <p className="text-muted-foreground">Search through our database of lost and found items</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                All Items
              </TabsTrigger>
              <TabsTrigger value="lost" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-sm">
                Lost
              </TabsTrigger>
              <TabsTrigger value="found" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">
                Found
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by item name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 border-2 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No items found matching your criteria</p>
            <Link href="/report">
              <Button>Report an Item</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card 
                key={item.id} 
                className={`hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                  item.type === "lost" 
                    ? "bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-500" 
                    : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 hover:border-amber-500"
                } ${
                  item.status === "returned" ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                    <Badge className={`font-bold text-white ${
                      item.type === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
                    }`}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="font-semibold text-gray-700">{item.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  {item.image_url ? (
                    <div className="mb-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-32 md:h-40 object-cover rounded-md mb-3 cursor-pointer"
                        onClick={() => setLightboxSrc(item.image_url as string)}
                      />
                    </div>
                  ) : null}

                  <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{item.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-bold">📍 Location:</span> {item.location}
                    </div>
                    <div>
                      <span className="font-bold">📅 Date:</span> {new Date(item.date_reported).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/items/${item.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  )
}
