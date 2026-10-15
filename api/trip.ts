import { getTrip } from '../server/tripRepository.js'

// GET /api/trip?id=hongkong-3d2n
export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? undefined
  const trip = await getTrip(id)
  if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 })
  return Response.json(trip, {
    headers: {
      // 瀏覽器每次都向伺服器確認，資料一改就看得到
      'Cache-Control': 'no-cache',
      // 只有 Vercel CDN 會快取（瀏覽器不讀這個標頭）
      'Vercel-CDN-Cache-Control': 'max-age=60, stale-while-revalidate=300',
    },
  })
}
