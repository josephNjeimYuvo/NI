import type { Application, ApplicationId, NavigationTree } from '@/types'

/**
 * The application catalog.
 *
 * Modules listed with `children` are groupings — clicking one expands it
 * rather than opening a screen. Everything else is directly openable.
 */
export const APPLICATIONS: Application[] = [
  {
    id: 'ran',
    label: 'RAN Analytics Application',
    short: 'RAN Analytics',
    icon: 'ran',
    modules: [
      {
        label: 'Performance Optimization Analytics',
        children: [
          'UMTS Performance Optimization',
          'LTE Performance Optimization',
          'LTE Performance Details',
          'UMTS Performance Details',
        ],
      },
      { label: 'Map Analysis', children: ['Coverage Map', 'Interference Map'] },
      { label: 'NI Audit', children: ['NOK LTE NI CM Dump', 'ERI LTE NI CM Dump', 'Audit Summary'] },
      { label: 'RAN 4G Dashboard (New)' },
      { label: 'Unified Map (New)' },
    ],
  },
  {
    id: 'core',
    label: 'Core Analytics',
    icon: 'core',
    modules: [
      { label: 'Core CCPC' },
      { label: 'Core KPI Browser' },
      { label: 'Signalling Analytics' },
      { label: 'Subscriber Trace', children: ['Trace Sessions', 'Trace Rules'] },
    ],
  },
  {
    id: 'fault',
    label: 'Fault Management',
    icon: 'fault',
    modules: [
      { label: 'Active Alarms' },
      { label: 'Alarm History' },
      { label: 'Alarm Correlation' },
      { label: 'Fault Dashboards', children: ['Regional Faults', 'Vendor Faults'] },
    ],
  },
  {
    id: 'data',
    label: 'Data Management',
    icon: 'data',
    modules: [
      { label: 'Metrics-Alarms' },
      { label: 'Data Profiles' },
      { label: 'Correlations' },
      { label: 'Threshold System Settings' },
      { label: 'Events Alarms' },
      { label: 'Data Loaders', children: ['File Loader', 'Stream Loader'] },
    ],
  },
  {
    id: 'netopt',
    label: 'Network Optimization',
    icon: 'netopt',
    modules: [
      { label: 'Optimization Automation' },
      { label: 'Parameter Audit' },
      { label: 'Neighbour Optimization' },
      { label: 'Capacity Planning' },
    ],
  },
  {
    id: 'custom',
    label: 'Customized Dashboards',
    icon: 'dash',
    modules: [
      { label: 'My Dashboards' },
      { label: 'Shared Dashboards' },
      { label: 'Dashboard Builder' },
    ],
  },
  {
    id: 'siteint',
    label: 'Site Integration',
    icon: 'site',
    modules: [
      { label: 'Input Builder - ERC' },
      { label: 'Site Onboarding' },
      { label: 'Integration Status' },
      { label: 'Script Library', children: ['ERC Scripts', 'MOP Templates'] },
    ],
  },
  {
    id: 'exec',
    label: 'Executive Dashboards',
    icon: 'exec',
    modules: [{ label: 'Network Health' }, { label: 'KPI Scorecard' }, { label: 'SLA Compliance' }],
  },
  {
    id: 'autom',
    label: 'Automation Framework',
    icon: 'auto',
    modules: [
      { label: 'Workflows' },
      { label: 'Job Scheduler' },
      { label: 'Run History' },
      { label: 'Automation Rules', children: ['Trigger Rules', 'Action Rules'] },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'admin',
    modules: [
      { label: 'Users' },
      { label: 'Roles & Permissions' },
      { label: 'System Settings' },
      { label: 'Audit Log' },
      { label: 'License' },
    ],
  },
  {
    id: 'react',
    label: 'React Component',
    icon: 'react',
    modules: [{ label: 'Sample Widget' }, { label: 'Chart Playground' }],
  },
]

/**
 * Sidebar navigation, which groups some modules by vendor rather than by the
 * catalog structure above. The two views intentionally differ: the catalog is
 * organised for discovery, the sidebar for day-to-day access.
 */
export const NAVIGATION: Record<ApplicationId, NavigationTree> = {
  ran: {
    vendors: [
      {
        name: 'Nokia',
        items: [
          'UMTS Performance Optimization',
          'LTE Performance Optimization',
          'NOK LTE NI CM Dump',
        ],
      },
      {
        name: 'Ericsson',
        items: ['LTE Performance Details', 'UMTS Performance Details', 'ERI LTE NI CM Dump'],
      },
      { name: 'Huawei', items: ['Audit Summary'] },
    ],
    items: ['Coverage Map', 'Interference Map', 'RAN 4G Dashboard (New)', 'Unified Map (New)'],
  },
  core: {
    vendors: [
      { name: 'Cisco', items: ['Core CCPC', 'Core KPI Browser'] },
      { name: 'Juniper', items: ['Signalling Analytics'] },
    ],
    items: ['Trace Sessions', 'Trace Rules'],
  },
  fault: {
    items: ['Active Alarms', 'Alarm History', 'Alarm Correlation', 'Regional Faults', 'Vendor Faults'],
  },
  data: {
    items: [
      'Metrics-Alarms',
      'Data Profiles',
      'Correlations',
      'Threshold System Settings',
      'Events Alarms',
      'File Loader',
      'Stream Loader',
    ],
  },
  netopt: {
    items: [
      'Optimization Automation',
      'Parameter Audit',
      'Neighbour Optimization',
      'Capacity Planning',
    ],
  },
  custom: { items: ['My Dashboards', 'Shared Dashboards', 'Dashboard Builder'] },
  siteint: {
    vendors: [
      { name: 'Nokia', items: ['Input Builder - ERC', 'ERC Scripts'] },
      { name: 'Ericsson', items: ['MOP Templates'] },
    ],
    items: ['Site Onboarding', 'Integration Status'],
  },
  exec: { items: ['Network Health', 'KPI Scorecard', 'SLA Compliance'] },
  autom: { items: ['Workflows', 'Job Scheduler', 'Run History', 'Trigger Rules', 'Action Rules'] },
  admin: { items: ['Users', 'Roles & Permissions', 'System Settings', 'Audit Log', 'License'] },
  react: { items: ['Sample Widget', 'Chart Playground'] },
}

/** Applications that stay visible when the catalog is in `Normal` mode. */
export const NORMAL_MODE_APPS: ApplicationId[] = ['ran', 'siteint', 'fault']

/** Modules wired to fail on open, so the error path stays exercised. */
export const FAILING_MODULES: string[] = ['Unified Map (New)']
