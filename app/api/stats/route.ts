import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET statistics
export async function GET() {
  try {
    const [stats] = await query<any[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost_count,
        SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed_count,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_count
      FROM items
    `)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
