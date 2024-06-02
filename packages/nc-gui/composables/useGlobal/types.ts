import type { ComputedRef, Ref, ToRefs } from 'vue'
import type { WritableComputedRef } from '@vue/reactivity'
import type { JwtPayload } from 'jwt-decode'
import type { ProjectRoles } from 'nocodb-sdk'
import type { Language, NcProjectType, User, useCounter } from '#imports'

export interface AppInfo {
  ncSiteUrl: string
  authType: 'jwt' | 'none'
  connectToExternalDB: boolean
  defaultLimit: number
  defaultGroupByLimit: {
    limitGroup: number
    limitRecord: number
  }
  firstUser: boolean
  githubAuthEnabled: boolean
  googleAuthEnabled: boolean
  oidcAuthEnabled: boolean
  oidcProviderName: string | null
  ncMin: boolean
  oneClick: boolean
  baseHasAdmin: boolean
  teleEnabled: boolean
  auditEnabled: boolean
  type: string
  version: string
  ee?: boolean
  ncAttachmentFieldSize: number
  ncMaxAttachmentsAllowed: number
  isCloud: boolean
  automationLogLevel: 'OFF' | 'ERROR' | 'ALL'
  baseHostName?: string
  disableEmailAuth: boolean
  mainSubDomain?: string
  dashboardPath: string
  inviteOnlySignup: boolean
}

export interface StoredState {
  token: string | null
  lang: keyof typeof Language
  darkMode: boolean
  filterAutoSave: boolean
  previewAs: ProjectRoles | null
  includeM2M: boolean
  showNull: boolean
  currentVersion: string | null
  latestRelease: string | null
  hiddenRelease: string | null
  isMobileMode: boolean | null
  lastOpenedWorkspaceId: string | null
  entryConfig: EntryConfig | null
}

export interface EntryConfig {
  context?: string
  entryToken: string
  lang: string
  path: string
  email: string
  tid: string
  theme: string
  actorToken: string
  entryKey: string[]
  ws: number
  rs: number
  actorSource?: string
  services: { [key: string]: any }
  scope?: { paths: string[], sources: string[], bases: string[] }
  targetRoute?: string
  viewToken?: string
  subFrameToken?: string
}

export type State = ToRefs<Omit<StoredState, 'token'>> & {
  isSysM: Ref<boolean>
  pF: any
  entryConfig: Ref<EntryConfig | null>
  storage: Ref<StoredState>
  user: Ref<User | null>
  token: WritableComputedRef<StoredState['token']>
  jwtPayload: ComputedRef<(JwtPayload & User) | null>
  timestamp: Ref<number>
  runningRequests: ReturnType<typeof useCounter>
  error: Ref<any>
  appInfo: Ref<AppInfo>
}

export interface Getters {
  signedIn: ComputedRef<boolean>
  isLoading: WritableComputedRef<boolean>
}

export interface Actions {
  signOut: (skipRedirect?: boolean) => void
  drySignOut: () => void
  signIn: (token: string, entryConfig?: any, pF?: any) => void
  refreshToken: () => void
  loadAppInfo: () => void
  setIsMobileMode: (isMobileMode: boolean) => void
  navigateToProject: (params: { workspaceId?: string; baseId?: string; type?: NcProjectType; query?: any }) => void
  ncNavigateTo: (params: {
    workspaceId?: string
    baseId?: string
    type?: NcProjectType
    query?: any
    tableId?: string
    viewId?: string
  }) => void
  getBaseUrl: (workspaceId: string) => string | undefined
  getMainUrl: (workspaceId: string) => string | undefined
}

export type ReadonlyState = Readonly<Pick<State, 'token' | 'user'>> & Omit<State, 'token' | 'user'>

export type UseGlobalReturn = Getters & Actions & ReadonlyState
