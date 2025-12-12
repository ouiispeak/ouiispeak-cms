# slides_authoring (draft schema)

id: string
lesson_id: string
group_id: string
order_index: number

type: string  // matches SlideType, e.g. "ai-speak-repeat"
props_json: JSON
aid_hook: string | null

status: "draft" | "published"
version: number
updated_by: string
updated_at: timestamp
created_at: timestamp
