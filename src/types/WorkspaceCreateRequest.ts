// src/types/WorkspaceCreateRequest.ts

export type WorkspaceType = 'BR' | 'INTERNATIONAL'

export interface WorkspaceCreateRequest {
  name: string
  description?: string
  legalDocument?: string
  country: string // ISO 3166-1 alpha-2
  currency?: string // ISO 4217 opcional, pode ser inferido pelo país
}
