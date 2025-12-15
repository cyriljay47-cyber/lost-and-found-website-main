import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Item, CreateItemInput } from "@/lib/types"

// GET all items with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    console.log("Query params:", { type, status, category, search })

    let sql = "SELECT * FROM items WHERE 1=1"
    const params: any[] = []

    if (type) {
      sql += " AND type = ?"
      params.push(type)
    }

    if (status) {
      sql += " AND status = ?"
      params.push(status)
    }

    if (category) {
      sql += " AND category = ?"
      params.push(category)
    }

    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += " ORDER BY date_reported DESC"

    console.log("SQL:", sql, "Params:", params)

    const items = await query<Item[]>(sql, params)
    console.log("Items fetched:", items.length)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    const body: CreateItemInput = await request.json()

    const sql = `
      INSERT INTO items (type, title, description, category, location, date_reported, contact_name, contact_email, contact_phone, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      body.type,
      body.title,
      body.description,
      body.category,
      body.location,
      body.date_reported,
      body.contact_name,
      body.contact_email,
      body.contact_phone || null,
      body.image_url || null,
    ]

    const result: any = await query(sql, params)

    // Fetch the created item
    const [newItem] = await query<Item[]>("SELECT * FROM items WHERE id = ?", [result.insertId])

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
