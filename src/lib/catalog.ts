import type {
  Application,
  ApplicationId,
  Catalog,
  SearchResult,
  SearchResultGroup,
} from '@/types'

/** Applications visible under the current catalog mode. */
export function visibleApplications(catalog: Catalog, normalMode: boolean): Application[] {
  if (!normalMode) return catalog.applications
  return catalog.applications.filter((app) => catalog.normalModeApps.includes(app.id))
}

/** Looks up an application, falling back to the first one. */
export function applicationById(catalog: Catalog, id: ApplicationId): Application {
  return catalog.applications.find((app) => app.id === id) ?? catalog.applications[0]!
}

/**
 * Finds the application that owns a module, matching both top-level modules
 * and the children of grouping modules.
 */
export function applicationOfModule(catalog: Catalog, moduleName: string): Application {
  for (const app of catalog.applications) {
    for (const module of app.modules) {
      if (module.label === moduleName) return app
      if (module.children?.includes(moduleName)) return app
    }
  }
  return catalog.applications[0]!
}

/** Words too generic to signal that two modules are related. */
const UNINFORMATIVE = new Set(['new', 'the', 'and', 'of', 'for'])

/** Significant lowercase words in a module name. */
function significantWords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !UNINFORMATIVE.has(word))
}

/**
 * Openable modules sitting alongside the named one, for offering a way
 * forward when it will not open.
 *
 * Grouping modules are replaced by their children, since only children are
 * openable, and anything the catalog already knows to be broken is left out —
 * a dead end that recommends another dead end is worse than no suggestion.
 *
 * Ordering puts modules that share a word with the failing one first. It is a
 * crude measure of relatedness, but catalog order alone answers "Unified Map
 * is unavailable" with three performance modules, when the other maps are
 * sitting right there.
 */
export function siblingModules(catalog: Catalog, moduleName: string, limit: number): string[] {
  const app = applicationOfModule(catalog, moduleName)
  const words = new Set(significantWords(moduleName))

  return app.modules
    .flatMap((module) => module.children ?? [module.label])
    .filter((name) => name !== moduleName && !(name in catalog.failingModules))
    .map((name, index) => ({
      name,
      index,
      shared: significantWords(name).filter((word) => words.has(word)).length,
    }))
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.name)
}

/** True when the module exists anywhere in the supplied applications. */
export function moduleExists(applications: Application[], moduleName: string): boolean {
  return applications.some((app) =>
    app.modules.some(
      (module) => module.label === moduleName || (module.children?.includes(moduleName) ?? false),
    ),
  )
}

/**
 * Searches the catalog, grouping hits by depth so the palette can show apps
 * before modules before submodules. Matching is a plain substring test
 * against the item's own name and its children's names, which keeps
 * "performance" surfacing the group that contains it.
 */
export function searchCatalog(applications: Application[], query: string): SearchResultGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const matches = (name: string, extra?: string) =>
    name.toLowerCase().includes(q) || (extra ?? '').toLowerCase().includes(q)

  const apps: SearchResult[] = []
  const modules: SearchResult[] = []
  const submodules: SearchResult[] = []

  for (const app of applications) {
    const appLabel = app.short ?? app.label

    if (matches(app.label, app.modules.map((m) => m.label).join(' '))) {
      apps.push({
        kind: 'app',
        type: 'App',
        id: app.id,
        label: app.label,
        path: 'Network Insight · Application',
        icon: app.icon,
      })
    }

    for (const module of app.modules) {
      if (matches(module.label, (module.children ?? []).join(' '))) {
        modules.push({
          kind: 'module',
          type: 'Module',
          label: module.label,
          path: appLabel,
          icon: app.icon,
        })
      }

      for (const child of module.children ?? []) {
        if (matches(child, module.label)) {
          submodules.push({
            kind: 'module',
            type: 'Submodule',
            label: child,
            path: `${appLabel} · ${module.label}`,
            icon: app.icon,
          })
        }
      }
    }
  }

  const groups: SearchResultGroup[] = []
  if (apps.length) groups.push({ label: 'Apps', items: apps })
  if (modules.length) groups.push({ label: 'Modules', items: modules })
  if (submodules.length) groups.push({ label: 'Submodules', items: submodules })
  return groups
}

/** Flattens grouped results into the order the keyboard cursor walks. */
export function flattenResults(groups: SearchResultGroup[]): SearchResult[] {
  return groups.flatMap((group) => group.items)
}
