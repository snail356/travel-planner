import { getTrip } from '../server/tripRepository.js'

// GET /api/trip?id=hongkong-3d2n
export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? undefined
  const trip = await getTrip(id)
  if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 })
  return Response.json(trip, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  })
}
