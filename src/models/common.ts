// Common interface definitions for the DevToolBox application

export interface BaseComponent {
  className?: string;
  id?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: ToolCategory;
}

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: string;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export type ToolCategory = 'security' | 'generator' | 'encoder' | 'validator' | 'formatter';