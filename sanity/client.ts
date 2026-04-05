import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

// Client without CDN for real-time data
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})
