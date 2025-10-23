import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://evmarket.com'
  
  // Static pages
  const routes = [
    '',
    '/home',
    '/vehicles',
    '/batteries',
    '/auctions',
    '/browse',
    '/sell',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Add dynamic routes (you can fetch from API)
  // Example:
  // const vehicles = await getVehicles()
  // const vehicleRoutes = vehicles.map((vehicle) => ({
  //   url: `${baseUrl}/vehicle/${vehicle.id}`,
  //   lastModified: vehicle.updatedAt,
  //   changeFrequency: 'weekly',
  //   priority: 0.6,
  // }))

  return [
    ...routes,
    // ...vehicleRoutes,
  ]
}
