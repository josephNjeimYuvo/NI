import { mockServices } from './mock'
import type { Services } from './contracts'

/**
 * The single place the app binds to a data source.
 *
 * To point Network Insight at a real backend, implement the interfaces in
 * `./contracts` and swap the assignment below — no component or hook imports
 * anything from `./mock` directly.
 */
export const services: Services = mockServices

export * from './contracts'
